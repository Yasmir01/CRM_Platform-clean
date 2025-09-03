import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { notify } from '../../src/lib/notify';
import { rateLimit } from '../../src/utils/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const ip = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || (req.socket as any).remoteAddress || 'unknown';
  const { allowed, remaining } = rateLimit(ip, req.url || 'apply', 30, 60_000);
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  if (!allowed) return res.status(429).json({ error: 'Too many requests' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const propertyId = String(body.propertyId || '');
    const applicantName = String(body.applicantName || '');
    const email = String(body.email || '');
    const phone = body.phone ? String(body.phone) : null;
    const moveInDate = body.moveInDate ? new Date(body.moveInDate) : null;
    if (!propertyId || !applicantName || !email) return res.status(400).json({ error: 'missing fields' });

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    const orgId = property?.orgId || '';

    const app = await prisma.tenantApplication.create({ data: { propertyId, orgId, applicantName, email, phone: phone || undefined, moveInDate: moveInDate || undefined } });

    if (orgId) {
      const admins = await prisma.user.findMany({ where: { orgId, role: { in: ['ADMIN','MANAGER'] as any } }, select: { id: true, email: true } });
      for (const a of admins) {
        await notify({ userId: a.id, email: a.email || undefined, type: 'application_created', title: 'New Tenant Application', message: `${applicantName} submitted an application.` });
      }
    }

    return res.status(200).json(app);
  } catch (e: any) {
    console.error('application create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
