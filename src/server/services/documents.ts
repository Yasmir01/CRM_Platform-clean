import { PrismaClient, ESignStatus } from "@prisma/client";
import { saveLeaseFile, getSignedLeaseUrl } from "../utils/uploadLeaseFile";

const prisma = new PrismaClient();

export async function listLeaseDocuments(leaseId: string) {
  return prisma.leaseDocument.findMany({ where: { leaseId }, orderBy: { createdAt: "desc" } });
}

export async function uploadLeaseDocument({
  leaseId,
  uploadedById,
  file,
  mimeType,
}: {
  leaseId: string;
  uploadedById?: string;
  file: { buffer: Buffer; originalName: string };
  mimeType?: string;
}) {
  const saved = await saveLeaseFile(file);
  return prisma.leaseDocument.create({
    data: {
      leaseId,
      uploadedById,
      filename: saved.filename,
      mimeType,
      sizeBytes: saved.sizeBytes,
      storageKey: saved.storageKey,
      isPrivate: true,
    },
  });
}

export async function getLeaseDocumentUrl(documentId: string) {
  const doc = await prisma.leaseDocument.findUniqueOrThrow({ where: { id: documentId } });
  return getSignedLeaseUrl(doc.storageKey);
}

export async function createEnvelope({
  leaseId,
  documentId,
  subject,
  message,
  signers,
  provider = "DOCUSIGN",
  createdById,
}: {
  leaseId: string;
  documentId: string;
  subject?: string;
  message?: string;
  signers: { name: string; email: string; role?: string }[];
  provider?: string;
  createdById?: string;
}) {
  const providerEnvId = `stub_${Math.random().toString(36).slice(2)}`;
  return prisma.eSignEnvelope.create({
    data: {
      leaseId,
      documentId,
      provider,
      providerEnvId,
      status: ESignStatus.SENT,
      subject,
      message,
      signersJson: JSON.stringify(signers),
      createdById,
    },
  });
}

export async function markEnvelopeStatus(envelopeId: string, status: ESignStatus) {
  return prisma.eSignEnvelope.update({ where: { id: envelopeId }, data: { status } });
}
