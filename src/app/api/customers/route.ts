import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const customers = await prisma.customer.findMany();
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const { name, email, address, phone } = await req.json();
  const customer = await prisma.customer.create({
    data: { name, email, address, phone },
  });
  return NextResponse.json(customer);
}
