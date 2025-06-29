import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const roles = await prisma.role.findMany({ include: { permissions: true } });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const { name, permissionIds } = await req.json();
  const role = await prisma.role.create({
    data: {
      name,
      permissions: {
        connect: permissionIds?.map((id: string) => ({ id })) || [],
      },
    },
    include: { permissions: true },
  });
  return NextResponse.json(role);
}
