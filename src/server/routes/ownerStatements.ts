import express from "express";
import { listOwnerStatements, generateOwnerStatement } from "../services/ownerStatements";

const router = express.Router();

// List statements for an owner
router.get("/:ownerId", async (req, res) => {
  try {
    const stmts = await listOwnerStatements(req.params.ownerId);
    res.json(stmts);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: "Failed to fetch statements" });
  }
});

// Generate a new statement (admin action)
router.post("/:ownerId/generate", async (req, res) => {
  try {
    const { propertyId, start, end } = req.body || {};
    const stmt = await generateOwnerStatement(
      req.params.ownerId,
      propertyId || null,
      new Date(start),
      new Date(end)
    );
    res.json(stmt);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).json({ error: "Failed to generate statement" });
  }
});

export default router;
