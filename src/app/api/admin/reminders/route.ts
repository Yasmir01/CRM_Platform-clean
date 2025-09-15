import { prisma } from "../../../../api/_db";
import { getSession } from "../../../../lib/auth";
import { canUseReminders } from "../../../../lib/planRules";
import { isRemindersAllowedForSubscriber } from "@/lib/featureChecks";

async function requireCompanyAdminSession(req: Request) {
  const session = await getSession(req);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MANAGER") return session;
  throw new Error("Forbidden");
}

export async function GET(req: Request) {
  try {
    await requireCompanyAdminSession(req);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const url = new URL(req.url);
  const subscriberId = url.searchParams.get('subscriberId') || (await getSession(req))?.user?.subscriberId;
  if (!subscriberId) return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });

  const reminders = await prisma.reminder.findMany({ where: { subscriberId }, orderBy: { sendAt: 'desc' }, take: 200 });
  return new Response(JSON.stringify(reminders), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  try {
    await requireCompanyAdminSession(req);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await req.json();
  const { subscriberId, tenantId, propertyId, leaseId, type, message, sendAt, repeat } = body;

  if (!subscriberId || !type || !message || !sendAt) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const allowed = await isRemindersAllowedForSubscriber(subscriberId);
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Reminders not enabled for this subscriber' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  const reminder = await prisma.reminder.create({ data: {
    subscriberId,
    tenantId: tenantId || undefined,
    propertyId: propertyId || undefined,
    leaseId: leaseId || undefined,
    type,
    message,
    sendAt: new Date(sendAt),
    repeat: repeat || 'none',
    status: 'pending',
  }});

  return new Response(JSON.stringify(reminder), { status: 201, headers: { 'Content-Type': 'application/json' } });
}
