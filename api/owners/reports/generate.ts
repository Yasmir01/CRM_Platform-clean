import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';
import { safeParse } from '../../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  // allow admins to generate for any owner
  const role = String((user as any).role || '').toLowerCase();
  if (!role.includes('super') && !role.includes('admin')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const ownerId = String(body.ownerId || '').trim();
    const year = Number.isFinite(body.year) ? Number(body.year) : new Date().getFullYear();
    if (!ownerId) return res.status(400).json({ error: 'Missing ownerId' });

    // fetch owner properties and compute simple metrics from transactions and payments
    const props = await prisma.ownerProperty.findMany({ where: { ownerId }, include: { property: true } });
    let totalRent = 0;
    let totalExpenses = 0;

    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const propIds = props.map(p => p.propertyId);
    if (propIds.length > 0) {
      const rents = await prisma.transaction.findMany({ where: { propertyId: { in: propIds }, type: 'rent', status: 'paid', createdAt: { gte: start, lt: end } } });
      const expenses = await prisma.transaction.findMany({ where: { propertyId: { in: propIds }, type: 'expense', createdAt: { gte: start, lt: end } } });
      totalRent = rents.reduce((s, r) => s + Number(r.amount || 0), 0);
      totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    }

    const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
    const report = {
      ownerId,
      ownerName: owner?.name,
      year,
      totalRent,
      totalExpenses,
      netIncome: totalRent - totalExpenses,
      properties: props.map(p => ({ propertyId: p.propertyId, percentage: Number(p.ownershipPercentage) })),
      generatedAt: new Date().toISOString()
    };

    // In production generate PDF and store in S3; here we return JSON stub and create Document record
    const fileUrl = (process.env.ASSET_BASE_URL || 'https://storage.example.com') + `/owner_reports/${ownerId}-${year}.json`;
    await prisma.document.create({ data: { propertyId: props.length ? props[0].propertyId : undefined, title: `Owner Report ${year}`, fileUrl, uploadedBy: String((user as any).sub || (user as any).id), type: 'report', visibility: 'private', metadata: report as any } });

    return res.status(200).json({ success: true, report, fileUrl });
  } catch (e: any) {
    console.error('owners/reports/generate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
