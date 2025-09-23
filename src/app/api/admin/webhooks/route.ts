import { prisma } from "../../../../pages/api/_db";
import { getSession } from "../../../../lib/auth";

async function requireCompanyAdminSession(req: Request) {
  const session = await getSession(req);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") return session;
  throw new Error("Forbidden");
}

export async function GET(req: Request) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }
  const url = new URL(req.url);
  const subscriberId = url.searchParams.get('subscriberId');
  const where: any = {};
  if (subscriberId) where.subscriberId = subscriberId;
  const items = await prisma.webhookSubscription.findMany({ where, orderBy: { createdAt: 'desc' } });
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }
  const body = await req.json();
  if (!body.url || !body.event || !body.name) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  const item = await prisma.webhookSubscription.create({ data: { name: body.name, url: body.url, event: body.event, active: body.active !== false, subscriberId: body.subscriberId || null } });
  return new Response(JSON.stringify(item), { status: 201, headers: { 'Content-Type': 'application/json' } });
}
