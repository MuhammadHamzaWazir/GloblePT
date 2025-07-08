import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateOrderStatus, getOrderDetails } from '@/lib/order-utils';
import { sendOrderStatusUpdate } from '@/lib/email-receipts';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has admin role
    const userWithRole = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      include: { role: true }
    });
    
    if (!userWithRole?.role || !['admin', 'staff', 'supervisor'].includes(userWithRole.role.name)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // If requesting specific order
    if (orderId) {
      const order = await getOrderDetails(parseInt(orderId));
      
      if (!order) {
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, order });
    }

    // Get all orders with filters
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phone: true
          }
        },
        prescription: {
          select: {
            id: true,
            medicine: true,
            dosage: true,
            quantity: true,
            amount: true,
            status: true,
            paymentStatus: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.order.count({ where });
    
    return NextResponse.json({ 
      success: true, 
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has admin role
    const userWithRole = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      include: { role: true }
    });
    
    if (!userWithRole?.role || !['admin', 'staff', 'supervisor'].includes(userWithRole.role.name)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    
    if (!orderId) {
      return NextResponse.json({ message: "Order ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { status, trackingNumber, courierName, notes } = body;

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // Prepare tracking data
    const trackingData: any = {};
    if (trackingNumber) trackingData.trackingNumber = trackingNumber;
    if (courierName) trackingData.courierName = courierName;
    
    // Set timestamps based on status
    if (status === 'dispatched') {
      trackingData.dispatchedAt = new Date();
    } else if (status === 'delivered') {
      trackingData.deliveredAt = new Date();
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(parseInt(orderId), status, trackingData);

    // Get order details with customer info for email
    const orderDetails = await getOrderDetails(updatedOrder.id);
    
    if (!orderDetails) {
      return NextResponse.json({ message: "Order not found after update" }, { status: 404 });
    }

    // Also update prescription status to match
    let prescriptionStatus = 'paid';
    if (status === 'dispatched') prescriptionStatus = 'dispatched';
    if (status === 'delivered') prescriptionStatus = 'delivered';

    await prisma.prescription.update({
      where: { id: updatedOrder.prescriptionId },
      data: { 
        status: prescriptionStatus,
        ...(trackingData.trackingNumber && { trackingNumber: trackingData.trackingNumber }),
        ...(trackingData.dispatchedAt && { dispatchedAt: trackingData.dispatchedAt }),
        ...(trackingData.deliveredAt && { deliveredAt: trackingData.deliveredAt })
      }
    });

    // Add notes if provided
    if (notes) {
      await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { notes }
      });
    }

    // Send status update email to customer
    try {
      await sendOrderStatusUpdate({
        order: {
          orderNumber: orderDetails.orderNumber,
          status: status,
          trackingNumber: trackingData.trackingNumber,
          courierName: trackingData.courierName,
          estimatedDelivery: orderDetails.estimatedDelivery || undefined
        },
        customer: {
          name: orderDetails.user.name,
          email: orderDetails.user.email
        },
        prescription: {
          medicine: orderDetails.prescription.medicine
        }
      });

      console.log(`📧 Status update email sent to ${orderDetails.user.email} for order ${orderDetails.orderNumber}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send status update email:', emailError);
      // Don't fail the API call for email errors
    }

    console.log(`Order ${updatedOrder.orderNumber} updated to ${status} by ${user.name}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Order ${updatedOrder.orderNumber} updated successfully and customer notified`,
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
