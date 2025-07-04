import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name } = await req.json();
  const permission = await prisma.permission.update({
    where: { id },
    data: { name },
  });
  return NextResponse.json(permission);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.permission.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
