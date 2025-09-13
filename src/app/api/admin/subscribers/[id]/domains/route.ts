import { prisma } from "../../../../../../api/_db";
import { getSession, requireSuperAdmin } from "../../../../../../lib/auth";

export const GET = async (_req: Request, { params }: any) => {
  const session = await getSession(_req);
  try { requireSuperAdmin(session); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } }); }

  const id = params.id;
  const sub = await prisma.subscriber.findUnique({ where: { id } });
  if (!sub) return new Response(JSON.stringify({}), { headers: { 'Content-Type': 'application/json' } });

  // return override fields if present
  return new Response(JSON.stringify({ landingPagesEnabledByAdmin: (sub as any).landingPagesEnabledByAdmin ?? null, customDomainEnabledByAdmin: (sub as any).customDomainEnabledByAdmin ?? null }), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT = async (req: Request, { params }: any) => {
  const session = await getSession(req);
  try { requireSuperAdmin(session); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } }); }

  const id = params.id;
  const payload = await req.json();

  const updated = await prisma.subscriber.update({ where: { id }, data: {
    landingPagesEnabledByAdmin: typeof payload.landingPagesEnabledByAdmin === 'boolean' ? payload.landingPagesEnabledByAdmin : null,
    customDomainEnabledByAdmin: typeof payload.customDomainEnabledByAdmin === 'boolean' ? payload.customDomainEnabledByAdmin : null,
  }});

  return new Response(JSON.stringify({ success: true, updated }), { headers: { 'Content-Type': 'application/json' } });
};
