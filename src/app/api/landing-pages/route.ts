import { prisma } from "../../../../api/_db";
import { withAuthorization } from "../../../../lib/authz";
import { getSession } from "../../../../lib/auth";
import { canUseLandingPages, canUseCustomDomain, landingPageLimit } from "../../../../lib/planRules";

export const GET = withAuthorization("property:read", async (req: Request) => {
  const session = await getSession(req);
  const user = session?.user as any;

  // if super-admin, return all pages
  if (user?.role === "SUPER_ADMIN") {
    const pages = await prisma.landingPage.findMany({ orderBy: { createdAt: "desc" } });
    return new Response(JSON.stringify(pages), { headers: { "Content-Type": "application/json" } });
  }

  const subscriberId = user?.subscriberId || user?.orgId || user?.accountId;
  if (!subscriberId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });

  const pages = await prisma.landingPage.findMany({ where: { subscriberId }, orderBy: { createdAt: "desc" } });
  return new Response(JSON.stringify(pages), { headers: { "Content-Type": "application/json" } });
});

export const POST = withAuthorization("property:write", async (req: Request) => {
  const session = await getSession(req);
  const user = session?.user as any;
  if (!user) return new Response("Unauthorized", { status: 403 });

  const subscriberId = user?.subscriberId || user?.orgId || user?.accountId;

  const subscriber = await prisma.subscriber.findUnique({ where: { id: subscriberId }, include: { landingPages: true } });
  if (!subscriber || !canUseLandingPages(subscriber.plan as any)) {
    return new Response("Landing pages not enabled for your plan", { status: 403 });
  }

  const limit = landingPageLimit(subscriber.plan as any);
  if (limit !== Infinity && subscriber.landingPages.length >= limit) {
    return new Response("Landing page limit reached", { status: 403 });
  }

  const data = await req.json();
  if (!data || !data.title || !data.slug || !data.propertyId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (data.customDomain && !canUseCustomDomain(subscriber.plan as any)) {
    return new Response("Custom domains require Enterprise plan", { status: 403 });
  }

  // ensure slug and customDomain uniqueness
  const existing = await prisma.landingPage.findFirst({ where: { OR: [{ slug: data.slug }, { customDomain: data.customDomain || undefined }] } });
  if (existing) return new Response(JSON.stringify({ error: "Slug or domain already in use" }), { status: 409, headers: { "Content-Type": "application/json" } });

  const page = await prisma.landingPage.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      seoKeywords: data.seoKeywords || null,
      customDomain: data.customDomain || null,
      propertyId: data.propertyId,
      subscriberId: subscriber.id,
      isPublished: false,
    },
  });

  return new Response(JSON.stringify(page), { status: 201, headers: { "Content-Type": "application/json" } });
});
