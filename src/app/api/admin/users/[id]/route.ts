import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/admin/users/[id] - Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return createErrorResponse("Invalid user ID", 400);
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        role: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!userData) {
      return createErrorResponse("User not found", 404);
    }

    return createSuccessResponse({ user: userData });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return createErrorResponse("Invalid user ID", 400);
    }

    const { name, email, password, roleId, address, supervisorId } = await req.json();

    // Validate required fields
    if (!name || !email || !address) {
      return createErrorResponse("Name, email, and address are required", 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return createErrorResponse("User not found", 404);
    }

    // Prevent setting user as their own supervisor
    if (supervisorId && supervisorId === userId) {
      return createErrorResponse("User cannot be their own supervisor", 400);
    }

    // Check if email is being changed and if it already exists
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return createErrorResponse("Email already exists", 400);
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      address,
      roleId: roleId || null,
      supervisorId: supervisorId || null,
    };

    // Only hash and update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { 
        role: true,
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return createSuccessResponse({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return createErrorResponse("Invalid user ID", 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return createErrorResponse("User not found", 404);
    }

    // Prevent deleting self
    if (user.id === userId.toString()) {
      return createErrorResponse("Cannot delete your own account", 400);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return createSuccessResponse({ message: "User deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}