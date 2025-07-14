import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 User Profile API - GET request received');
    
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;
    
    console.log('🔍 Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('❌ No authentication token found');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
        
        if (!decoded) {
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid authentication token' 
          }, { status: 401 });
        }
    const userId = parseInt(decoded.id);
    
    console.log('🔍 Decoded user ID:', userId);

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gpName: true,
        gpAddress: true,
        gpPhone: true,
        role: true,
        accountStatus: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    console.log('🔍 User data fetched for:', user.email);

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch user profile' 
    }, { status: 500 });
  }
}
