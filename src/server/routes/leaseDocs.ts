import express from "express";
import multer from "multer";
import {
  listLeaseDocuments,
  uploadLeaseDocument,
  getLeaseDocumentUrl,
  createEnvelope,
  markEnvelopeStatus,
} from "../services/documents";
import { ESignStatus } from "@prisma/client";

const upload = multer();
const router = express.Router();

function getUserId(req: express.Request) {
  return (req.headers["x-user-id"] as string) || "tenant1";
}

router.get("/:leaseId/documents", async (req, res) => {
  try {
    const docs = await listLeaseDocuments(req.params.leaseId);
    res.json(docs);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

router.post("/:leaseId/documents", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const doc = await uploadLeaseDocument({
      leaseId: req.params.leaseId,
      uploadedById: getUserId(req),
      file: { buffer: req.file.buffer, originalName: req.file.originalname },
      mimeType: req.file.mimetype,
    });
    res.json(doc);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

router.get("/:leaseId/documents/:docId/download", async (req, res) => {
  try {
    const url = await getLeaseDocumentUrl(req.params.docId);
    res.json({ url });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: "Failed to get URL" });
  }
});

router.post("/:leaseId/esign/envelopes", async (req, res) => {
  try {
    const { documentId, subject, message, signers } = req.body || {};
    const env = await createEnvelope({
      leaseId: req.params.leaseId,
      documentId,
      subject,
      message,
      signers: signers || [],
      createdById: getUserId(req),
    });
    res.json(env);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: "Failed to create envelope" });
  }
});

router.post("/esign/webhook", async (req, res) => {
  try {
    const { envelopeId, status } = req.body || {};
    if (envelopeId && status) await markEnvelopeStatus(String(envelopeId), status as ESignStatus);
    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

export default router;
