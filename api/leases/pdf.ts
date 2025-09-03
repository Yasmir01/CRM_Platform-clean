import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { htmlToPdfBytes } from '../../src/lib/pdf/renderHtmlToPdf';
import { putBufferToS3 } from '../../src/lib/storage/s3';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const id = String((req.query?.id as string) || '');
  if (!id) return res.status(400).json({ error: 'id required' });

  const doc = await prisma.leaseDocument.findUnique({ where: { id } });
  if (!doc) return res.status(404).json({ error: 'not found' });

  const pdf = await htmlToPdfBytes(doc.html);
  const store = String(req.query?.store || '') === '1';

  if (store) {
    const key = `leases/${doc.id}/generated-${Date.now()}.pdf`;
    const url = await putBufferToS3(pdf, key);
    await prisma.leaseDocument.update({ where: { id: doc.id }, data: { generatedPdfUrl: url } });
    return res.status(200).json({ ok: true, url });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${(doc.title || 'lease').replace(/\s+/g, '_')}.pdf"`);
  return res.status(200).send(Buffer.from(pdf));
}
