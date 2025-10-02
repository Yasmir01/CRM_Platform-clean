import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../api/_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  try {
    const id = String(req.query?.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { active } = body;
      const updated = await prisma.scheduledExport.update({ where: { id }, data: { active } });
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'PATCH');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('scheduled-exports id error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
