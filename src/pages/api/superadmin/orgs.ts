import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const orgs = await prisma.organization.findMany({
      include: {
        orgSubscriptions: {
          where: { status: "active" },
          include: { plan: true },
        },
      },
    });

    const shaped = orgs.map((o: any) => ({
      id: o.id,
      name: o.name,
      subscriptionMode: o.subscriptionMode || "TIER",
      tier: o.tier,
      mode: o.subscriptionMode || "TIER",
      subscription: o.orgSubscriptions?.[0]
        ? { ...o.orgSubscriptions[0], plan: o.orgSubscriptions[0].plan }
        : null,
    }));

    return res.status(200).json(shaped);
  } catch (error) {
    console.error("Error loading orgs:", error);
    return res.status(500).json({ error: "Failed to load organizations" });
  }
}
