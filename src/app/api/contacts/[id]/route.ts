import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { company: true, notes: { orderBy: { createdAt: 'desc' } }, owner: true },
    });
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(contact);
  } catch (e: any) {
    console.error('GET /api/contacts/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
