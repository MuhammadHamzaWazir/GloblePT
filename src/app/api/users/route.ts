import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    include: { role: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name, email, password, roleId } = await req.json();
  const user = await prisma.user.create({
    data: { name, email, password, roleId },
  });
  return NextResponse.json(user);
}
