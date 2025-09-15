import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const company = {
    id,
    name: 'Acme Corp',
    domain: 'acme.com',
    industry: 'Real Estate',
    contacts: [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
    ],
  };

  return NextResponse.json(company);
}
