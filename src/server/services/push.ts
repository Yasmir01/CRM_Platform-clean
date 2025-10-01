import { PrismaClient } from "@prisma/client";
import { Expo } from "expo-server-sdk";

const prisma = new PrismaClient();
const expo = new Expo();

export async function registerPushToken(userId: string, token: string, platform?: string) {
  if (!Expo.isExpoPushToken(token)) throw new Error("Invalid Expo push token");
  await prisma.pushToken.upsert({
    where: { token },
    create: { userId, token, platform },
    update: { userId, platform },
  });
  return true;
}

export async function sendToUsers(
  userIds: string[],
  payload: { title: string; body: string; data?: Record<string, any>; sound?: "default" | null }
) {
  if (userIds.length === 0) return;
  const tokens = await prisma.pushToken.findMany({ where: { userId: { in: userIds } } });
  if (tokens.length === 0) return;
  const messages = tokens.map((t) => ({
    to: t.token,
    title: payload.title,
    body: payload.body,
    sound: payload.sound ?? "default",
    data: payload.data ?? {},
  }));
  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
}
