import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { maintenanceStore } from './_store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const user = getUserOr401(req, res);
  if (!user) return;

  const tenantId = String((user as any).sub || (user as any).id);
  const items = maintenanceStore.filter((m) => m.tenantId === tenantId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.status(200).json(items);
}
