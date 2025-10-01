import { PrismaClient, PaymentStatus, Currency } from "@prisma/client";
import { charge } from "../payments/processor";
import { recordComplianceLog } from "../services/logs";
import { sendToUsers } from "../services/push";
import { pathToFileURL } from "url";

const prisma = new PrismaClient();

type AutopayOptions = {
  windowDays?: number; // how far ahead to pick up due schedules
  now?: Date; // useful for tests
};

export async function runAutopayOnce(opts: AutopayOptions = {}) {
  const now = opts.now ?? new Date();
  const windowDays = opts.windowDays ?? 1;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + windowDays);

  // 1) Find schedules due today (or within window), unpaid, with lease.autopayEnabled
  const due = await prisma.rentSchedule.findMany({
    where: {
      isPaid: false,
      dueOn: { gte: start, lt: end },
      lease: { autopayEnabled: true },
    },
    include: {
      lease: {
        include: {
          organization: true,
          participants: {
            include: { user: true },
          },
        },
      },
      payments: true, // prior attempts
    },
  });

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const sched of due) {
    // 1a) guard against duplicates: skip if a successful payment already exists for this schedule
    const priorSuccess = sched.payments.some((p) => p.status === PaymentStatus.SUCCEEDED);
    if (priorSuccess) continue;

    // 1b) find a default payment method for any tenant on this lease
    const tenantUserId =
      sched.lease.participants.find((p) => p.roleLabel?.toUpperCase() === "TENANT")?.userId ||
      sched.lease.participants[0]?.userId;

    if (!tenantUserId) {
      await recordComplianceLog({
        actor: "autopay",
        action: "AutopaySkipped_NoTenant",
        entity: `Lease:${sched.leaseId}/Schedule:${sched.id}`,
      });
      continue;
    }

    const defaultMethod = await prisma.paymentMethod.findFirst({
      where: { userId: tenantUserId, isDefault: true },
    });

    if (!defaultMethod) {
      await recordComplianceLog({
        actor: "autopay",
        action: "AutopaySkipped_NoDefaultMethod",
        entity: `Lease:${sched.leaseId}/Schedule:${sched.id}`,
      });
      continue;
    }

    processed++;

    // 2) Create INITIATED payment
    const payment = await prisma.payment.create({
      data: {
        leaseId: sched.leaseId,
        scheduleId: sched.id,
        methodId: defaultMethod.id,
        amount: sched.amount,
        status: PaymentStatus.INITIATED,
        organizationId: sched.lease.organizationId,
        notes: "Autopay",
      },
    });

    // 3) Charge PSP
    const currency: Currency = sched.lease.currency ?? "USD";
    const amountDollars = Number(sched.amount);
    const res = await charge({
      amount: amountDollars,
      currency,
      methodExternalRef: defaultMethod.externalRef ?? undefined,
      metadata: {
        leaseId: sched.leaseId,
        scheduleId: sched.id,
        paymentId: payment.id,
      },
    });

    if (res.ok) {
      // 4) mark success
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          externalRef: res.id,
          completedAt: new Date(),
        },
      });
      await prisma.rentSchedule.update({
        where: { id: sched.id },
        data: { isPaid: true },
      });

      // Optional: create a simple receipt row
      await prisma.receipt.create({
        data: {
          organizationId: sched.lease.organizationId,
          leaseId: sched.leaseId,
          scheduleId: sched.id,
          paymentId: payment.id,
          number: `R-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          amount: sched.amount,
          issuedAt: new Date(),
        },
      });

      succeeded++;
      await recordComplianceLog({
        actor: "autopay",
        action: "PaymentSucceeded",
        entity: `Payment:${payment.id}`,
      });

      await sendToUsers([tenantUserId], {
        title: "Autopay successful",
        body: `We received your rent payment of $${amountDollars.toFixed(2)}.`,
        data: { paymentId: payment.id },
      });

      // Log the run (uses SyncLog as generic job log)
      await prisma.syncLog.create({
        data: {
          organizationId: sched.lease.organizationId,
          integrationId: (await ensureAutopayLogIntegration(sched.lease.organizationId)).id,
          scope: "autopay",
          status: "success",
          itemCount: 1,
          message: `Autopay success for schedule ${sched.id}`,
        },
      });
    } else {
      // 5) mark failure
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, notes: res.error },
      });

      failed++;
      await recordComplianceLog({
        actor: "autopay",
        action: "PaymentFailed",
        entity: `Payment:${payment.id} - ${res.error}`,
      });

      await sendToUsers([tenantUserId], {
        title: "Autopay failed",
        body: "We couldn't process your rent payment. Please update your payment method.",
        data: { scheduleId: sched.id },
      });

      await prisma.syncLog.create({
        data: {
          organizationId: sched.lease.organizationId,
          integrationId: (await ensureAutopayLogIntegration(sched.lease.organizationId)).id,
          scope: "autopay",
          status: "error",
          itemCount: 0,
          message: `Autopay failed for schedule ${sched.id}: ${res.error}`,
        },
      });
    }
  }

  return { processed, succeeded, failed };
}

// Use IntegrationAccount table as a neutral logging target for job runs
async function ensureAutopayLogIntegration(organizationId: string) {
  const existing = await prisma.integrationAccount.findFirst({
    where: { organizationId, provider: "WAVE" }, // arbitrary; reuse a slot for logging only
  });
  if (existing) return existing;
  return prisma.integrationAccount.create({
    data: {
      organizationId,
      provider: "WAVE",
      enabled: false,
      displayName: "System Logs (Autopay)",
    },
  });
}

// ESM-safe main execution guard
const isMain = (() => {
  try {
    const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
    return import.meta.url === entry;
  } catch {
    return false;
  }
})();

if (isMain) {
  (async () => {
    try {
      const r = await runAutopayOnce();
      // eslint-disable-next-line no-console
      console.log("Autopay summary:", r);
      process.exit(0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Autopay error:", e);
      process.exit(1);
    }
  })();
}
