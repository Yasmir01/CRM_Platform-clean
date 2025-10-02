import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.IMPERS_SECRET || "supersecret";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = (req.body || {}) as { token?: string };
    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    const payload = jwt.verify(token, SECRET) as any;

    await prisma.imprLog.update({
      where: { id: String((payload as any).logId) },
      data: { endedAt: new Date() },
    });

    // also write to History
    await prisma.history.create({
      data: {
        orgId: (payload as any).org,
        action: `SuperAdmin ended impersonation`,
        actorId: (payload as any).sub,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error ending impersonation:", error);
    return res.status(500).json({ error: "Failed to end impersonation" });
  }
}
