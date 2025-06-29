import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Fetch customer's complaints
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

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    if (status) where.status = status;
    if (category) where.category = category;

    // Fetch complaints
    const [complaints, totalComplaints] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
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
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch complaints' 
    }, { status: 500 });
  }
}

// POST - Create new complaint
export async function POST(request: NextRequest) {
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

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { title, description, category, priority, fileUrl } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ 
        success: false, 
        message: 'Title and description are required' 
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['service', 'staff', 'product', 'delivery', 'billing'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid category' 
      }, { status: 400 });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid priority' 
      }, { status: 400 });
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        category: category || 'service',
        priority: priority || 'medium',
        fileUrl: fileUrl || null,
        status: 'received'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { complaint }
    });

  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit complaint' 
    }, { status: 500 });
  }
}
