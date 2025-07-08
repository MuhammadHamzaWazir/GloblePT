/**
 * Email utilities for sending payment receipts and order confirmations
 */

import { sendEmail } from '@/lib/email';

interface PaymentReceiptData {
  order: {
    orderNumber: string;
    totalAmount: number;
    currency: string;
    paidAt: Date;
    estimatedDelivery: Date;
    deliveryAddress: string;
    status: string;
  };
  customer: {
    name: string;
    email: string;
  };
  prescription: {
    medicine: string;
    dosage: string;
    quantity: number;
    instructions?: string;
  };
  payment: {
    stripePaymentIntentId: string;
    method: string;
  };
}

/**
 * Send payment receipt email to customer
 */
export async function sendPaymentReceipt(data: PaymentReceiptData) {
  try {
    const receiptHtml = generatePaymentReceiptHTML(data);
    
    await sendEmail({
      to: data.customer.email,
      subject: `Payment Receipt - Order ${data.order.orderNumber}`,
      html: receiptHtml,
      text: `Payment Receipt - Order ${data.order.orderNumber}\n\nThank you for your payment of £${data.order.totalAmount.toFixed(2)}. Your order is being processed and will be delivered to ${data.order.deliveryAddress}.`
    });
    
    console.log(`📧 Payment receipt sent to ${data.customer.email} for order ${data.order.orderNumber}`);
    
    return { success: true, message: 'Payment receipt sent successfully' };
  } catch (error: any) {
    console.error('❌ Failed to send payment receipt:', error);
    throw new Error(`Failed to send payment receipt: ${error.message}`);
  }
}

/**
 * Generate HTML for payment receipt email
 */
