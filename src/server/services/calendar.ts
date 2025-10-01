import { PrismaClient, EventType } from "@prisma/client";
import { sendToUsers } from "./push";

const prisma = new PrismaClient();

export async function createEvent(input: {
  organizationId: string;
  title: string;
  description?: string;
  type?: EventType;
  propertyId?: string;
  workOrderId?: string;
  startsAt: Date;
  endsAt: Date;
  allDay?: boolean;
  createdById: string;
  location?: string;
  attendeeIds?: { userId: string; role?: string }[];
}) {
  const event = await prisma.calendarEvent.create({
    data: {
      organizationId: input.organizationId,
      title: input.title,
      description: input.description,
      type: input.type ?? "OTHER",
      propertyId: input.propertyId,
      workOrderId: input.workOrderId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      allDay: !!input.allDay,
      createdById: input.createdById,
      location: input.location,
      attendees: {
        create: (input.attendeeIds || []).map((a) => ({ userId: a.userId, role: a.role, rsvp: "pending" })),
      },
    },
    include: { attendees: true },
  });

  const toIds = event.attendees.map((a) => a.userId);
  if (toIds.length) {
    await sendToUsers(toIds, {
      title: `New event: ${event.title}`,
      body: `${new Date(event.startsAt).toLocaleString()}${event.location ? " @ " + event.location : ""}`,
      data: { eventId: event.id },
    });
  }
  return event;
}

export async function updateEvent(
  eventId: string,
  patch: Partial<{
    title: string;
    description: string;
    type: EventType;
    startsAt: Date;
    endsAt: Date;
    allDay: boolean;
    location: string;
    status: string;
    propertyId?: string;
    workOrderId?: string;
  }>
) {
  const ev = await prisma.calendarEvent.update({ where: { id: eventId }, data: patch });
  const atts = await prisma.eventAttendee.findMany({ where: { eventId } });
  const toIds = atts.map((a) => a.userId);
  if (toIds.length) {
    await sendToUsers(toIds, { title: `Event updated`, body: ev.title, data: { eventId: ev.id } });
  }
  return ev;
}

export async function setRSVP(eventId: string, userId: string, rsvp: "yes" | "no" | "maybe") {
  return prisma.eventAttendee.update({
    where: { eventId_userId: { eventId, userId } },
    data: { rsvp },
  });
}

export async function cancelEvent(eventId: string) {
  const ev = await prisma.calendarEvent.update({ where: { id: eventId }, data: { status: "cancelled" } });
  const toIds = (await prisma.eventAttendee.findMany({ where: { eventId } })).map((a) => a.userId);
  if (toIds.length) {
    await sendToUsers(toIds, { title: `Event cancelled`, body: ev.title, data: { eventId } });
  }
  return ev;
}

export async function listEvents(organizationId: string, since?: Date, until?: Date) {
  return prisma.calendarEvent.findMany({
    where: {
      organizationId,
      ...(since || until
        ? { startsAt: { gte: since ?? new Date(0), lte: until ?? new Date(8640000000000000) } }
        : {}),
      status: { not: "cancelled" },
    },
    orderBy: { startsAt: "asc" },
    include: { attendees: true },
  });
}

export async function sendDailyEventReminders(organizationId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const todays = await prisma.calendarEvent.findMany({
    where: { organizationId, startsAt: { gte: start, lte: end }, status: "confirmed" },
    include: { attendees: true },
  });
  for (const e of todays) {
    const toIds = e.attendees.map((a) => a.userId);
    if (!toIds.length) continue;
    await sendToUsers(toIds, {
      title: `Today: ${e.title}`,
      body: `${new Date(e.startsAt).toLocaleTimeString()}${e.location ? " @ " + e.location : ""}`,
      data: { eventId: e.id },
    });
  }
  return todays.length;
}
