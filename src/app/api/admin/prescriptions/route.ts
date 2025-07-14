import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/admin/prescriptions - Get all prescription requests with pagination and search
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
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

    // Build where clause for search and filters
    const where: any = {};
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { medicine: { contains: search } },
        { prescriptionText: { contains: search } }
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
