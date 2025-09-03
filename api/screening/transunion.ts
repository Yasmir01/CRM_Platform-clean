import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserOr401 } from "../../src/utils/authz";
import { rateLimit } from "../../src/utils/rateLimit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const ip = ((req.headers["x-forwarded-for"] as string) || "").split(",")[0]?.trim() || (req.socket as any).remoteAddress || "unknown";
  const { allowed, remaining } = rateLimit(ip, req.url || "transunion", 30, 60_000);
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  if (!allowed) return res.status(429).json({ error: "Too many requests" });

  const user = getUserOr401(req, res);
  if (!user) return;

  const { applicantId, ssn } = (req.body || {}) as { applicantId: string; ssn: string };
  if (!applicantId || !ssn) return res.status(400).json({ error: "Missing fields" });

  // Forward SSN to TransUnion API here (never log or store it!)
  // const result = await transUnionClient.createReport({ applicantId, ssn });

  return res.status(200).json({ ok: true });
}
