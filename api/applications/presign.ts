import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { prisma } from '../_db';
import { rateLimit } from '../../src/utils/rateLimit';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  const ip = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || (req.socket as any).remoteAddress || 'unknown';
  const { allowed, remaining } = rateLimit(ip, req.url || 'app-presign', 30, 60_000);
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  if (!allowed) return res.status(429).json({ error: 'Too many requests' });

  const bucket = process.env.S3_BUCKET as string;
  if (!bucket) return res.status(500).json({ error: 'S3_BUCKET not set' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const appId = String(body.appId || '');
  const type = String(body.type || 'other');
  if (!appId) return res.status(400).json({ error: 'appId required' });

  const app = await prisma.tenantApplication.findUnique({ where: { id: appId } });
  if (!app) return res.status(404).json({ error: 'application not found' });

  const key = `applications/${appId}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${type}.pdf`;
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: 'application/pdf', ACL: 'private', Metadata: { appId, type } });
  const url = await getSignedUrl(s3, cmd, { expiresIn: 300 });

  return res.status(200).json({ uploadUrl: url, key });
}
