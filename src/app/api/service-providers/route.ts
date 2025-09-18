import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const providers = await prisma.serviceProvider.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(providers);
  } catch (err) {
    console.error('GET /api/service-providers (app route) error', err);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const provider = await prisma.serviceProvider.create({ data });
    return NextResponse.json(provider, { status: 201 });
  } catch (err) {
    console.error('POST /api/service-providers (app route) error', err);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    await prisma.serviceProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/service-providers (app route) error', err);
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
