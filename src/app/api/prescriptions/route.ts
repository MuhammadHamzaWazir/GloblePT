import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const staffId = req.nextUrl.searchParams.get('staffId');
  let where = {};
  if (userId) where = { ...where, userId };
  if (staffId) where = { ...where, staffId };
  const prescriptions = await prisma.prescription.findMany({
    where,
    include: { user: true, staff: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(prescriptions);
}

export async function POST(req: NextRequest) {
  const { userId, description, imageUrl, deliveryAddress } = await req.json();
  const prescription = await prisma.prescription.create({
    data: { userId, description, imageUrl, deliveryAddress },
  });
  return NextResponse.json(prescription);
}
