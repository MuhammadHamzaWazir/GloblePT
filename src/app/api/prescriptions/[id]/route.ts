import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await req.json();
  const prescription = await prisma.prescription.update({
    where: { id },
    data,
  });
  return NextResponse.json(prescription);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  await prisma.prescription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
