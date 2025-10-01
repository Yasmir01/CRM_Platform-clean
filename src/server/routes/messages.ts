import express from "express";
import { createThread, sendMessage, listThreads, listMessages } from "../services/messages";

const router = express.Router();

router.get("/threads/:userId", async (req, res) => {
  res.json(await listThreads(req.params.userId));
});

router.get("/thread/:id", async (req, res) => {
  res.json(await listMessages(req.params.id));
});

router.post("/threads", async (req, res) => {
  const { subject, memberIds } = req.body as { subject: string; memberIds: string[] };
  const t = await createThread(subject, memberIds || []);
  res.json(t);
});

router.post("/thread/:id/message", async (req, res) => {
  const { authorId, body } = req.body as { authorId: string; body: string };
  const msg = await sendMessage(req.params.id, authorId, body);
  res.json(msg);
});

export default router;
