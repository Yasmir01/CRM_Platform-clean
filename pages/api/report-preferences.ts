import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userPayload = getUserOr401(req, res);
    if (!userPayload) return; // already responded 401

    const userId = String(userPayload.sub || userPayload?.id || '');
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const pref = await prisma.reportPreference.findFirst({ where: { userId } });
      return res.status(200).json({ pref });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const frequency = String(body.frequency || 'none');
      const format = String(body.format || 'pdf');

      const pref = await prisma.reportPreference.upsert({
        where: { userId },
        update: { frequency, format },
        create: { userId, frequency, format },
      });

      return res.status(200).json({ pref });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('report-preferences error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
