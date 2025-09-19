import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

// GET -> list documents (filter by property/tenant/vendor/type)
// POST -> create document record (expects fileUrl already uploaded or presigned upload completed)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const q = (req.query || {}) as any;
      const where: any = {};
      if (q.propertyId) where.propertyId = String(q.propertyId);
      if (q.tenantId) where.tenantId = String(q.tenantId);
      if (q.vendorId) where.vendorId = String(q.vendorId);
      if (q.type) where.type = String(q.type);

      const docs = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.status(200).json(docs);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const data: any = {
        propertyId: body.propertyId || undefined,
        tenantId: body.tenantId || undefined,
        vendorId: body.vendorId || undefined,
        type: String(body.type || 'general'),
        title: body.title ? String(body.title) : undefined,
        fileUrl: String(body.fileUrl || ''),
        uploadedBy: String((user as any).sub || (user as any).id),
        visibility: String(body.visibility || 'private'),
        metadata: body.metadata || undefined,
      };
      if (!data.fileUrl) return res.status(400).json({ error: 'fileUrl required' });
      const doc = await prisma.document.create({ data });
      return res.status(200).json(doc);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('documents/index error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
