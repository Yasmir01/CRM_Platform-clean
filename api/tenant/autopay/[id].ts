import { prisma } from '../../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { id } = req.query as { id?: string };
    if (!id) return res.status(400).json({ error: 'id required' });

    const ap = await prisma.autoPay.findUnique({ where: { id: String(id) } });
    if (!ap) return res.status(404).json({ error: 'not found' });

    await prisma.autoPay.update({ where: { id: ap.id }, data: { active: false } });
    await prisma.user.update({ where: { id: ap.tenantId }, data: { autopayEnabled: false } });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('tenant/autopay/[id] DELETE error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
