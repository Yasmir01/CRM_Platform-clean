import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const filename = String(body.filename || `upload-${Date.now()}`);
    const contentType = String(body.contentType || 'application/octet-stream');

    // If AWS credentials are present, generate real presigned URL (not implemented here)
    if (!process.env.AWS_S3_BUCKET) {
      // return stub URL where front-end should PUT file; in production, return signed URL
      const uploadUrl = `https://storage.example.com/uploads/${encodeURIComponent(filename)}`;
      const fileUrl = uploadUrl;
      return res.status(200).json({ uploadUrl, fileUrl, method: 'PUT' });
    }

    // Production: create signed URL using aws-sdk (left as future work)
    return res.status(500).json({ error: 'S3 presign not configured' });
  } catch (e: any) {
    console.error('documents/presign error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
