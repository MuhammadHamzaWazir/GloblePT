import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const permissions = await prisma.permission.findMany();
  return NextResponse.json(permissions);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const permission = await prisma.permission.create({ data: { name } });
  return NextResponse.json(permission);
}
