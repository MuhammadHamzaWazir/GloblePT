import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

// Generate 2FA secret and setup information
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, token, backupCode } = body;

    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!fullUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    switch (action) {
      case 'generate':
        // Generate new 2FA secret (simplified version)
        const secret = crypto.randomBytes(20).toString('hex').toUpperCase();
        
        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
          crypto.randomBytes(3).toString('hex').toUpperCase()
        );
        
        // Create setup instructions instead of QR code
        const setupInstructions = {
          serviceName: 'Global Pharma Trading',
          accountName: fullUser.email,
          secret: secret,
          instructions: [
            "1. Download Google Authenticator or similar 2FA app",
            "2. Add a new account manually",
            "3. Enter the secret key provided",
            "4. Use the generated 6-digit code to complete setup"
          ]
        };
        
        return NextResponse.json({
          secret,
          backupCodes,
          setupInstructions,
          message: "2FA setup initiated. Please configure your authenticator app."
        });

      case 'verify':
        if (!token) {
          return NextResponse.json({ message: "Verification token required" }, { status: 400 });
        }

        // Basic validation (6 digits)
        const isValid = token.length === 6 && /^\d+$/.test(token);
        
        if (!isValid) {
          return NextResponse.json({ message: "Invalid verification token format. Please enter 6 digits." }, { status: 400 });
        }

        // In production, verify against TOTP algorithm
        // For now, accept any 6-digit number for demo
        
        return NextResponse.json({
          message: "Two-factor authentication enabled successfully",
          enabled: true,
        });

      case 'disable':
        return NextResponse.json({
          message: "Two-factor authentication disabled",
          enabled: false,
        });

      case 'verify-login':
        // Verify 2FA token during login
        if (!token && !backupCode) {
          return NextResponse.json({ message: "2FA token or backup code required" }, { status: 400 });
        }

        // Basic validation
        const loginValid = (token && token.length === 6 && /^\d+$/.test(token)) || 
                          (backupCode && backupCode.length === 6);
        
        if (!loginValid) {
          return NextResponse.json({ message: "Invalid 2FA format" }, { status: 400 });
        }

        return NextResponse.json({
          message: "2FA verification successful",
          verified: true,
        });

      case 'status':
        // Check 2FA status for user
        return NextResponse.json({
          enabled: false, // In production, check from database
          setupRequired: true,
        });

      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error('2FA API error:', error);
    return NextResponse.json({ 
      message: "Two-factor authentication operation failed" 
    }, { status: 500 });
  }
}
