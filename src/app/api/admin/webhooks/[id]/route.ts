import { prisma } from "../../../../../pages/api/_db";
import { getSession } from "../../../../../lib/auth";

async function requireCompanyAdminSession(req: Request) {
  const session = await getSession(req);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") return session;
  throw new Error("Forbidden");
}

export async function GET(req: Request, { params }: any) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }
  const item = await prisma.webhookSubscription.findUnique({ where: { id: params.id } });
  if (!item) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(req: Request, { params }: any) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }
  const body = await req.json();
  const updated = await prisma.webhookSubscription.update({ where: { id: params.id }, data: { name: body.name, url: body.url, event: body.event, active: body.active, subscriberId: body.subscriberId || null } });
  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(req: Request, { params }: any) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }
  await prisma.webhookSubscription.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}
