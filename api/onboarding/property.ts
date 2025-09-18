import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = String(body.name || '');
    const address = String(body.address || '');
    const units = Array.isArray(body.units) ? body.units : [];

    if (!name || !address) return res.status(400).json({ error: 'Missing name or address' });

    // Create property; include ownerId if property schema supports it (best-effort)
    const propertyData: any = { name, address };
    try {
      // try to attach an orgId/accountId if present on user payload
      if ((user as any).orgId) propertyData.orgId = (user as any).orgId;
      if ((user as any).accountId) propertyData.accountId = (user as any).accountId;
      // some schemas have ownerId
      propertyData.ownerId = (user as any).sub || (user as any).id || undefined;
    } catch (_) {}

    const prop = await prisma.property.create({ data: propertyData as any });

    // Create units if provided (best-effort). Try createMany if available
    const createdUnits: any[] = [];
    for (const u of units) {
      try {
        const unitData: any = { propertyId: prop.id };
        if (u.number !== undefined) unitData.number = String(u.number);
        if (u.name !== undefined) unitData.name = String(u.name);
        if (u.rent !== undefined) unitData.rent = Number(u.rent);
        const created = await prisma.unit.create({ data: unitData });
        createdUnits.push(created);
      } catch (e) {
        // ignore unit creation errors but continue
        console.warn('unit create failed', e?.message || e);
      }
    }

    return res.status(201).json({ property: prop, units: createdUnits });
  } catch (err: any) {
    console.error('onboarding property error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
