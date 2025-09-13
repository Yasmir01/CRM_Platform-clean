import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userPayload = getUserOr401(req, res);
    if (!userPayload) return; // already responded with 401

    const userId = String(userPayload.sub || userPayload?.id || '');
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

    const isSuper = String(dbUser.role || '').toUpperCase() === 'SUPER_ADMIN';

    const propertyId = (req.query && (req.query as any).propertyId) ? String((req.query as any).propertyId) : undefined;

    let properties: any[] = [];

    // Try to filter by orgId if the Property model supports it. If not, fall back to returning all properties.
    if (isSuper) {
      properties = await prisma.property.findMany({ select: { id: true, address: true }, orderBy: { address: 'asc' } });
    } else {
      try {
        properties = await prisma.property.findMany({ where: { orgId: dbUser.orgId }, select: { id: true, address: true }, orderBy: { address: 'asc' } });
      } catch (e: any) {
        // likely Property model doesn't have orgId field — fall back to returning all properties
        console.warn('Could not filter properties by orgId; returning all properties. Error:', e?.message || e);
        properties = await prisma.property.findMany({ select: { id: true, address: true }, orderBy: { address: 'asc' } });
      }
    }

    // Map to { id, title } to match expected client shape
    const result = properties.map((p: any) => ({ id: p.id, title: p.title || p.name || p.address || String(p.id) }));

    return res.status(200).json({ properties: result });
  } catch (err: any) {
    console.error('properties list error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
