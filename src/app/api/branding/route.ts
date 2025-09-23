import { prisma } from "../../../../pages/api/_db";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

function getUserIdFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const raw = cookies.sid as string | undefined;
  const JWT_SECRET = process.env.SESSION_JWT_SECRET as string | undefined;
  if (!raw || !JWT_SECRET) return null;
  try {
    const payload = jwt.verify(raw, JWT_SECRET) as any;
    const userId = payload.sub || payload.id || payload.userId || payload.uid;
    return String(userId);
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get("propertyId") || undefined;

    // Try to resolve user from session cookie
    const userId = getUserIdFromRequest(req);

    let branding: any = null;

    if (userId) {
      branding = await prisma.branding.findFirst({ where: { landlordId: userId } });
    }

    // If branding not set for user, try to resolve via property -> account fallback
    if (!branding && propertyId) {
      try {
        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (property && property.userId) {
          branding = await prisma.branding.findFirst({ where: { landlordId: property.userId } });
        }
      } catch (e) {
        // ignore
      }
    }

    // If still no branding, fallback to basic company info from user record (if available) or public fallback
    let accountFallback: any = {};
    if (!branding && userId) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        accountFallback = { name: dbUser.name ?? "Company", logoUrl: null, address: null, phone: null, email: dbUser.email };
      }
    }

    const payload = {
      name: branding?.companyName ?? accountFallback?.name ?? "Company",
      logoUrl: branding?.logoUrl ?? accountFallback?.logoUrl ?? null,
      primaryColor: branding?.primaryColor ?? null,
      secondaryColor: branding?.secondaryColor ?? null,
      domain: branding?.customDomain ?? null,
      emailSender: branding?.emailSender ?? accountFallback?.email ?? null,
    };

    return new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } });
  } catch (err: any) {
    console.error('branding route error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "content-type": "application/json" } });

    const body = await req.json();
    const {
      companyName,
      logoUrl,
      primaryColor,
      secondaryColor,
      customDomain,
      emailSender,
    } = body as any;

    // Basic validation
    if (primaryColor && typeof primaryColor === 'string' && primaryColor.length > 7) {
      return new Response(JSON.stringify({ error: 'Invalid primaryColor' }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const existing = await prisma.branding.findFirst({ where: { landlordId: userId } });
    let result;
    if (existing) {
      result = await prisma.branding.update({ where: { id: existing.id }, data: {
        companyName: companyName ?? existing.companyName,
        logoUrl: logoUrl ?? existing.logoUrl,
        primaryColor: primaryColor ?? existing.primaryColor,
        secondaryColor: secondaryColor ?? existing.secondaryColor,
        customDomain: customDomain ?? existing.customDomain,
        emailSender: emailSender ?? existing.emailSender,
      }});
    } else {
      result = await prisma.branding.create({ data: {
        landlordId: userId,
        companyName: companyName ?? undefined,
        logoUrl: logoUrl ?? undefined,
        primaryColor: primaryColor ?? undefined,
        secondaryColor: secondaryColor ?? undefined,
        customDomain: customDomain ?? undefined,
        emailSender: emailSender ?? undefined,
      }});
    }

    return new Response(JSON.stringify(result), { headers: { "content-type": "application/json" } });
  } catch (e: any) {
    console.error('branding POST error', e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
