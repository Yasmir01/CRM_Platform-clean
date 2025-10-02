import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
      include: { features: true },
    });

    const result = plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      interval: (p as any).billingCycle || "monthly",
      billingCycle: (p as any).billingCycle || "monthly",
      features: (p as any).features,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error loading plans:", error);
    return res.status(500).json({ error: "Failed to load plans" });
  }
}
