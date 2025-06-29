import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/admin/users - Get all users with pagination and search
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { role: { name: { contains: search } } }
      ]
    } : {};

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    // Get users with pagination and search
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
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
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return createSuccessResponse({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNext,
        hasPrev
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const { name, email, password, roleId, address, supervisorId } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !address) {
      return createErrorResponse("Name, email, password, and address are required", 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return createErrorResponse("Email already exists", 400);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        roleId: roleId || null,
        supervisorId: supervisorId || null,
      },
      include: {
        role: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    });

    return NextResponse.json({
      success: true,
      data: { user: newUser }
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}