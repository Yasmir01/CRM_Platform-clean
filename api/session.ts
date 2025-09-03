import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const COOKIE_NAME = "sid";
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const cookieHeader = req.headers["cookie"] as string | undefined;
  const cookies = (req as any).cookies || (cookieHeader ? parse(cookieHeader) : {});
  const raw = cookies[COOKIE_NAME];
  if (!raw) return res.status(401).json({ authenticated: false });

  try {
    const payload = jwt.verify(raw, JWT_SECRET) as any;
    res.status(200).json({ authenticated: true, impersonating: payload.impersonating || null, user: { id: payload.sub, email: payload.email, role: payload.role, roles: payload.roles } });
  } catch {
    res.status(401).json({ authenticated: false });
  }
}
