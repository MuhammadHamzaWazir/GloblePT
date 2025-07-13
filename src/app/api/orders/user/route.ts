import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's orders with prescriptions
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(user.id.toString()) },
      include: {
        prescription: {
          select: {
            id: true,
            medicine: true,
            quantity: true,
            amount: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      estimatedDelivery: order.estimatedDelivery?.toISOString() || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      createdAt: order.createdAt.toISOString(),
      prescriptions: order.prescription ? [{
        id: order.prescription.id,
        medicine: order.prescription.medicine,
        quantity: order.prescription.quantity,
        amount: order.prescription.amount,
        status: order.prescription.status
      }] : []
    }));

    return NextResponse.json({
      orders: transformedOrders
    });

  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ 
      message: "Failed to fetch orders" 
    }, { status: 500 });
  }
}
