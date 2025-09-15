import { prisma } from "@/lib/prisma";
import { canUseReminders } from "@/lib/planRules";

export async function isRemindersAllowedForSubscriber(subscriberId: string) {
  if (!subscriberId) return false;
  const s = await prisma.subscriber.findUnique({
    where: { id: subscriberId },
    select: { enableReminders: true, remindersEnabledByAdmin: true, plan: true },
  });
  if (!s) return false;
  if (s.remindersEnabledByAdmin === false) return false;
  if (!s.enableReminders) return false;
  if (!canUseReminders(s.plan as any)) return false;
  return true;
}
