import { prisma } from "../../../../../pages/api/_db";
import { getSession } from "../../../../../lib/auth";
import { isRemindersAllowedForSubscriber } from "@/lib/featureChecks";

async function requireCompanyAdminSession(req: Request) {
  const session = await getSession(req);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") return session;
  throw new Error("Forbidden");
}

export async function PUT(req: Request, { params }: any) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }

  const body = await req.json();
  const updated = await prisma.reminder.update({ where: { id: params.id }, data: {
    message: typeof body.message === 'string' ? body.message : undefined,
    sendAt: body.sendAt ? new Date(body.sendAt) : undefined,
    repeat: typeof body.repeat === 'string' ? body.repeat : undefined,
    status: typeof body.status === 'string' ? body.status : undefined,
  } });

  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(req: Request, { params }: any) {
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }

  await prisma.reminder.delete({ where: { id: params.id } });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request, { params }: any) {
  // send now
  try { await requireCompanyAdminSession(req); } catch (e) { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }); }

  const reminder = await prisma.reminder.findUnique({ where: { id: params.id } });
  if (!reminder) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  const { sendReminderNow } = await import('@/lib/reminderWorker');
  await sendReminderNow(reminder.id);

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
