import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { recordComplianceLog } from "../utils/compliance";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/impersonate", async (req, res) => {
  const { superAdminId, targetUserId } = req.body as { superAdminId: string; targetUserId: string };
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return res.status(404).json({ error: "User not found" });

  const token = jwt.sign(
    { sub: target.id, role: (target as any).role, impersonatedBy: superAdminId },
    process.env.JWT_SECRET || "dev",
    { expiresIn: "15m" }
  );

  await recordComplianceLog({
    actor: superAdminId,
    action: "Impersonate",
    entity: `User:${targetUserId}`,
    details: `Impersonated ${(target as any).role}`,
  });

  res.json({ token });
});

export default router;
