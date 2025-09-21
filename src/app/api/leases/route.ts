import { prisma } from '../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export const GET = async (req: Request) => {
  try {
    const session = await getSession(req);
    if (!session || !session.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const user = session.user as any;

    let leases;
    if (user.role === 'TENANT' || user.role === 'tenant') {
      // Tenant sees only their own leases
      leases = await prisma.lease.findMany({ where: { tenantId: user.id }, include: { property: true }, orderBy: { createdAt: 'desc' } });
    } else {
      // Admins/Super-admins see all leases
      leases = await prisma.lease.findMany({ include: { property: true }, orderBy: { createdAt: 'desc' } });
    }

    return new Response(JSON.stringify(leases), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('GET /api/leases error', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await getSession(req);
    if (!session || !session.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const data = await req.json();
    const propertyId = String(data.propertyId || '').trim();
    const tenantId = String(data.tenantId || '').trim();
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;
    const rentAmount = Number.isFinite(Number(data.rentAmount)) ? Number(data.rentAmount) : null;

    if (!propertyId || !tenantId || !startDate || !endDate || rentAmount === null) {
      return new Response(JSON.stringify({ error: 'Missing required fields (propertyId, tenantId, startDate, endDate, rentAmount)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const lease = await prisma.lease.create({ data: { propertyId, tenantId, startDate, endDate, rentAmount } });
    return new Response(JSON.stringify(lease), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('POST /api/leases error', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
