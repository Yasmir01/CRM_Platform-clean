import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.max(parseInt(url.searchParams.get('pageSize') || '10', 10), 1);
    const search = (url.searchParams.get('search') || '').trim();
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({ tickets, total, page, totalPages: Math.max(Math.ceil(total / pageSize), 1) });
  } catch (err) {
    console.error('GET /api/tickets (app route) error', err);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority, status } = body || {};

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const data: any = {
      title: String(title),
      description: String(description),
      priority: priority || 'medium',
      status: status || 'open',
    };

    const ticket = await prisma.ticket.create({ data });
    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    console.error('POST /api/tickets (app route) error', err);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
