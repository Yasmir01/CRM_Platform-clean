import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middleware(req: Request) {
  try {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/" , "/:path*"],
};
