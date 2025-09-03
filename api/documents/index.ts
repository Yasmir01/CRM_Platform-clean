import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN', 'OWNER', 'MANAGER'].includes(user.role as any);

  try {
    let where: any = {};
    if (isSuperAdmin) {
      // no additional filter
    } else if (isOrgAdmin) {
      where.orgId = user.orgId;
    } else {
      // Tenant/Vendor: only own uploads for now
      where = { uploadedBy: user.id };
    }

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const bucket = process.env.S3_BUCKET as string;
    const result = await Promise.all(
      docs.map(async (d) => {
        let url = d.url;
        if (bucket && d.url && !/^https?:\/\//i.test(d.url)) {
          try {
            const cmd = new GetObjectCommand({ Bucket: bucket, Key: d.url });
            url = await getSignedUrl(s3, cmd, { expiresIn: 300 }); // 5 minutes
          } catch {}
        }
        return { ...d, url };
      })
    );

    return res.status(200).json(result);
  } catch (e: any) {
    console.error('documents list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
