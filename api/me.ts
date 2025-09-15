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
    const user = { id: payload.sub, email: payload.email, role: payload.role, roles: payload.roles };

    // try to locate a subscriber with this email
    let subscriber = null;
    try {
      if (user.email) {
        subscriber = await prisma.subscriber.findFirst({ where: { email: user.email }, select: { id: true, plan: true } });
      }
    } catch (e) {
      // ignore
    }

    return res.status(200).json({ authenticated: true, user, subscriber });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
}
