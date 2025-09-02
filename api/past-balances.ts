import { prisma } from './_db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Try reading from a view named "PastTenantBalance" if it exists
    try {
      const rows = await prisma.$queryRaw<{
        leaseId: string;
        tenantId: string;
        tenantName: string;
        unitNumber: string;
        outstandingCents: number;
      }[]>`
        SELECT 
          leaseId as "leaseId",
          tenantId as "tenantId",
          tenantName as "tenantName",
          unitNumber as "unitNumber",
          outstandingCents as "outstandingCents"
        FROM "PastTenantBalance"
        ORDER BY outstandingCents DESC
      `;
      return res.status(200).json(rows);
    } catch (_err) {
      // Fallback: compute balances from regular tables
    }

    // Fallback computation: all TERMINATED leases with non-zero balance
    const terminatedLeases = await prisma.lease.findMany({
      where: { status: 'TERMINATED' as any },
      select: {
        id: true,
        tenantId: true,
        tenant: { select: { name: true } },
        unit: { select: { number: true } },
      },
    });

    if (terminatedLeases.length === 0) return res.status(200).json([]);

    const leaseIds = terminatedLeases.map((l) => l.id);
    const sums = await prisma.ledgerEntry.groupBy({
      by: ['leaseId'],
      where: { leaseId: { in: leaseIds } },
      _sum: { amountCents: true },
    });

    const outstanding = sums
      .filter((g) => (g._sum?.amountCents ?? 0) !== 0)
      .map((g) => {
        const lease = terminatedLeases.find((l) => l.id === g.leaseId)!;
        return {
          leaseId: g.leaseId,
          tenantId: lease.tenantId,
          tenantName: lease.tenant?.name || 'Unknown Tenant',
          unitNumber: lease.unit?.number || '',
          outstandingCents: g._sum?.amountCents || 0,
        };
      })
      .sort((a, b) => (b.outstandingCents || 0) - (a.outstandingCents || 0));

    return res.status(200).json(outstanding);
  } catch (error: any) {
    console.error('Past balances API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
