import { prisma } from "../../../../api/_db";
import { withAuthorization } from "../../../../lib/authz";
import { getSession } from "../../../../lib/auth";
import { canUseCustomDomain } from "../../../../lib/planRules";

export const GET = withAuthorization("property:read", async (_req: Request, { params }: any) => {
  const { id } = params;
  const page = await prisma.landingPage.findUnique({ where: { id }, include: { property: true } });
  if (!page) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  return new Response(JSON.stringify(page), { headers: { "Content-Type": "application/json" } });
});

export const PUT = withAuthorization("property:write", async (req: Request, { params }: any) => {
  const session = await getSession(req);
  const user = session?.user as any;
  const { id } = params;
  const payload = await req.json();

  const page = await prisma.landingPage.findUnique({ where: { id } });
  if (!page) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });

  // Only allow custom domain if plan allows (checked on create too)
  if (payload.customDomain && !canUseCustomDomain((page as any).plan)) {
    // plan unknown on page; best-effort: check subscriber
    const subscriber = await prisma.subscriber.findUnique({ where: { id: page.subscriberId } });
    if (!subscriber || !canUseCustomDomain(subscriber.plan as any)) {
      return new Response("Custom domains require Enterprise plan", { status: 403 });
    }
  }

  const updated = await prisma.landingPage.update({ where: { id }, data: {
    title: payload.title ?? page.title,
    slug: payload.slug ?? page.slug,
    description: payload.description ?? page.description,
    seoTitle: payload.seoTitle ?? page.seoTitle,
    seoDescription: payload.seoDescription ?? page.seoDescription,
    seoKeywords: payload.seoKeywords ?? page.seoKeywords,
    customDomain: payload.customDomain ?? page.customDomain,
    isPublished: typeof payload.isPublished === 'boolean' ? payload.isPublished : page.isPublished,
  }});

  return new Response(JSON.stringify(updated), { headers: { "Content-Type": "application/json" } });
});

export const DELETE = withAuthorization("property:write", async (_req: Request, { params }: any) => {
  const { id } = params;
  await prisma.landingPage.delete({ where: { id } });
  return new Response(null, { status: 204 });
});
