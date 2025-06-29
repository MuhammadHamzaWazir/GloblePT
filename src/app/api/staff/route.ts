import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const staff = await prisma.staff.findMany();
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const { name, email, position, phone } = await req.json();
  const staff = await prisma.staff.create({
    data: { name, email, position, phone },
  });
  return NextResponse.json(staff);
}
