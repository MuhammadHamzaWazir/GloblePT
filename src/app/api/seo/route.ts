import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const seo = await prisma.sEOSetting.findMany();
  return NextResponse.json(seo);
}

export async function POST(req: NextRequest) {
  const { page, title, description, canonical } = await req.json();
  const seo = await prisma.sEOSetting.upsert({
    where: { page },
    update: { title, description, canonical },
    create: { page, title, description, canonical },
  });
  return NextResponse.json(seo);
}

export async function DELETE(req: NextRequest) {
  const { page } = await req.json();
  await prisma.sEOSetting.delete({ where: { page } });
  return NextResponse.json({ success: true });
}
