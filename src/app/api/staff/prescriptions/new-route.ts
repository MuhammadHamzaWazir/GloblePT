import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/staff/prescriptions - Get all approved prescriptions for pricing
export async function GET(req: NextRequest) {
  try {
    // Check authentication and staff/admin role
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
    if (!user || !['STAFF', 'ADMIN'].includes(user.role.toUpperCase())) {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause - show approved prescriptions without price or all statuses if specified
    const where: any = {};
    
    if (status) {
      where.status = status;
    } else {
      // Default: show approved prescriptions that need pricing (amount = 0) or ready prescriptions
      where.OR = [
        { status: 'approved', amount: 0 },
        { status: 'ready_to_ship' },
        { status: 'dispatched' },
        { status: 'delivered' }
      ];
    }
    
    if (search) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { medicine: { contains: search } },
          { prescriptionText: { contains: search } }
        ]
      });
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
        approvedByUser: {
          select: {
            id: true,
            name: true,
            email: true
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

// POST /api/staff/prescriptions - Add price to prescription or update status
export async function POST(req: NextRequest) {
  try {
    // Check authentication and staff/admin role
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
    if (!user || !['STAFF', 'ADMIN'].includes(user.role.toUpperCase())) {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { prescriptionId, action, amount, trackingNumber, notes } = await req.json();

    if (!prescriptionId || !action) {
      return createErrorResponse("Prescription ID and action are required", 400);
    }

    // Check if prescription exists
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

    let updateData: any = {};

    switch (action) {
      case 'add_price':
        if (!amount || amount <= 0) {
          return createErrorResponse("Valid amount is required", 400);
        }
        if (prescription.status !== 'approved' || prescription.amount > 0) {
          return createErrorResponse("Prescription must be approved and without existing price", 400);
        }
        updateData = {
          amount: parseFloat(amount),
          status: 'ready_to_ship' // Ready for customer payment
        };
        break;

      case 'dispatch':
        if (prescription.status !== 'ready_to_ship' || prescription.paymentStatus !== 'paid') {
          return createErrorResponse("Prescription must be paid and ready to ship", 400);
        }
        updateData = {
          status: 'dispatched',
          dispatchedAt: new Date(),
          trackingNumber: trackingNumber || null
        };
        break;

      case 'deliver':
        if (prescription.status !== 'dispatched') {
          return createErrorResponse("Prescription must be dispatched first", 400);
        }
        updateData = {
          status: 'delivered',
          deliveredAt: new Date()
        };
        break;

      case 'update_price':
        if (!amount || amount <= 0) {
          return createErrorResponse("Valid amount is required", 400);
        }
        if (prescription.paymentStatus === 'paid') {
          return createErrorResponse("Cannot update price for paid prescriptions", 400);
        }
        updateData = {
          amount: parseFloat(amount)
        };
        break;

      default:
        return createErrorResponse("Invalid action. Use 'add_price', 'update_price', 'dispatch', or 'deliver'", 400);
    }

    // Update prescription
    const updatedPrescription = await prisma.prescription.update({
      where: { id: parseInt(prescriptionId) },
      data: updateData,
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

    let message = '';
    switch (action) {
      case 'add_price':
        message = `Price £${amount} added successfully. Prescription is now ready for customer payment.`;
        break;
      case 'update_price':
        message = `Price updated to £${amount} successfully.`;
        break;
      case 'dispatch':
        message = `Prescription dispatched successfully${trackingNumber ? ` with tracking number: ${trackingNumber}` : ''}.`;
        break;
      case 'deliver':
        message = 'Prescription marked as delivered successfully.';
        break;
    }

    return createSuccessResponse({
      prescription: updatedPrescription,
      message
    });

  } catch (error) {
    return handleApiError(error);
  }
}
