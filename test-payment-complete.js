#!/usr/bin/env node

/**
 * COMPREHENSIVE PAYMENT FLOW TEST
 * Tests the complete payment process locally
 */

const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testCompleteSystem() {
  console.log('🚀 COMPREHENSIVE PAYMENT SYSTEM TEST');
  console.log('====================================');
  
  try {
    // 1. Test Database Connection
    console.log('\n1. 🗄️ Testing Database...');
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // 2. Test Email Configuration
    console.log('\n2. 📧 Testing Email Configuration...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    await transporter.verify();
    console.log('✅ Email configuration verified');
    
    // Send test email
    const testEmailInfo = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'test@example.com',
      subject: 'Payment System Test - Email Working',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Email System Test Successful!</h2>
          <p>Your email configuration is working correctly for the payment system.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Environment:</strong> Local Development</p>
          <hr style="margin: 20px 0;">
          <p>Ready to process payment receipts! ✅</p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully');
    console.log(`📧 Message ID: ${testEmailInfo.messageId}`);
    
    // 3. Test Stripe Configuration
    console.log('\n3. 💳 Testing Stripe Configuration...');
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection verified');
    console.log(`📊 Account: ${account.id} (${account.livemode ? 'Live' : 'Test'} mode)`);
    
    // 4. Check Test Users and Prescriptions
    console.log('\n4. 👥 Checking Test Data...');
    const testCustomer = await prisma.user.findFirst({
      where: { email: 'customer1@example.com' },
      include: {
        prescriptions: {
          where: { 
            status: 'approved', 
            paymentStatus: 'unpaid' 
          }
        }
      }
    });
    
    if (!testCustomer) {
      console.log('❌ Test customer not found');
      return;
    }
    
    console.log(`✅ Test customer found: ${testCustomer.name}`);
    console.log(`📊 Approved prescriptions: ${testCustomer.prescriptions.length}`);
    
    if (testCustomer.prescriptions.length > 0) {
      const prescription = testCustomer.prescriptions[0];
      console.log(`💊 Ready for payment: ${prescription.medicine} - £${prescription.amount}`);
      
      // 5. Create PaymentIntent for testing
      console.log('\n5. 💰 Creating Test PaymentIntent...');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(prescription.amount * 100),
        currency: 'gbp',
        automatic_payment_methods: { enabled: true },
        metadata: {
          prescription_id: prescription.id.toString(),
          customer_email: testCustomer.email,
        },
      });
      
      console.log('✅ PaymentIntent created');
      console.log(`🔐 ID: ${paymentIntent.id}`);
      console.log(`💵 Amount: £${(paymentIntent.amount / 100).toFixed(2)}`);
      
      // Update prescription with payment intent
      await prisma.prescription.update({
        where: { id: prescription.id },
        data: { stripePaymentIntentId: paymentIntent.id }
      });
      
      console.log('✅ Prescription updated with PaymentIntent');
    }
    
    // 6. Test Environment Variables
    console.log('\n6. ⚙️ Environment Configuration...');
    console.log(`🌐 APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}`);
    console.log(`📧 SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`💳 STRIPE_SECRET: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`💳 STRIPE_PUBLIC: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}`);
    
    // 7. Testing Instructions
    console.log('\n7. 🧪 TESTING INSTRUCTIONS');
    console.log('===========================');
    console.log('Now you can test the complete payment flow:');
    console.log('');
    console.log('1. 🌐 Open: http://localhost:3000');
    console.log('2. 🔐 Login: customer1@example.com / Customer@2024');
    console.log('3. 📋 Go to Dashboard and find approved prescription');
    console.log('4. 💳 Click "Pay Now" button');
    console.log('5. 🔄 Should redirect to Stripe Checkout (staying on localhost)');
    console.log('6. 💰 Use test card: 4242 4242 4242 4242');
    console.log('7. 📅 Expiry: 12/25, CVC: 123');
    console.log('8. ✅ Complete payment');
    console.log('9. 🔄 Should redirect back to localhost dashboard');
    console.log('10. 📧 Check your Mailtrap inbox for payment receipt');
    console.log('11. ✅ Prescription status should show "Paid" and "Order Preparing"');
    
    console.log('\n📧 MAILTRAP INBOX');
    console.log('==================');
    console.log('Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
    console.log('You should see the test email and payment receipts there.');
    
    console.log('\n🎯 EXPECTED BEHAVIOR');
    console.log('====================');
    console.log('✅ Payment stays on localhost (no redirect to live domain)');
    console.log('✅ Payment completes successfully');
    console.log('✅ Prescription status updates to "paid"');
    console.log('✅ Order is created in database');
    console.log('✅ Email receipt is sent to customer');
    console.log('✅ Dashboard shows "Order Preparing" status');
    
    console.log('\n🎉 SYSTEM READY FOR COMPLETE TESTING!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteSystem();
