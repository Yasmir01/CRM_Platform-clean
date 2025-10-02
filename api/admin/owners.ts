import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireRole } from "../../src/utils/authz";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireRole(["admin", "owner"])(req, res);
  if (!user) return;
  res.status(200).json({ owners: [] });
}
