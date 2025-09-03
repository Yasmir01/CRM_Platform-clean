import { prisma } from '../../../api/_db';

export async function startTransUnionScreening(screeningId: string, appId: string) {
  await prisma.tenantScreening.update({ where: { id: screeningId }, data: { status: 'in_progress' } });
  // Simulate async completion
  setTimeout(async () => {
    try {
      await prisma.tenantScreening.update({
        where: { id: screeningId },
        data: {
          status: 'completed',
          reportUrl: 'https://example.com/mock-report.pdf',
          rawData: { creditScore: 720, evictionHistory: false, criminal: false },
        },
      });
    } catch {}
  }, 5000);
}
