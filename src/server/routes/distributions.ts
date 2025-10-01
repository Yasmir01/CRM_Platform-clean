import express from "express";
import { createDistribution, listDistributions, markDistributionPaid } from "../services/distributions";

const router = express.Router();

router.get("/:ownerId", async (req, res) => {
  try {
    const dists = await listDistributions(req.params.ownerId);
    res.json(dists);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch distributions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { ownerId, statementId, amount, method, actorId } = req.body || {};
    const dist = await createDistribution({ ownerId, statementId, amount, method, actorId });
    res.json(dist);
  } catch (e) {
    res.status(500).json({ error: "Failed to create distribution" });
  }
});

router.post("/:id/mark-paid", async (req, res) => {
  try {
    const { actorId } = req.body || {};
    const dist = await markDistributionPaid(req.params.id, actorId);
    res.json(dist);
  } catch (e) {
    res.status(500).json({ error: "Failed to mark distribution paid" });
  }
});

export default router;
