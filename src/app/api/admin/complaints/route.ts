import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../../../lib/api-helpers';

// GET - Fetch all complaints (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin complaints API - GET request received');
    
    // Check authentication
    const user = await requireAuth(request);
    console.log('🔍 Auth result:', user ? `${user.name} (${user.role})` : 'No user found');
    
    if (!user) {
      console.log('❌ No authentication found');
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('❌ Admin access required, user role:', user.role);
      return createErrorResponse('Admin access required', 403);
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const priority = searchParams.get('priority') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    console.log('🔍 Query parameters:', { page, limit, status, category, priority, search });
    console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
    console.log('🔍 Skip:', skip, 'Take:', limit);

    // First, let's check if there are any complaints at all
    const totalComplaintsInDB = await prisma.complaint.count();
    console.log('🔍 Total complaints in database:', totalComplaintsInDB);

    // Fetch complaints
    const [complaints, totalComplaints] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          assignedTo: {
            select: {
              id: true,
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
    
    console.log('🔍 Query results:', {
      complaintsFound: complaints.length,
      totalComplaints,
      totalPages,
      currentPage: page
    });

    return createSuccessResponse({
      complaints,
      pagination: {
        currentPage: page,
        totalPages,
        totalComplaints,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching complaints:', error);
    return handleApiError(error);
  }
}
