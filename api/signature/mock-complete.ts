import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { envelopeId, email } = body || {};
  if (!envelopeId || !email) return res.status(400).json({ error: 'missing fields' });

  const lease = await prisma.leaseDocument.findFirst({ where: { envelopeId: String(envelopeId) } });
  if (!lease) return res.status(404).json({ error: 'lease not found' });

  const signer = await prisma.leaseSigner.findFirst({ where: { leaseDocumentId: lease.id, email: String(email) } });
  if (!signer) return res.status(404).json({ error: 'signer not found' });

  await prisma.leaseSigner.update({ where: { id: signer.id }, data: { status: 'signed', signedAt: new Date() } });

  const remaining = await prisma.leaseSigner.findMany({ where: { leaseDocumentId: lease.id } });
  const unsigned = remaining.filter((s) => s.status !== 'signed');
  if (unsigned.length === 0) {
    await prisma.leaseDocument.update({ where: { id: lease.id }, data: { status: 'signed' } });
  } else {
    const nextOrder = Math.min(...unsigned.map((s) => s.order));
    await prisma.leaseSigner.updateMany({ where: { leaseDocumentId: lease.id, order: nextOrder, status: 'pending' }, data: { status: 'sent' } });
  }

  return res.status(200).json({ ok: true });
}
