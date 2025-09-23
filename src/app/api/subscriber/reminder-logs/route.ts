import { prisma } from "../../../../pages/api/_db";
import { getSession } from "../../../../lib/auth";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const url = new URL(req.url);
  const reminderId = url.searchParams.get('reminderId');
  const since = url.searchParams.get('since');
  const until = url.searchParams.get('until');

  const where: any = { reminder: { subscriberId: session.user.subscriberId } };
  if (reminderId) where.reminderId = reminderId;
  if (since || until) where.createdAt = {};
  if (since) where.createdAt.gte = new Date(since);
  if (until) where.createdAt.lte = new Date(until);

  const logs = await prisma.reminderLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { reminder: true } });
  return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' } });
}
