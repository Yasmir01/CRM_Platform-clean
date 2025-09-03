import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { envelopeId, event, signedPdfUrl } = body || {};
  if (!envelopeId || !event) return res.status(400).json({ error: 'envelopeId and event are required' });

  await prisma.signatureEvent.create({ data: { envelopeId: String(envelopeId), type: String(event), payload: body } });

  if (event === 'completed' || event === 'signed') {
    const doc = await prisma.leaseDocument.findFirst({ where: { envelopeId: String(envelopeId) } });
    if (doc) {
      await prisma.leaseDocument.update({ where: { id: doc.id }, data: { status: 'signed', signedPdfUrl: signedPdfUrl ?? doc.signedPdfUrl ?? null } });
    }
  }
  if (event === 'voided') {
    await prisma.leaseDocument.updateMany({ where: { envelopeId: String(envelopeId) }, data: { status: 'void' } });
  }

  return res.status(200).json({ ok: true });
}
