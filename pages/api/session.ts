import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { prisma } from "./_db";

const COOKIE_NAME = "sid";
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cookieHeader = req.headers["cookie"] as string | undefined;
  const cookies = (req as any).cookies || (cookieHeader ? parse(cookieHeader) : {});
  const raw = cookies[COOKIE_NAME];
  if (!raw) return res.status(401).json({ authenticated: false });

  try {
    const payload = jwt.verify(raw, JWT_SECRET) as any;

    let impersonatedSubscriber: any = null;
    if (payload.impersonating) {
      try {
        const s = await prisma.subscriber.findUnique({ where: { id: payload.impersonating }, select: { id: true, name: true, email: true } });
        if (s) {
          impersonatedSubscriber = { id: s.id, companyName: s.name || s.email || null, logoUrl: null };
        }
      } catch (e) {
        // ignore DB lookup error
      }
    }

    res.status(200).json({ authenticated: true, impersonating: payload.impersonating || null, impersonatedSubscriber, user: { id: payload.sub, email: payload.email, role: payload.role, roles: payload.roles } });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
}
