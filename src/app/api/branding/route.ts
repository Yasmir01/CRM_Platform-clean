import { prisma } from "../../../../api/_db";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId") || undefined;

    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const raw = cookies.sid as string | undefined;

    let account: any = null;
    const JWT_SECRET = process.env.SESSION_JWT_SECRET as string | undefined;

    if (raw && JWT_SECRET) {
      try {
        const payload = jwt.verify(raw, JWT_SECRET) as any;
        const userId = payload.sub || payload.id || payload.userId || payload.uid;
        if (userId) {
          const dbUser = await prisma.user.findUnique({ where: { id: String(userId) }, include: { account: true } });
          if (dbUser && dbUser.account) account = dbUser.account;
        }
      } catch (e) {
        // ignore invalid token
        console.warn('branding: invalid session token', e);
      }
    }

    if (!account && propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId }, include: { account: true } });
      if (property && property.account) account = property.account;
    }

    const payload = {
      name: account?.name ?? "Company",
      logoUrl: account?.logoUrl ?? null,
      address: account?.address ?? null,
      phone: account?.phone ?? null,
      email: account?.email ?? null,
    };

    return new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } });
  } catch (err: any) {
    console.error('branding route error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
