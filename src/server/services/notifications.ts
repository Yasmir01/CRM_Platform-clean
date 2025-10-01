import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createNotification(userId: string, type: string, title: string, message: string) {
  return prisma.notification.create({
    data: { userId, type, title, message },
  });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}
