import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

const SESSION_SECRET = process.env.SESSION_JWT_SECRET as string;

export async function middleware(req: Request) {
  try {
    // handle custom domain rewrite first
    const host = req.headers.get("host") || "";
    const hostname = host.split(":")[0];

    const landingPage = await prisma.landingPage.findFirst({ where: { customDomain: hostname, isPublished: true } });
    if (landingPage) {
      const url = new URL(req.url);
      url.pathname = `/${landingPage.slug}`;
      return NextResponse.rewrite(url);
    }
  } catch (e) {
    // ignore middleware errors
    // eslint-disable-next-line no-console
    console.warn('middleware domain check failed', e);
  }

  try {
    // Check for impersonation token cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const imp = cookies['impersonationToken'] || cookies['impersonationtoken'];
    if (imp) {
      try {
        const payload: any = jwt.verify(imp, SESSION_SECRET);
        const res = NextResponse.next();
        // expose impersonation info via headers for downstream APIs
        if (payload?.sub) res.headers.set('x-impersonated-user-id', String(payload.sub));
        if (payload?.subscriberId) res.headers.set('x-impersonated-subscriber-id', String(payload.subscriberId));
        res.headers.set('x-impersonated', '1');
        return res;
      } catch (err) {
        // invalid token — ignore
        // eslint-disable-next-line no-console
        console.warn('Invalid impersonation token', err?.message || err);
      }
    }
  } catch (e) {
    // ignore
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/" , "/:path*"],
};
