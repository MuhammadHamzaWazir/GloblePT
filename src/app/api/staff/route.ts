import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('pharmacy_auth')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // Get users with staff or admin roles
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['staff', 'admin']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        staff: staffUsers
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch staff members'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, address } = await req.json();
    const staff = await prisma.staff.create({
      data: { name, email, phone, address },
    });
    return NextResponse.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create staff member'
    }, { status: 500 });
  }
}
