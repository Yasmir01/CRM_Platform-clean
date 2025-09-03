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
  const { templateId, title, propertyId, tenantId, variables } = body as any;
  if (!templateId || !title || !propertyId || !tenantId) return res.status(400).json({ error: 'missing fields' });

  const tpl = await prisma.leaseTemplate.findUnique({ where: { id: String(templateId) } });
  if (!tpl) return res.status(404).json({ error: 'template not found' });

  const html = renderTemplate(tpl.content, variables || {});
  const doc = await prisma.leaseDocument.create({ data: { orgId: user.orgId, propertyId, tenantId, templateId, title, html, status: 'draft' } });
  return res.status(200).json({ leaseDocument: doc });
}
