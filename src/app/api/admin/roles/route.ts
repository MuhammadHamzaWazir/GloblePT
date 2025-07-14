import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

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