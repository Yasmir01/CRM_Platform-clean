import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  try {
    const id = String((req.query?.id as string) || '');
    if (!id) return res.status(400).json({ error: 'id required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'unauthorized' });

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'not found' });

    const isOrgAdmin = ['ADMIN', 'OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(user.role as any);
    const isUploader = doc.uploadedBy === user.id;
    if (!(isOrgAdmin || isUploader)) return res.status(403).json({ error: 'forbidden' });

    await prisma.document.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('document delete error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
