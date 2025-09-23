import { prisma } from '../../../../../pages/api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  // Attempt to resolve subscriber by explicit subscriberId on session, or by account via tenant
  const user: any = session.user;
  let subscriber = null;

  if (user.subscriberId) {
    subscriber = await prisma.subscriber.findUnique({ where: { id: user.subscriberId }, select: { notifyEmail: true, notifySMS: true } });
  }

  if (!subscriber) {
    // try tenant -> account -> subscriber by companyId
    const tenant = await prisma.tenant.findUnique({ where: { userId: user.id }, select: { accountId: true } });
    const accountId = tenant?.accountId;
    if (accountId) {
      subscriber = await prisma.subscriber.findFirst({ where: { companyId: accountId }, select: { notifyEmail: true, notifySMS: true } });
    }
  }

  if (!subscriber) {
    // No subscriber record — return defaults
    return new Response(JSON.stringify({ notifyEmail: true, notifySMS: false }), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify(subscriber), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(req: Request) {
  const session = await getSession(req);
  if (!session?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

  const body = await req.json();
  const user: any = session.user;

  // Try to locate subscriber as in GET
  let subscriberRec = null;
  if (user.subscriberId) subscriberRec = await prisma.subscriber.findUnique({ where: { id: user.subscriberId } });

  if (!subscriberRec) {
    const tenant = await prisma.tenant.findUnique({ where: { userId: user.id }, select: { accountId: true } });
    const accountId = tenant?.accountId;
    if (accountId) subscriberRec = await prisma.subscriber.findFirst({ where: { companyId: accountId } });
  }

  if (!subscriberRec) {
    return new Response(JSON.stringify({ error: 'Subscriber not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }

  const updated = await prisma.subscriber.update({ where: { id: subscriberRec.id }, data: { notifyEmail: Boolean(body.notifyEmail), notifySMS: Boolean(body.notifySMS) }, select: { notifyEmail: true, notifySMS: true } });

  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
}
