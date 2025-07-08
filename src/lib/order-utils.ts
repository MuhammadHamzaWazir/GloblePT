/**
 * Order management utilities for generating order numbers and handling order lifecycle
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a unique order number in the format: GPT-YYYYMMDD-XXXXX
 * GPT = Global Pharma Trading
 * YYYYMMDD = Date
 * XXXXX = Sequential number
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  // Find the latest order number for today
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  const lastOrderToday = await prisma.order.findFirst({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  let sequence = 1;
  if (lastOrderToday) {
    // Extract sequence number from last order
    const lastSequence = lastOrderToday.orderNumber.split('-')[2];
    sequence = parseInt(lastSequence) + 1;
  }
  
  // Pad sequence to 5 digits
  const paddedSequence = sequence.toString().padStart(5, '0');
  
  return `GPT-${dateStr}-${paddedSequence}`;
}

/**
 * Create an order from a prescription after successful payment
 */
export async function createOrderFromPrescription(prescriptionId: number, paymentData: {
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  paidAt: Date;
}) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { user: true }
  });
  
  if (!prescription) {
    throw new Error('Prescription not found');
  }
  
  // Generate unique order number
  const orderNumber = await generateOrderNumber();
  
  // Calculate estimated delivery (3-5 business days)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 4); // 4 days average
  
  // Create the order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: prescription.userId,
      prescriptionId: prescription.id,
      totalAmount: prescription.amount,
      currency: 'gbp',
      deliveryAddress: prescription.deliveryAddress,
      estimatedDelivery,
      stripePaymentIntentId: paymentData.stripePaymentIntentId,
      stripeChargeId: paymentData.stripeChargeId,
      paidAt: paymentData.paidAt,
      status: 'confirmed',
      notes: `Order created from prescription payment. Medicine: ${prescription.medicine}, Quantity: ${prescription.quantity}`
    }
  });
  
  return order;
}

/**
 * Update order status and tracking information
 */
export async function updateOrderStatus(orderId: number, status: string, trackingData?: {
  trackingNumber?: string;
  courierName?: string;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}) {
  const updateData: any = { status };
  
  if (trackingData) {
    if (trackingData.trackingNumber) updateData.trackingNumber = trackingData.trackingNumber;
    if (trackingData.courierName) updateData.courierName = trackingData.courierName;
    if (trackingData.dispatchedAt) updateData.dispatchedAt = trackingData.dispatchedAt;
    if (trackingData.deliveredAt) updateData.deliveredAt = trackingData.deliveredAt;
  }
  
  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData
  });
  
  // Also update the prescription tracking info
  if (trackingData) {
    await prisma.prescription.update({
      where: { id: order.prescriptionId },
      data: {
        trackingNumber: trackingData.trackingNumber,
        dispatchedAt: trackingData.dispatchedAt,
        deliveredAt: trackingData.deliveredAt
      }
    });
  }
  
  return order;
}

/**
 * Get order details with prescription and user information
 */
export async function getOrderDetails(orderId: number) {
  return await prisma.order.findUnique({
    where: { id: orderId },
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
          instructions: true,
          amount: true,
          status: true,
          paymentStatus: true
        }
      }
    }
  });
}

/**
 * Get orders for a user
 */
export async function getUserOrders(userId: number) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
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
    }
  });
}
