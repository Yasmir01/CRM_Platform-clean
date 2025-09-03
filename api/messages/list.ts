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
  const userId = String((auth as any).sub || (auth as any).id);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'unauthorized' });

    const isSuper = user.role === 'SUPER_ADMIN';
    const isOrgAdmin = ['ADMIN','MANAGER','OWNER'].includes(user.role as any);

    let threads;
    if (isSuper || isOrgAdmin) {
      threads = await prisma.messageThread.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: 'desc' }, take: 100 });
    } else {
      threads = await prisma.messageThread.findMany({
        where: { orgId: user.orgId, messages: { some: { senderId: user.id } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    return res.status(200).json(threads);
  } catch (e: any) {
    console.error('threads list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
