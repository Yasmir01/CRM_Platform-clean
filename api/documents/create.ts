import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const key = String(body.key || '').trim();
    const name = String(body.name || '') || (key && key.split('/').pop()) || 'file';
    const type = String(body.type || 'general');
    const propertyId = body.propertyId ? String(body.propertyId) : undefined;
    const tenantId = body.tenantId ? String(body.tenantId) : undefined;

    if (!key) return res.status(400).json({ error: 'Missing key' });

    // Determine fileUrl: if key looks like URL, use it; else prefix with ASSET_BASE_URL
    let fileUrl = key;
    if (!fileUrl.startsWith('http')) {
      const base = process.env.ASSET_BASE_URL || 'https://storage.example.com/uploads';
      fileUrl = base.replace(/\/$/, '') + '/' + encodeURIComponent(key);
    }

    const doc = await prisma.document.create({ data: {
      propertyId: propertyId || undefined,
      tenantId: tenantId || undefined,
      type,
      title: name,
      fileUrl,
      uploadedBy: String((user as any).sub || (user as any).id),
      visibility: 'private'
    } });

    return res.status(200).json(doc);
  } catch (e: any) {
    console.error('documents/create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
