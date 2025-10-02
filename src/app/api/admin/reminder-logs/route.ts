import { prisma } from "../../../../api/_db";
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
  const reminderId = url.searchParams.get('reminderId');
  const subscriberId = url.searchParams.get('subscriberId');
  const channel = url.searchParams.get('channel');
  const status = url.searchParams.get('status');
  const since = url.searchParams.get('since');
  const until = url.searchParams.get('until');

  const where: any = {};
  if (reminderId) where.reminderId = reminderId;
  if (subscriberId) where.reminder = { subscriberId };
  if (channel) where.channel = channel;
  if (status) where.status = status;
  if (since || until) where.createdAt = {};
  if (since) where.createdAt.gte = new Date(since);
  if (until) where.createdAt.lte = new Date(until);

  const logs = await prisma.reminderLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500, include: { reminder: true } });
  return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' } });
}
