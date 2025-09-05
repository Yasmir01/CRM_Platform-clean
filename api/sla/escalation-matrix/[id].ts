import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  const id = (req.query?.id as string) || '';
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    if (req.method === 'PATCH' || req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const updated = await prisma.escalationMatrix.update({
        where: { id },
        data: {
          level: body.level !== undefined ? Number(body.level) : undefined,
          role: body.role ? String(body.role).toUpperCase() : undefined,
          hoursAfterDeadline: body.hoursAfterDeadline !== undefined ? Number(body.hoursAfterDeadline) : undefined,
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.escalationMatrix.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'PATCH,PUT,DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('escalation-matrix [id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
