import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API endpoint to enable 2FA for a specific user (admin use only)
export async function POST(req: Request) {
  try {
    const { email, enable2FA, adminKey } = await req.json();
    
    // Simple admin key check (in production, use proper authentication)
    if (adminKey !== 'global-pharma-admin-2024') {
      return NextResponse.json({ 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ 
        message: "Email is required" 
      }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ 
        message: "User not found" 
      }, { status: 404 });
    }

    // Update user's 2FA setting
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: enable2FA === true
      } as any
    });

    return NextResponse.json({ 
      message: `2FA ${enable2FA ? 'enabled' : 'disabled'} for user ${email}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        twoFactorEnabled: (updatedUser as any).twoFactorEnabled
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Enable 2FA error:", error);
    return NextResponse.json({ 
      message: "Internal server error.",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
