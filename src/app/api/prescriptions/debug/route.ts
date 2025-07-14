// Create a simplified version of the prescription API for debugging
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('🔍 [DEBUG] Prescription API called');
  
  try {
    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;
    
    console.log('🔍 [DEBUG] Token found:', token ? 'Yes' : 'No');
    console.log('🔍 [DEBUG] JWT_SECRET exists:', process.env.JWT_SECRET ? 'Yes' : 'No');

    if (!token) {
      console.log('❌ [DEBUG] No authentication token found');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = verifyToken(token);
        
      if (!decoded) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid authentication token' 
        }, { status: 401 });
      }
      
      console.log('✅ [DEBUG] Token decoded successfully:', decoded);
    } catch (jwtError) {
      console.error('❌ [DEBUG] JWT verification failed:', jwtError);
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    const userId = parseInt(decoded.id);
    console.log('🔍 [DEBUG] Parsed user ID:', userId);

    // Test database connection
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true }
      });
      console.log('👤 [DEBUG] User found:', userExists ? userExists.email : 'No');
    } catch (dbError) {
      console.error('❌ [DEBUG] Database connection error:', dbError);
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection failed' 
      }, { status: 500 });
    }

    // Simplified prescription query
    try {
      console.log('🔍 [DEBUG] Starting prescription query...');
      
      const prescriptions = await prisma.prescription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5, // Limit to 5 for debugging
        select: {
          id: true,
          medicine: true,
          status: true,
          amount: true,
          createdAt: true
        }
      });

      console.log('✅ [DEBUG] Prescription query successful. Found:', prescriptions.length);

      return NextResponse.json({
        success: true,
        prescriptions: prescriptions.map(p => ({
          id: p.id.toString(),
          medicine: p.medicine || 'Prescription',
          status: p.status,
          amount: p.amount,
          uploadedAt: p.createdAt
        })),
        debug: {
          userId,
          tokenValid: true,
          prescriptionCount: prescriptions.length
        }
      });

    } catch (queryError) {
      console.error('❌ [DEBUG] Prescription query error:', queryError);
      return NextResponse.json({ 
        success: false, 
        message: 'Prescription query failed: ' + (queryError instanceof Error ? queryError.message : String(queryError))
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ [DEBUG] General API error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to fetch prescriptions: " + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}
