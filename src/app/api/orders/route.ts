import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserOrders, getOrderDetails } from '@/lib/order-utils';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    // If requesting specific order
    if (orderId) {
      const order = await getOrderDetails(parseInt(orderId));
      
      if (!order) {
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
      }
      
      // Check if user owns this order
      if (order.userId !== parseInt(user.id)) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
      }
      
      return NextResponse.json({ success: true, order });
    }

    // Get all orders for the user
    const orders = await getUserOrders(parseInt(user.id));
    
    return NextResponse.json({ 
      success: true, 
      orders,
      count: orders.length 
    });

  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
