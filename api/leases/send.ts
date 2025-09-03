import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { getSignProvider } from '../../src/lib/signature/provider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','SUPER_ADMIN','MANAGER'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { leaseDocumentId, tenantEmail, tenantName } = body as any;
  if (!leaseDocumentId || !tenantEmail || !tenantName) return res.status(400).json({ error: 'missing fields' });

  const doc = await prisma.leaseDocument.findUnique({ where: { id: String(leaseDocumentId) } });
  if (!doc) return res.status(404).json({ error: 'lease doc not found' });

  const provider = await getSignProvider();
  const xfProto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const xfHost = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
  const baseUrl = (process.env as any).PUBLIC_BASE_URL || (xfHost ? `${xfProto}://${xfHost}` : '');

  const resEnv = await provider.createEnvelope({
    title: doc.title,
    html: doc.html,
    tenantEmail,
    tenantName,
    redirectUrl: `${baseUrl}/tenant/leases/${doc.id}?signed=1`,
  });

  await prisma.leaseDocument.update({ where: { id: doc.id }, data: { envelopeId: resEnv.envelopeId, status: 'sent' } });
  await prisma.signatureEvent.create({ data: { envelopeId: resEnv.envelopeId, type: 'sent', payload: { leaseDocumentId } } });

  return res.status(200).json({ signUrl: resEnv.signUrl, envelopeId: resEnv.envelopeId });
}