function generatePaymentReceiptHTML(data: PaymentReceiptData): string {
  const { order, customer, prescription, payment } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - Global Pharma Trading</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; background: #ffffff; }
        .success-banner { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center; }
        .success-banner h2 { color: #155724; margin: 0 0 10px 0; font-size: 24px; }
        .success-banner p { color: #155724; margin: 0; }
        .order-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .order-info h3 { margin: 0 0 15px 0; color: #495057; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; color: #6c757d; }
        .info-value { color: #495057; }
        .amount { font-size: 18px; font-weight: bold; color: #28a745; }
        .prescription-details { background: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .prescription-details h3 { margin: 0 0 15px 0; color: #1565c0; }
        .next-steps { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .next-steps h3 { margin: 0 0 15px 0; color: #856404; }
        .next-steps ul { margin: 0; padding-left: 20px; }
        .next-steps li { margin-bottom: 8px; color: #856404; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
        .footer p { margin: 5px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .button:hover { background: #0056b3; }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .header, .content { padding: 20px; }
          .info-row { flex-direction: column; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>Global Pharma Trading</h1>
          <p>Your trusted online pharmacy</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Success Banner -->
          <div class="success-banner">
            <h2>✅ Payment Successful!</h2>
            <p>Thank you for your order. Your prescription has been paid for and is now being processed.</p>
          </div>
          
          <!-- Order Information -->
          <div class="order-info">
            <h3>📋 Order Details</h3>
            <div class="info-row">
              <span class="info-label">Order Number:</span>
              <span class="info-value">${order.orderNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Customer:</span>
              <span class="info-value">${customer.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Date:</span>
              <span class="info-value">${order.paidAt.toLocaleDateString('en-GB')} at ${order.paidAt.toLocaleTimeString('en-GB')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Amount:</span>
              <span class="info-value amount">£${order.totalAmount.toFixed(2)} ${order.currency.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value">${payment.method}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment ID:</span>
              <span class="info-value">${payment.stripePaymentIntentId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Order Status:</span>
              <span class="info-value">${order.status}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estimated Delivery:</span>
              <span class="info-value">${order.estimatedDelivery.toLocaleDateString('en-GB')}</span>
            </div>
          </div>
          
          <!-- Prescription Details -->
          <div class="prescription-details">
            <h3>💊 Prescription Details</h3>
            <div class="info-row">
              <span class="info-label">Medicine:</span>
              <span class="info-value">${prescription.medicine}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dosage:</span>
              <span class="info-value">${prescription.dosage}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Quantity:</span>
              <span class="info-value">${prescription.quantity}</span>
            </div>
            ${prescription.instructions ? `
            <div class="info-row">
              <span class="info-label">Instructions:</span>
              <span class="info-value">${prescription.instructions}</span>
            </div>
            ` : ''}
          </div>
          
          <!-- Delivery Information -->
          <div class="order-info">
            <h3>🚚 Delivery Information</h3>
            <div class="info-row">
              <span class="info-label">Delivery Address:</span>
              <span class="info-value">${order.deliveryAddress}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estimated Delivery:</span>
              <span class="info-value">${order.estimatedDelivery.toLocaleDateString('en-GB')}</span>
            </div>
          </div>
          
          <!-- Next Steps -->
          <div class="next-steps">
            <h3>📋 What happens next?</h3>
            <ul>
              <li>Your prescription will be reviewed and prepared by our qualified pharmacists</li>
              <li>We'll send you a dispatch notification with tracking details</li>
              <li>Your order will be delivered to the address provided</li>
              <li>You can track your order status in your dashboard</li>
            </ul>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://globalpharmatrading.co.uk'}/dashboard" class="button">
              View Order in Dashboard
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>Global Pharma Trading</strong></p>
          <p>Registered Pharmacy | GPhC Registration Number: 1234567</p>
          <p>Email: info@globalpharmatrading.co.uk | Phone: +44 (0) 20 1234 5678</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>If you have any questions, please contact our customer service team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdate(data: {
  order: {
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    courierName?: string;
    estimatedDelivery?: Date;
  };
  customer: {
    name: string;
    email: string;
  };
  prescription: {
    medicine: string;
  };
}) {
  try {
    const statusUpdateHtml = generateOrderStatusUpdateHTML(data);
    
    await sendEmail({
      to: data.customer.email,
      subject: `Order Update - ${data.order.orderNumber} - ${data.order.status}`,
      html: statusUpdateHtml,
      text: `Order Update - ${data.order.orderNumber}\n\nYour order status has been updated to: ${data.order.status}\n\nThank you for choosing Global Pharma Trading.`
    });
    
    console.log(`📧 Order status update sent to ${data.customer.email} for order ${data.order.orderNumber}`);
    
    return { success: true, message: 'Order status update sent successfully' };
  } catch (error: any) {
    console.error('❌ Failed to send order status update:', error);
    throw new Error(`Failed to send order status update: ${error.message}`);
  }
}

/**
 * Generate HTML for order status update email
 */
function generateOrderStatusUpdateHTML(data: any): string {
  const { order, customer, prescription } = data;
  
  let statusMessage = '';
  let statusColor = '#007bff';
  
  switch (order.status) {
    case 'processing':
      statusMessage = 'Your order is being prepared by our pharmacists';
      statusColor = '#ffc107';
      break;
    case 'dispatched':
      statusMessage = 'Your order has been dispatched and is on its way';
      statusColor = '#17a2b8';
      break;
    case 'delivered':
      statusMessage = 'Your order has been delivered';
      statusColor = '#28a745';
      break;
    default:
      statusMessage = `Your order status has been updated to ${order.status}`;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - Global Pharma Trading</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #ffffff; }
        .status-banner { background: ${statusColor}; color: white; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center; }
        .status-banner h2 { margin: 0 0 10px 0; font-size: 24px; }
        .order-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; color: #6c757d; }
        .info-value { color: #495057; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Global Pharma Trading</h1>
          <p>Order Status Update</p>
        </div>
        
        <div class="content">
          <div class="status-banner">
            <h2>Order Update</h2>
            <p>${statusMessage}</p>
          </div>
          
          <div class="order-info">
            <h3>Order Details</h3>
            <div class="info-row">
              <span class="info-label">Order Number:</span>
              <span class="info-value">${order.orderNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value">${order.status}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Medicine:</span>
              <span class="info-value">${prescription.medicine}</span>
            </div>
            ${order.trackingNumber ? `
            <div class="info-row">
              <span class="info-label">Tracking Number:</span>
              <span class="info-value">${order.trackingNumber}</span>
            </div>
            ` : ''}
            ${order.courierName ? `
            <div class="info-row">
              <span class="info-label">Courier:</span>
              <span class="info-value">${order.courierName}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://globalpharmatrading.co.uk'}/dashboard" class="button">
              View Order Details
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Global Pharma Trading</strong></p>
          <p>Thank you for choosing Global Pharma Trading for your pharmaceutical needs.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
