import express from "express";
import { sendMessage } from "../services/messages";
import { createEvent, updateEvent, cancelEvent, setRSVP } from "../services/calendar";

const router = express.Router();

router.post("/message_send", async (req, res) => {
  const { threadId, authorId, body } = req.body as { threadId: string; authorId: string; body: string };
  const msg = await sendMessage(threadId, authorId, body);
  res.json({ ok: true, message: msg.id });
});

router.post("/calendar_create", async (req, res) => {
  const ev = await createEvent(req.body);
  res.json({ ok: true, event: ev.id });
});

router.post("/calendar_update", async (req, res) => {
  const { id, patch } = req.body as { id: string; patch: any };
  const ev = await updateEvent(id, patch);
  res.json({ ok: true, event: ev.id });
});

router.post("/calendar_cancel", async (req, res) => {
  const { id } = req.body as { id: string };
  const ev = await cancelEvent(id);
  res.json({ ok: true, event: ev.id });
});

router.post("/calendar_rsvp", async (req, res) => {
  const { id, userId, rsvp } = req.body as { id: string; userId: string; rsvp: "yes" | "no" | "maybe" };
  const updated = await setRSVP(id, userId, rsvp);
  res.json({ ok: true, attendee: updated.id });
});

export default router;
