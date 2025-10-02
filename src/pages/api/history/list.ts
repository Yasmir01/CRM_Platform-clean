import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orgId } = req.query;
    if (!orgId || typeof orgId !== "string") {
      return res.status(400).json({ error: "Missing orgId" });
    }

    const logs = await prisma.history.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json(logs);
  } catch (error) {
    console.error("Error loading history:", error);
    return res.status(500).json({ error: "Failed to load history" });
  }
}
