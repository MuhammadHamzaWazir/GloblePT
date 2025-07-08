import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    console.log('=== PROFILE API DEBUG ===');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const token = request.cookies.get('pharmacy_auth')?.value;
    console.log('Token found:', !!token);
    console.log('Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'NONE');
    
    if (!token) {
      console.log('No pharmacy_auth cookie found');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required - no token found' 
      }, { status: 401 });
    }

    console.log('Attempting to verify token...');
    const decoded = verifyToken(token);
    console.log('Token verification result:', !!decoded);
    console.log('Decoded user:', decoded ? { id: decoded.id, email: decoded.email } : 'INVALID');
    
    if (!decoded) {
      console.log('Token verification failed');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid or expired token' 
      }, { status: 401 });
    }

    // Find user with basic fields first
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    // Try to get 2FA status, default to false if field doesn't exist
    let twoFactorEnabled = false;
    try {
      const userWith2FA = await prisma.$queryRaw`
        SELECT twoFactorEnabled FROM User WHERE id = ${parseInt(decoded.id)}
      ` as any[];
      
      if (userWith2FA && userWith2FA[0] && userWith2FA[0].twoFactorEnabled !== undefined) {
        twoFactorEnabled = Boolean(userWith2FA[0].twoFactorEnabled);
      }
    } catch (error) {
      console.log("2FA field not available, defaulting to false");
      twoFactorEnabled = false;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('pharmacy_auth')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, twoFactorEnabled } = body;

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name and address are required' 
      }, { status: 400 });
    }

    // Validate name
    if (name.trim().length < 2) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name must be at least 2 characters long' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      address: address.trim()
    };

    // Add 2FA setting if provided and field exists
    if (twoFactorEnabled !== undefined) {
      try {
        // Try to update with 2FA field
        updateData.twoFactorEnabled = Boolean(twoFactorEnabled);
      } catch (error) {
        console.log("2FA field not available, skipping 2FA update");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(decoded.id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    // Try to get updated 2FA status
    let finalTwoFactorEnabled = false;
    try {
      const userWith2FA = await prisma.$queryRaw`
        SELECT twoFactorEnabled FROM User WHERE id = ${parseInt(decoded.id)}
      ` as any[];
      
      if (userWith2FA && userWith2FA[0] && userWith2FA[0].twoFactorEnabled !== undefined) {
        finalTwoFactorEnabled = Boolean(userWith2FA[0].twoFactorEnabled);
      }
    } catch (error) {
      console.log("2FA field not available");
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        twoFactorEnabled: finalTwoFactorEnabled
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
