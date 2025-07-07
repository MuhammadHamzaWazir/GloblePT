import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, adminKey } = await request.json();
    
    // Simple admin key check
    if (adminKey !== 'global-pharma-admin-2024') {
      return NextResponse.json({ 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    if (!email || !newPassword) {
      return NextResponse.json({ 
        message: "Email and new password are required" 
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json({ 
      message: `Password reset successfully for user ${email}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ 
      message: "Internal server error.",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
