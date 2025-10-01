import express from "express";
import multer from "multer";
import { addWorkOrderMessage } from "../services/workorders";

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

export default router;
