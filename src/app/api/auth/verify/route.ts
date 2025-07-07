import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("pharmacy_auth")?.value;

    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        message: "No authentication token found" 
      }, { status: 401 });
    }

    // Verify the JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        authenticated: false,
        message: "Invalid authentication token" 
      }, { status: 401 });
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        message: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name || 'USER'
      }
    });

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ 
      authenticated: false,
      message: "Token verification failed" 
    }, { status: 401 });
  }
}
