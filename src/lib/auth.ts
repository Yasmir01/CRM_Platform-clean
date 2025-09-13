import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function getSession(req?: Request) {
  if (!req) return null;
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const raw = cookies.sid as string | undefined;
  if (!raw) return null;

  const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;
  if (!JWT_SECRET) throw new Error("SESSION_JWT_SECRET not configured");

  try {
    const payload = jwt.verify(raw, JWT_SECRET) as any;
    return { user: payload };
  } catch (e) {
    return null;
  }
}

export function requireSuperAdmin(session: any) {
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }
}
