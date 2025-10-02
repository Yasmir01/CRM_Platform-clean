import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';
import { syncSeats } from '../src/lib/stripeSeats';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = getUserOr401(req, res);
  if (!auth) return;

  const userId = String((auth as any).sub || (auth as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const created = await prisma.user.create({ data: { email: String(body.email), name: body.name ?? '', role: body.role ?? 'TENANT', accountId: String(body.accountId) } });
      // sync seats
      if (body.accountId) await syncSeats(String(body.accountId));
      return res.status(200).json(created);
    }

    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const uid = String(body.userId || '');
      const accountId = String(body.accountId || '');
      await prisma.user.delete({ where: { id: uid } });
      if (accountId) await syncSeats(accountId);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'POST, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('users API error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
