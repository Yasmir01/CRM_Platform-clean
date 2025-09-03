import type { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "sid";
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  if (!JWT_SECRET) return res.status(500).json({ error: "SESSION_JWT_SECRET not set" });

  const { userId, email, roles = ["viewer"] } = (req.body || {}) as any;
  if (!userId || !email) return res.status(400).json({ error: "Missing userId or email" });

  const token = jwt.sign({ sub: userId, email, roles }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });

  res.setHeader(
    "Set-Cookie",
    serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
      domain: COOKIE_DOMAIN,
    })
  );

  res.status(200).json({ ok: true });
}
