import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

function toICalDate(d: Date) {
  // YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const q = (req.query || {}) as any;
    const propertyId = q.propertyId ? String(q.propertyId) : undefined;

    const where: any = {};
    if (propertyId) where.propertyId = propertyId;

    const events = await prisma.calendarEvent.findMany({ where, orderBy: { dueDate: 'asc' } });

    let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//YourApp//Calendar 1.0//EN\r\n';
    for (const e of events) {
      const dt = new Date(e.dueDate);
      ical += 'BEGIN:VEVENT\r\n';
      ical += `UID:${e.id}\r\n`;
      ical += `DTSTAMP:${toICalDate(new Date())}\r\n`;
      ical += `DTSTART:${toICalDate(dt)}\r\n`;
      ical += `SUMMARY:${(e.title || '').replace(/\r?\n/g, ' ')}\r\n`;
      if (e.description) ical += `DESCRIPTION:${(e.description || '').replace(/\r?\n/g, ' ')}\r\n`;
      ical += 'END:VEVENT\r\n';
    }
    ical += 'END:VCALENDAR\r\n';

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=events.ics');
    res.status(200).send(ical);
  } catch (e: any) {
    console.error('calendar/ical error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
