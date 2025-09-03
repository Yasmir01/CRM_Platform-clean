import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { renderTemplate } from '../../src/lib/templates/render';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','SUPER_ADMIN','MANAGER'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { oldLeaseId, rentIncreasePercent, newStart, newEnd } = body as { oldLeaseId: string, rentIncreasePercent?: number, newStart?: string, newEnd?: string };
  if (!oldLeaseId) return res.status(400).json({ error: 'oldLeaseId required' });

  const old = await prisma.leaseDocument.findUnique({ where: { id: String(oldLeaseId) } });
  if (!old) return res.status(404).json({ error: 'Old lease not found' });

  const match = String(old.html || '').match(/Rent:\s*\$?(\d+)/i);
  const oldRent = match ? parseInt(match[1], 10) : 1000;
  const pct = typeof rentIncreasePercent === 'number' ? rentIncreasePercent : 0;
  const newRent = Math.round(oldRent * (1 + pct / 100));

  const variables = {
    tenant: { name: 'Same Tenant', email: '' },
    property: { address: 'Same Property' },
    lease: { rent: newRent, start: newStart, end: newEnd }
  } as const;

  const newHtml = renderTemplate(old.html, variables as any);

  const draft = await prisma.leaseDocument.create({
    data: {
      orgId: old.orgId,
      propertyId: old.propertyId,
      tenantId: old.tenantId,
      templateId: old.templateId,
      title: `Renewal of ${old.title}`,
      html: newHtml,
      status: 'draft',
      renewalOfId: old.id,
    },
  });

  return res.status(200).json({ renewal: draft, oldRent, newRent });
}
