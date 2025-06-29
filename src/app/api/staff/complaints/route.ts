import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Fetch assigned complaints (staff only)
export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token and check role
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || !['staff', 'admin'].includes(user.role?.name || '')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Staff access required' 
      }, { status: 403 });
    }

    // Find staff record
    const staff = await prisma.staff.findUnique({
      where: { email: user.email }
    });

    if (!staff) {
      return NextResponse.json({ 
        success: false, 
        message: 'Staff record not found' 
      }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause - only assigned complaints
    const where: any = { 
      assignedToId: staff.id 
    };
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Fetch assigned complaints
    const [complaints, totalComplaints] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true
            }
          },
          assignedBy: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.complaint.count({ where })
    ]);

    const totalPages = Math.ceil(totalComplaints / limit);

    return NextResponse.json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: page,
          totalPages,
          totalComplaints,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching staff complaints:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch complaints' 
    }, { status: 500 });
  }
}
