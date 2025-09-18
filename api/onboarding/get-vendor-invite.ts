import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const token = String((req.query as any)?.token || '');
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const invite = await prisma.vendorInvite.findUnique({ where: { token } });
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return res.status(400).json({ error: 'Invite expired' });

    return res.status(200).json({ email: invite.email, name: invite.name, category: invite.category, vendorId: invite.vendorId });
  } catch (err: any) {
    console.error('get vendor invite error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
