import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: { contacts: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(companies);
  } catch (e: any) {
    console.error('GET /api/companies error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const company = await prisma.company.create({
      data: {
        name: data.name,
        domain: data.domain || null,
        industry: data.industry || null,
      },
    });
    return NextResponse.json(company, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/companies error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
