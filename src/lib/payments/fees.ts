import { prisma } from '@/lib/prisma';

export async function calculateLateFee(propertyId: string | null | undefined, rentDate: Date) {
  const global = await prisma.globalPaymentSetting.findFirst();
  let propertyOverride: any = null;
  if (propertyId) {
    propertyOverride = await prisma.propertyPaymentSetting.findUnique({ where: { propertyId } });
  }

  const dueDay = propertyOverride?.dueDay ?? global?.dueDay ?? 1;
  const grace = propertyOverride?.gracePeriod ?? global?.gracePeriod ?? 3;
  const fee = propertyOverride?.lateFee ?? global?.lateFee ?? 50;

  const dueDate = new Date(rentDate.getFullYear(), rentDate.getMonth(), dueDay);
  const graceEnd = new Date(dueDate);
  graceEnd.setDate(graceEnd.getDate() + grace);

  const now = new Date();

  if (now > graceEnd) {
    return { isLate: true, lateFee: fee } as const;
  }

  return { isLate: false, lateFee: 0 } as const;
}
