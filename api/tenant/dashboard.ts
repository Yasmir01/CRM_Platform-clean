import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../api/_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userPayload = getUserOr401(req, res);
  if (!userPayload) return; // getUserOr401 already responded

  const userId = String(userPayload.sub || userPayload?.id || '');
  const roles: string[] = Array.isArray(userPayload.roles) ? userPayload.roles : [String(userPayload.role || '').toUpperCase()];
  const isTenant = roles.map(r => String(r).toUpperCase()).includes('TENANT');
  if (!isTenant) return res.status(401).json({ error: 'Unauthorized' });

  // Find associated Tenant record by matching email if possible
  const userEmail = String(userPayload.email || '');
  const tenantRecord = userEmail ? await prisma.tenant.findUnique({ where: { email: userEmail } as any }) : null;

  // Fetch leases for tenantRecord (if found)
  let leases: any[] = [];
  if (tenantRecord) {
    leases = await prisma.lease.findMany({
      where: { tenantId: tenantRecord.id, archived: false, status: 'ACTIVE' },
      include: { unit: { include: { property: true } }, property: true },
    });
  }

  // Fetch recent payments for this user (RentPayment.tenantId references User.id in this schema)
  const payments = await prisma.rentPayment.findMany({
    where: { tenantId: userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (!tenantRecord) {
    // If no Tenant record found, return user info and payments only
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    return res.status(200).json({ tenant: dbUser ? { name: dbUser.name, email: dbUser.email } : null, lease: leases[0] || null, payments });
  }

  return res.status(200).json({ tenant: { name: tenantRecord.name, email: tenantRecord.email }, lease: leases[0] || null, payments });
}
