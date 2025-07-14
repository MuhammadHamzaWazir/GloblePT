import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../../../lib/api-helpers';

// GET - Get all staff members
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Staff API - GET request received');

    // Check authentication
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (!user) {
      console.log('❌ No authentication found');
      return createErrorResponse('Authentication required', 401);
    }

    console.log('🔍 User found:', user.name, '(' + user.role + ')');

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('❌ Admin access required');
      return createErrorResponse('Admin access required', 403);
    }

    // Get all users with staff or assistant roles
    const staff = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'staff' },
          { role: 'assistant' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    console.log('✅ Staff records fetched:', staff.length);

    return createSuccessResponse({ staff });

  } catch (error) {
    console.error('❌ Error fetching staff:', error);
    return handleApiError(error);
  }
}
