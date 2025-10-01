import express from "express";
import { sendMessage } from "../services/messages";

const router = express.Router();

router.post("/message_send", async (req, res) => {
  const { threadId, authorId, body } = req.body as { threadId: string; authorId: string; body: string };
  const msg = await sendMessage(threadId, authorId, body);
  res.json({ ok: true, message: msg.id });
});

export default router;
