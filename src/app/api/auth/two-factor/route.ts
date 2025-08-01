import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

// Generate 2FA secret and setup information
export async function POST(req: NextRequest) {
  try {
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
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, token: twoFactorToken, backupCode } = body;

    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!fullUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    switch (action) {
      case 'generate':
        // Generate new 2FA secret using speakeasy
        const secret = speakeasy.generateSecret({
          name: `Global Pharma Trading (${fullUser.email})`,
          issuer: 'Global Pharma Trading',
          length: 20
        });
        
        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substring(2, 8).toUpperCase()
        );
        
        // Generate QR Code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
        
        // Store the secret temporarily (should be stored securely)
        // For now, we'll return it to the client for verification
        
        return NextResponse.json({
          secret: secret.base32,
          qrCode: qrCodeUrl,
          backupCodes,
          setupInstructions: {
            serviceName: 'Global Pharma Trading',
            accountName: fullUser.email,
            manualEntryKey: secret.base32,
            instructions: [
              "1. Download Google Authenticator or similar 2FA app",
              "2. Scan the QR code or enter the manual key",
              "3. Enter the 6-digit code to complete setup"
            ]
          },
          message: "2FA setup initiated. Please configure your authenticator app."
        });

      case 'verify':
        if (!twoFactorToken) {
          return NextResponse.json({ message: "Verification token required" }, { status: 400 });
        }

        // Get the secret from the request (in production, this should be stored securely)
        const { secret: verifySecret } = body;
        
        if (!verifySecret) {
          return NextResponse.json({ message: "Setup secret required for verification" }, { status: 400 });
        }

        // Verify the token using speakeasy
        const verified = speakeasy.totp.verify({
          secret: verifySecret,
          encoding: 'base32',
          token: twoFactorToken,
          window: 1 // Allow 1 step tolerance
        });

        if (!verified) {
          return NextResponse.json({ message: "Invalid verification code. Please try again." }, { status: 400 });
        }

        // Save 2FA settings to user using proper schema fields
        await prisma.user.update({
          where: { id: parseInt(user.id) },
          data: {
            twoFactorSecret: verifySecret,
            twoFactorEnabled: true
          }
        });

        return NextResponse.json({
          message: "Two-factor authentication enabled successfully",
          enabled: true,
        });

      case 'disable':
        await prisma.user.update({
          where: { id: parseInt(user.id) },
          data: {
            twoFactorSecret: null,
            twoFactorEnabled: false,
            twoFactorBackupCodes: null
          }
        });

        return NextResponse.json({
          message: "Two-factor authentication disabled",
          enabled: false,
        });

      case 'verify-login':
        // Verify 2FA token during login
        if (!twoFactorToken && !backupCode) {
          return NextResponse.json({ message: "2FA token or backup code required" }, { status: 400 });
        }

        // Check if user has 2FA enabled
        const twoFactorSecret = fullUser.twoFactorSecret;
        
        if (twoFactorSecret && twoFactorToken) {
          const loginVerified = speakeasy.totp.verify({
            secret: twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken,
            window: 1
          });

          if (!loginVerified) {
            return NextResponse.json({ message: "Invalid 2FA code" }, { status: 400 });
          }
        } else if (backupCode) {
          // Check against stored backup codes
          const storedBackupCodes = fullUser.twoFactorBackupCodes ? JSON.parse(fullUser.twoFactorBackupCodes) : [];
          if (!storedBackupCodes.includes(backupCode)) {
            return NextResponse.json({ message: "Invalid backup code" }, { status: 400 });
          }
        } else {
          return NextResponse.json({ message: "2FA not properly configured" }, { status: 400 });
        }

        return NextResponse.json({
          message: "2FA verification successful",
          verified: true,
        });

      case 'status':
        // Check 2FA status for user
        const has2FA = fullUser.twoFactorEnabled || false;
        return NextResponse.json({
          enabled: has2FA,
          setupRequired: !has2FA,
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
