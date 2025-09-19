import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String((req.query as any)?.id || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(doc);
    }

    if (req.method === 'DELETE') {
      // permission check: uploader or admin
      const doc = await prisma.document.findUnique({ where: { id } });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      const uid = String((user as any).sub || (user as any).id);
      const role = String((user as any).role || '').toLowerCase();
      if (doc.uploadedBy !== uid && !role.includes('super') && !role.includes('admin')) return res.status(403).json({ error: 'forbidden' });
      await prisma.document.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'POST') {
      // actions: sign (stub)
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const action = String(body.action || '').toLowerCase();
      if (action === 'sign') {
        // In production, integrate with DocuSign/HelloSign
        // Here we return a stubbed sign URL and mark document metadata with signing request
        const signUrl = process.env.DOCUSIGN_STUB_URL || `https://docusign.example.com/sign/${id}`;
        await prisma.document.update({ where: { id }, data: { metadata: { signedRequest: true, requestedAt: new Date().toISOString(), signer: body.signerEmail || null } } as any });
        return res.status(200).json({ signUrl });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    res.setHeader('Allow', 'GET, DELETE, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('documents/[id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
