import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/supervisor/prescriptions - Get all unapproved prescriptions for supervisor review
export async function GET(req: NextRequest) {
  try {
    // Check authentication and supervisor role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'SUPERVISOR') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for unapproved prescriptions only
    const where: any = {
      status: 'unapproved'
    };
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { medicine: { contains: search } },
        { prescriptionText: { contains: search } }
      ];
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
        createdAt: 'desc',
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

// POST /api/supervisor/prescriptions - Approve or reject a prescription
export async function POST(req: NextRequest) {
  try {
    // Check authentication and supervisor role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'SUPERVISOR') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { prescriptionId, action, notes } = await req.json();

    if (!prescriptionId || !action) {
      return createErrorResponse("Prescription ID and action are required", 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return createErrorResponse("Action must be 'approve' or 'reject'", 400);
    }

    // Check if prescription exists and is unapproved
    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(prescriptionId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!prescription) {
      return createErrorResponse("Prescription not found", 404);
    }

    if (prescription.status !== 'unapproved') {
      return createErrorResponse("Prescription has already been reviewed", 400);
    }

    // Update prescription status
    const updatedPrescription = await prisma.prescription.update({
      where: { id: parseInt(prescriptionId) },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        approvedBy: parseInt(user.id),
        approvedAt: new Date(),
        rejectedReason: action === 'reject' ? notes : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return createSuccessResponse({
      prescription: updatedPrescription,
      message: `Prescription ${action}d successfully`
    });

  } catch (error) {
    return handleApiError(error);
  }
}
