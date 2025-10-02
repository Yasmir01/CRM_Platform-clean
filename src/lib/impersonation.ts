import jwt from "jsonwebtoken";

const SECRET = process.env.IMPERS_SECRET || "supersecret";

export function getImpersonatedOrg(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("impersonationToken");
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as any;
    return (payload as any)?.org || null;
  } catch {
    return null;
  }
}
