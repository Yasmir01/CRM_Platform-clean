import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { contacts: { orderBy: { updatedAt: 'desc' } } },
    });
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(company);
  } catch (e: any) {
    console.error('GET /api/companies/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
