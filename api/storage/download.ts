import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getUserOr401 } from '../../src/utils/authz';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const bucket = process.env.S3_BUCKET as string;
    const key = String((req.query as any)?.key || '');
    if (!bucket || !key) return res.status(400).json({ error: 'Missing params' });

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    res.statusCode = 302;
    res.setHeader('Location', url);
    return res.end();
  } catch (e: any) {
    console.error('download presign error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
