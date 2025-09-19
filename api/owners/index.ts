import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const owners = await prisma.owner.findMany({ include: { user: true, properties: true } });
      return res.status(200).json(owners);
    }

    if (req.method === 'POST') {
      // create owner record linked to existing user
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const userId = String(body.userId || '').trim();
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      if (!userId || !name || !email) return res.status(400).json({ error: 'Missing fields' });
      const owner = await prisma.owner.create({ data: { userId, name, email } });
      return res.status(200).json(owner);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('owners/index error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
