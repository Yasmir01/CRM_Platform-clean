import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

const ALLOWED_TYPES = new Set(['lease','insurance','id','invoice','other']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'unauthorized' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = String(body.name || '').trim();
    const type = String(body.type || 'other').trim();
    const key = String(body.key || '').trim();
    const tenantId = body.tenantId ? String(body.tenantId) : null;
    const leaseId = body.leaseId ? String(body.leaseId) : null;

    if (!name || !key) return res.status(400).json({ error: 'name and key are required' });
    if (!ALLOWED_TYPES.has(type)) return res.status(400).json({ error: 'invalid type' });

    const doc = await prisma.document.create({
      data: {
        orgId: user.orgId,
        uploadedBy: user.id,
        tenantId: tenantId || undefined,
        leaseId: leaseId || undefined,
        type,
        name,
        url: key, // store S3 key; signed URL is provided by list endpoint
      },
    });

    return res.status(200).json(doc);
  } catch (e: any) {
    console.error('document create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
