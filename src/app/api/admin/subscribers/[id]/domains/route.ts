<<<<<<< HEAD
import { prisma } from "../../../../../../api/_db";
=======
import { prisma } from "../../../../../../pages/api/_db";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { getSession } from "../../../../../../lib/auth";

async function requireSuperAdminSession(req: Request) {
  const session = await getSession(req);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function GET(req: Request, { params }: any) {
  try {
    await requireSuperAdminSession(req);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      plan: true,
      landingPagesEnabledByAdmin: true,
      customDomainEnabledByAdmin: true,
    },
  });

  if (!subscriber) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  return new Response(JSON.stringify(subscriber), { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(req: Request, { params }: any) {
  try {
    await requireSuperAdminSession(req);
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const body = await req.json();
  const updated = await prisma.subscriber.update({ where: { id: params.id }, data: {
    landingPagesEnabledByAdmin: typeof body.landingPagesEnabledByAdmin === 'boolean' ? body.landingPagesEnabledByAdmin : undefined,
    customDomainEnabledByAdmin: typeof body.customDomainEnabledByAdmin === 'boolean' ? body.customDomainEnabledByAdmin : undefined,
  } });

  return new Response(JSON.stringify(updated), { headers: { 'Content-Type': 'application/json' } });
}
