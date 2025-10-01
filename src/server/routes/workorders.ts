import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { addWorkOrderMessage } from "../services/workorders";

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer();

router.post("/:id/messages", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { authorId, body } = req.body as { authorId?: string; body?: string };
    const file = req.file
      ? { buffer: req.file.buffer, originalName: req.file.originalname }
      : undefined;

    const result = await addWorkOrderMessage({
      workOrderId: id,
      authorId,
      body,
      file,
    });

    res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// GET all work orders for a vendor
router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params as { vendorId: string };
    const workOrders = await prisma.workOrder.findMany({
      where: { assignedVendorId: vendorId },
      orderBy: { createdAt: "desc" },
    });
    res.json(workOrders);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to load vendor work orders" });
  }
});

// Update status
router.post("/:id/status", async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const updated = await prisma.workOrder.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
