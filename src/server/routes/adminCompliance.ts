import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { origin } = req.query;
  const where = origin && origin !== "all" ? { origin: String(origin) } : {};
  const logs = await prisma.complianceLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json(logs);
});

export default router;
