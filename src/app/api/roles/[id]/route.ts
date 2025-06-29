import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, permissionIds } = await req.json();
  const role = await prisma.role.update({
    where: { id },
    data: {
      name,
      permissions: {
        set: permissionIds?.map((pid: string) => ({ id: pid })) || [],
      },
    },
    include: { permissions: true },
  });
  return NextResponse.json(role);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
