import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../api/_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const items = await prisma.scheduledExport.findMany({ where: { suId: String((user as any).sub || (user as any).id) } });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { type, frequency, email } = body;
      if (!type || !frequency || !email) return res.status(400).json({ error: 'Missing fields' });
      const created = await prisma.scheduledExport.create({ data: { type, frequency, email, suId: String((user as any).sub || (user as any).id) } });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('scheduled-exports index error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
