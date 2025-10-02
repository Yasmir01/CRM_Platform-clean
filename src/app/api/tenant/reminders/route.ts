<<<<<<< HEAD
import { prisma } from "../../../../api/_db";
=======
import { prisma } from "../../../../pages/api/_db";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { getSession } from "../../../../lib/auth";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const reminders = await prisma.reminder.findMany({ where: { tenantId: session.user.tenantId, status: { in: ['pending', 'sent'] } }, orderBy: { sendAt: 'desc' } });
  return new Response(JSON.stringify({ reminders }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const body = await req.json();
  const reminderId = body.reminderId;
  if (!reminderId) return new Response(JSON.stringify({ error: 'Missing reminderId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const r = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!r || r.tenantId !== session.user.tenantId) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  const updated = await prisma.reminder.update({ where: { id: reminderId }, data: { acknowledged: true } });
  return new Response(JSON.stringify({ reminder: updated }), { headers: { 'Content-Type': 'application/json' } });
}
