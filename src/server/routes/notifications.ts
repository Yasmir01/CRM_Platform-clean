import express from "express";
import { createNotification, listNotifications, markNotificationRead } from "../services/notifications";

const router = express.Router();

// List
router.get("/:userId", async (req, res) => {
  const list = await listNotifications(req.params.userId);
  res.json(list);
});

// Mark read
router.post("/:id/read", async (req, res) => {
  const updated = await markNotificationRead(req.params.id);
  res.json(updated);
});

// Test create (dev only)
router.post("/test", async (req, res) => {
  const { userId, type, title, message } = req.body;
  const n = await createNotification(userId, type, title, message);
  res.json(n);
});

export default router;
