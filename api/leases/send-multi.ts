import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { getMultiSignProvider } from '../../src/lib/signature/provider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','SUPER_ADMIN','MANAGER'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { leaseDocumentId, signers } = body as { leaseDocumentId: string, signers: { name: string; email: string; role: string; order: number }[] };
  if (!leaseDocumentId || !signers?.length) return res.status(400).json({ error: 'missing fields' });

  const doc = await prisma.leaseDocument.findUnique({ where: { id: leaseDocumentId } });
  if (!doc) return res.status(404).json({ error: 'lease doc not found' });

  await prisma.leaseSigner.deleteMany({ where: { leaseDocumentId } });
  await prisma.leaseSigner.createMany({ data: signers.map((sg) => ({ leaseDocumentId, ...sg, status: 'pending' })) });

  const provider = await getMultiSignProvider();
  const xfProto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const xfHost = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
  const baseUrl = (process.env as any).PUBLIC_BASE_URL || (xfHost ? `${xfProto}://${xfHost}` : '');

  const resEnv = await provider.createEnvelopeMulti({
    title: doc.title,
    html: doc.html,
    signers,
    redirectUrl: `${baseUrl}/tenant/leases/${doc.id}?signed=1`,
  });

  await prisma.leaseDocument.update({ where: { id: doc.id }, data: { envelopeId: resEnv.envelopeId, status: 'sent' } });

  const minOrder = Math.min(...signers.map((s) => s.order));
  await prisma.leaseSigner.updateMany({ where: { leaseDocumentId, order: minOrder }, data: { status: 'sent' } });

  return res.status(200).json({ envelopeId: resEnv.envelopeId, signerLinks: resEnv.signerLinks || [] });
}
