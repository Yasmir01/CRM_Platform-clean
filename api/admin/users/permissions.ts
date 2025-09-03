import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') return res.status(405).end('Method Not Allowed');
  const user = ensurePermission(req, res, '*');
  if (!user) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { id, permissions } = body as { id?: string; permissions?: string[] };
  if (!id || !Array.isArray(permissions)) return res.status(400).json({ error: 'invalid' });

  await prisma.user.update({
    where: { id },
    data: { permissions: permissions.length ? permissions.join(',') : null },
  });

  return res.status(200).json({ ok: true });
}
