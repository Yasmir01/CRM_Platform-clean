import { PrismaClient } from "@prisma/client";
import { createNotification } from "./notifications";

const prisma = new PrismaClient();

export async function createThread(subject: string, memberIds: string[]) {
  const thread = await prisma.messageThread.create({ data: { subject } });
  if (memberIds.length) {
    await prisma.threadMember.createMany({
      data: memberIds.map((uid) => ({ threadId: thread.id, userId: uid })),
    });
  }
  return thread;
}

export async function sendMessage(threadId: string, authorId: string, body: string) {
  const msg = await prisma.message.create({
    data: { threadId, authorId, body },
    include: { author: true },
  });

  const members = await prisma.threadMember.findMany({ where: { threadId } });
  const targets = members.filter((m) => m.userId !== authorId).map((m) => m.userId);

  await Promise.all(
    targets.map((uid) =>
      createNotification(uid, "MESSAGE", `New message in ${threadId}`, body)
    )
  );

  // touch thread updatedAt
  await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

  return msg;
}

export async function listThreads(userId: string) {
  return prisma.messageThread.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      members: true,
    },
  });
}

export async function listMessages(threadId: string) {
  return prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    include: { author: true },
  });
}
