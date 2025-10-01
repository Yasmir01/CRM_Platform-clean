import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { recordComplianceLog } from "./logs";
import { sendToUsers } from "./push";

const prisma = new PrismaClient();

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function saveWorkOrderFile(file: { buffer: Buffer; originalName: string }) {
  const dir = path.join(process.cwd(), "public", "workorders");
  ensureDir(dir);
  const ext = path.extname(file.originalName) || "";
  const name = `wo_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
  const dest = path.join(dir, name);
  await fs.promises.writeFile(dest, file.buffer);
  return `/workorders/${name}`;
}

export async function addWorkOrderMessage({
  workOrderId,
  authorId,
  body,
  file,
}: {
  workOrderId: string;
  authorId?: string;
  body?: string;
  file?: { buffer: Buffer; originalName: string };
}) {
  let attachmentUrl: string | null = null;

  if (file) {
    attachmentUrl = await saveWorkOrderFile(file);
    await prisma.workOrderAttachment.create({
      data: {
        workOrderId,
        uploadedBy: authorId,
        url: attachmentUrl,
        filename: file.originalName,
      },
    });
  }

  const msg = await prisma.workOrderMessage.create({
    data: {
      workOrderId,
      authorId,
      body: body || "",
    },
  });

  const wo = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    select: { reportedById: true, assignedVendorId: true, title: true },
  });
  const recipients: string[] = [];
  if (wo?.reportedById && wo.reportedById !== authorId) recipients.push(wo.reportedById);
  if (wo?.assignedVendorId && wo.assignedVendorId !== authorId) recipients.push(wo.assignedVendorId);
  if (recipients.length) {
    await sendToUsers(recipients, {
      title: "New maintenance message",
      body: body ? body.slice(0, 100) : "Attachment sent",
      data: { workOrderId },
    });
  }

  await recordComplianceLog({
    actor: authorId || "system",
    action: "WOMessage",
    entity: `WO:${workOrderId}`,
  });

  return { msg, attachmentUrl };
}
