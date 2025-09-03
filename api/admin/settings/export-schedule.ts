import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return getSchedule(req, res);
  if (req.method === 'PUT') return putSchedule(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method Not Allowed' });
}

async function getSchedule(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req, res, 'reports:read');
  if (!user) return;
  const orgId = String((user as any).orgId || 'global');
  const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
  return res.status(200).json({ schedule: settings?.exportSchedule || 'daily' });
}

async function putSchedule(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req, res, 'reports:read');
  if (!user) return;
  const orgId = String((user as any).orgId || 'global');
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const schedule = String(body.schedule || '');
  if (!['daily', 'weekly', 'monthly'].includes(schedule)) {
    return res.status(400).json({ error: 'Invalid schedule' });
  }
  await prisma.orgSettings.upsert({
    where: { orgId },
    update: { exportSchedule: schedule },
    create: { orgId, exportSchedule: schedule },
  });
  return res.status(200).json({ ok: true });
}
