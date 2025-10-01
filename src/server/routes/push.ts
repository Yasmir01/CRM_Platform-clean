import express from "express";
import { registerPushToken, sendToUsers } from "../services/push";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { userId, token, platform } = req.body || {};
    await registerPushToken(String(userId), String(token), platform ? String(platform) : undefined);
    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(400).json({ ok: false, error: "Failed to register token" });
  }
});

router.post("/test", async (req, res) => {
  try {
    const { userId, title, body } = req.body || {};
    await sendToUsers([String(userId)], { title: title || "Test", body: body || "Hello!" });
    res.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

export default router;
