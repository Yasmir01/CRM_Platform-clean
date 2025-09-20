import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = getUserOr401(req, res);
    if (!user) return;

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('multipart/form-data')) {
      // Multipart parsing is not implemented in this endpoint.
      // Recommended flow for file uploads from Builder.io: request a presigned upload URL from /api/storage/presign,
      // upload the file directly to S3 from the client, then POST to /api/maintenance/upload with JSON body including fileKey.
      return res.status(501).json({ error: 'Multipart uploads not supported. Use presigned upload + JSON POST with fileKey.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    const subject = String(body.subject || '').slice(0, 255);
    const description = String(body.description || '');
    const propertyId = body.propertyId || null;
    const fileKey = body.fileKey || null; // optional storage key returned by /api/storage/presign

    if (!subject) return res.status(400).json({ error: 'Missing subject' });

    let fileUrl: string | null = null;
    const bucket = process.env.AWS_S3_BUCKET;
    if (fileKey && bucket) {
      // Public URL assumption for S3; if your bucket requires custom domain or signed URLs, adapt accordingly.
      fileUrl = `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(fileKey)}`;
    } else if (fileKey) {
      // If no bucket configured, store the raw key
      fileUrl = String(fileKey);
    }

    const newReq = await prisma.maintenanceRequest.create({
      data: {
        tenantId: String(user.sub || user.id || ''),
        propertyId: propertyId || null,
        subject,
        description,
        status: 'open',
        // store file URL in description metadata if needed; in a full implementation you'd add a fileUrl column
      },
    });

    const payload = { ...newReq, fileUrl };
    return res.status(201).json(payload);
  } catch (e: any) {
    console.error('maintenance/upload error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
