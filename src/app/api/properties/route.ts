import { prisma } from '../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export const GET = async (req: Request) => {
  try {
    const session = await getSession(req);
    if (!session || !session.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    // Return properties with leases
    const properties = await prisma.property.findMany({ include: { leases: true }, orderBy: { createdAt: 'desc' } });
    return new Response(JSON.stringify(properties), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('GET /api/properties error', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await getSession(req);
    if (!session || !session.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });

    const data = await req.json();
    const name = String(data.name || '').trim();
    const address = String(data.address || '').trim();
    const units = Number.isFinite(Number(data.units)) ? Number(data.units) : null;

    if (!name || !address || units === null) {
      return new Response(JSON.stringify({ error: 'Missing required fields (name, address, units)' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const property = await prisma.property.create({ data: { name, address, units } });
    return new Response(JSON.stringify(property), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('POST /api/properties error', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
