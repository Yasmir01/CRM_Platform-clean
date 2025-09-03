import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { isPublished } from './_store';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const units = await prisma.unit.findMany({ include: { property: true } }).catch(() => [] as any[]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<listings>\n`;

  for (const u of units) {
    if (!isPublished(u.id)) continue;
    const p = (u as any).property || {};
    const addr = p.address || '';
    const city = p.city || '';
    const state = p.state || '';
    const zip = p.zip || '';
    const rent = (u as any).rent ?? '';
    const bedrooms = (u as any).bedrooms ?? '';
    const bathrooms = (u as any).bathrooms ?? '';
    const available = (u as any).availableAt ? new Date((u as any).availableAt).toISOString().split('T')[0] : '';
    const description = (u as any).description || '';

    xml += `  <listing>\n` +
      `    <id>${u.id}</id>\n` +
      `    <address>${escapeXml(addr)}</address>\n` +
      `    <city>${escapeXml(city)}</city>\n` +
      `    <state>${escapeXml(state)}</state>\n` +
      `    <zip>${escapeXml(zip)}</zip>\n` +
      `    <rent>${rent}</rent>\n` +
      `    <bedrooms>${bedrooms}</bedrooms>\n` +
      `    <bathrooms>${bathrooms}</bathrooms>\n` +
      `    <available>${available}</available>\n` +
      `    <description>${escapeXml(description)}</description>\n` +
      `  </listing>\n`;
  }

  xml += `</listings>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}

function escapeXml(s: string) {
  return s.replace(/[<>&'\"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\"': '&quot;', "'": '&apos;' }[c] as string));
}
