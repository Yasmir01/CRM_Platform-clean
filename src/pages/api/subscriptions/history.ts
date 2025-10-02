import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../api/_db";
import { getSession } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const session = await getSession((req as any));
    const email = session?.user?.email as string | undefined;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.orgId) return res.status(200).json([]);

    const history = await prisma.subscription.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        plan: true,
        active: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return res.status(500).json({ error: "Failed to fetch subscription history" });
  }
}
