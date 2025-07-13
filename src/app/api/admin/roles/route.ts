import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role !== 'admin') {
      return createErrorResponse("Unauthorized access", 403);
    }

    // Return the available roles as enum values
    const roles = [
      { id: 1, name: 'customer', description: 'Customer user' },
      { id: 2, name: 'staff', description: 'Staff member' },
      { id: 3, name: 'admin', description: 'Administrator' },
      { id: 4, name: 'assistant', description: 'Assistant' },
      { id: 5, name: 'supervisor', description: 'Supervisor' }
    ];

    return createSuccessResponse({ roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return handleApiError(error);
  }
}