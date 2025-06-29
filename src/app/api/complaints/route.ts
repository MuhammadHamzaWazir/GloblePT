import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const userId = formData.get('userId') as string | null;
  let fileUrl = '';
  const file = formData.get('file') as File | null;
  if (file) {
    // For demo: just use file name as URL. In production, upload to S3 or similar.
    fileUrl = `/uploads/${file.name}`;
  }
  const complaint = await prisma.complaint.create({
    data: { name, email, message, fileUrl, userId: userId || undefined },
  });
  return NextResponse.json(complaint);
}

export async function GET() {
  const complaints = await prisma.complaint.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(complaints);
}

export async function PUT(req: NextRequest) {
  const { id, status } = await req.json();
  const complaint = await prisma.complaint.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json(complaint);
}
