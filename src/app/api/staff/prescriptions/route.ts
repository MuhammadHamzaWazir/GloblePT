import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/staff/prescriptions - Get prescriptions assigned to staff member
export async function GET(req: NextRequest) {
  try {
    // Check authentication and staff/admin role
    const user = await requireAuth(req);
    if (!user || !['STAFF', 'ADMIN'].includes(user.role.toUpperCase())) {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause - staff can see prescriptions assigned to them via Staff table
    const where: any = {};

    // If staff (not admin), only show prescriptions assigned to them
    // We need to find the staff record that matches the logged-in user's email
    if (user.role.toUpperCase() === 'STAFF') {
      // Find the staff record for this user
      const staffRecord = await prisma.staff.findUnique({
        where: { email: user.email }
      });
      
      if (staffRecord) {
        where.staffId = staffRecord.id;
      } else {
        // If no staff record found, return empty result
        where.staffId = -1; // Non-existent ID to return empty results
      }
    }
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { medicine: { contains: search } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const totalPrescriptions = await prisma.prescription.count({ where });

    // Get prescriptions with pagination and search
    const prescriptions = await prisma.prescription.findMany({
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
        staff: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc',
      },
      skip,
      take: limit,
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalPrescriptions / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return createSuccessResponse({
      prescriptions,
      pagination: {
        currentPage: page,
        totalPages,
        totalPrescriptions,
        limit,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
