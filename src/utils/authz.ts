import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const COOKIE_NAME = "sid";
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;

function getCookie(req: VercelRequest, name: string) {
  const cookieHeader = req.headers["cookie"] as string | undefined;
  const cookies = (req as any).cookies || (cookieHeader ? parse(cookieHeader) : {});
  return cookies?.[name];
}

export function getUserOr401(req: VercelRequest, res: VercelResponse) {
  const raw = getCookie(req, COOKIE_NAME);
  if (!raw) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  try {
    const payload = jwt.verify(raw, JWT_SECRET) as any;
    return payload;
  } catch {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
}

export function requireRole(roles: string[]) {
  return (req: VercelRequest, res: VercelResponse) => {
    const user = getUserOr401(req, res);
    if (!user) return null;
    const ok = Array.isArray(user.roles) && user.roles.some((r: string) => roles.includes(r));
    if (!ok) {
      res.status(403).json({ error: "forbidden" });
      return null;
    }
    return user;
  };
}
