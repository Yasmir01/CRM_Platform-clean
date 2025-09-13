import { NextResponse } from 'next/server';
import { NextResponse } from "next/server";
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

// GET reminders for logged-in tenant
export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(reminders);
}

// POST create a reminder (admin use only)
export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const reminder = await prisma.reminder.create({
    data: {
      tenantId: body.tenantId,
      type: body.type,
      message: body.message,
      dueDate: new Date(body.dueDate),
    },
  });

  // create notification and email
  try {
    const { createNotification } = await import('../../../../lib/notify');
    await createNotification(String(body.tenantId), 'reminder', `New reminder: ${body.message}`);
  } catch (e) {
    console.warn('Failed to create notification for reminder', e);
  }

  return NextResponse.json(reminder);
}
