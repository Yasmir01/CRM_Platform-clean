import { PrismaClient } from "@prisma/client";
import { generateReceiptPdf } from "../utils/receiptPdf";
import { uploadFileMock } from "../utils/uploader";

const prisma = new PrismaClient();

export async function createAndStoreReceipt({
  paymentId,
}: {
  paymentId: string;
}) {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: {
      lease: {
        include: {
          participants: { include: { user: true } },
          property: true,
        },
      },
    },
  });

  const tenant =
    payment.lease.participants.find((p) => p.roleLabel === "TENANT")?.user?.name ||
    "Tenant";

  const receipt = await prisma.receipt.create({
    data: {
      organizationId: payment.organizationId,
      leaseId: payment.leaseId,
      scheduleId: payment.scheduleId ?? undefined,
      paymentId: payment.id,
      number: `R-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`,
      amount: payment.amount,
      issuedAt: new Date(),
    },
  });

  const localPath = await generateReceiptPdf({
    receiptId: receipt.id,
    tenant,
    property: payment.lease.property.name,
    unit: "Unit",
    amount: payment.amount.toString(),
    status: payment.status,
    method: payment.methodId ?? "Unknown",
    issuedAt: receipt.issuedAt,
  });

  const url = await uploadFileMock(localPath);

  await prisma.receipt.update({
    where: { id: receipt.id },
    data: { pdfUrl: url },
  });

  return { ...receipt, pdfUrl: url };
}
