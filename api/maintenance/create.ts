import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getUserOr401 } from '../../src/utils/authz';
import { maintenanceStore, type MaintenanceRecord } from './_store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const user = getUserOr401(req, res);
  if (!user) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { title, description, s3Key } = body as { title?: string; description?: string; s3Key?: string | null };
  if (!title || !description) return res.status(400).json({ error: 'missing' });

  const now = new Date().toISOString();
  const rec: MaintenanceRecord = {
    id: crypto.randomUUID(),
    tenantId: String((user as any).sub || (user as any).id),
    title,
    description,
    attachmentKey: s3Key || null,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };

  maintenanceStore.unshift(rec);
  return res.status(201).json(rec);
}
