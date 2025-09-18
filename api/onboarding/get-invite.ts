import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const token = String((req.query as any)?.token || '');
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const invite = await prisma.tenantInvite.findUnique({ where: { token } });
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return res.status(400).json({ error: 'Invite expired' });

    // return minimal info for pre-filling the signup form
    return res.status(200).json({ email: invite.email, tenantId: invite.tenantId, expiresAt: invite.expiresAt });
  } catch (err: any) {
    console.error('get-invite error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
