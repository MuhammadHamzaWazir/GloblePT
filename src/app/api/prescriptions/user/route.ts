import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Prescription User API - GET request received');
    
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

    console.log('🔍 Verifying JWT token...');
    // Verify JWT token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('❌ Invalid authentication token');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid authentication token' 
      }, { status: 401 });
    }
    
    const userId = parseInt(decoded.id);
    
    console.log('🔍 Decoded user ID:', userId);

    console.log('🔍 Querying prescriptions...');
    // Fetch user's prescriptions - use findMany without strict select to get all fields
    const prescriptions = await prisma.prescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 Querying orders...');
    // Fetch user's orders
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        paidAt: true,
        createdAt: true
      }
    });

    console.log('🔍 Found prescriptions:', prescriptions.length);
    console.log('🔍 Found orders:', orders.length);    console.log('🔍 Transforming prescriptions...');
    // Transform data for frontend with proper type casting and safe JSON parsing
    const transformedPrescriptions = prescriptions.map(p => {
      let fileUrls = [];
      let firstFileUrl = null;
      
      // Safely parse fileUrls JSON
      try {
        if ((p as any).fileUrls && typeof (p as any).fileUrls === 'string') {
          fileUrls = JSON.parse((p as any).fileUrls);
          firstFileUrl = Array.isArray(fileUrls) && fileUrls.length > 0 ? fileUrls[0] : null;
        }
      } catch (jsonError) {
        console.warn('Failed to parse fileUrls for prescription', p.id, ':', jsonError);
        fileUrls = [];
        firstFileUrl = null;
      }
      
      return {
        id: p.id.toString(),
        medicine: p.medicine || 'Prescription',
        medicines: (p as any).medicines || null,
        filename: (p as any).filename || p.medicine || 'Prescription',
        fileUrl: firstFileUrl,
        fileUrls: fileUrls,
        quantity: p.quantity,
        amount: p.amount,
        status: p.status,
        paymentStatus: p.paymentStatus,
        medicineType: p.medicineType,
        uploadedAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });

    // Calculate statistics including orders
    const totalPrescriptions = prescriptions.length;
    const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
    const approvedPrescriptions = prescriptions.filter(p => p.status === 'approved').length;
    const completedPrescriptions = prescriptions.filter(p => 
      p.status === 'completed' || p.status === 'delivered'
    ).length;

    // Order statistics
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paidAt !== null).length;
    const totalSpent = orders
      .filter(o => o.paidAt !== null)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const stats = {
      totalPrescriptions,
      pendingPrescriptions,
      approvedPrescriptions,
      completedPrescriptions,
      totalOrders,
      paidOrders,
      totalSpent
    };

    return NextResponse.json({
      success: true,
      prescriptions: transformedPrescriptions,
      stats: stats
    });

  } catch (error) {
    console.error('Fetch prescriptions error:', error);
    return NextResponse.json({ 
      success: false,
      message: "Failed to fetch prescriptions" 
    }, { status: 500 });
  }
}
