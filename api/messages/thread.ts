import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../api/_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;

  const id = String((req.query?.id as string) || '');
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    return res.status(200).json(thread);
  } catch (e: any) {
    console.error('thread get error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
