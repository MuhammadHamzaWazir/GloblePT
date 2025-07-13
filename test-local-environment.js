#!/usr/bin/env node

/**
 * COMPREHENSIVE LOCAL TESTING SCRIPT
 * Tests both email delivery and Stripe payments in local environment
 */

const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testEmailDelivery() {
  console.log('📧 TESTING EMAIL DELIVERY');
  console.log('==========================');
  
  try {
    // Check environment variables
    console.log('📋 Environment Configuration:');
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
    console.log(`SMTP_FROM: ${process.env.SMTP_FROM || 'NOT SET'}`);
    console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE || 'NOT SET'}`);
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('❌ Email configuration incomplete. Please check your .env.local file.');
      return false;
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    // Send test email
    console.log('📨 Sending test email...');
    const testEmail = {
      from: process.env.SMTP_FROM,
      to: 'test@example.com',
      subject: 'Test Email from Global Pharma Trading - Local Development',
      html: `
        <h1>🎉 Email Test Successful!</h1>
        <p>This is a test email from your local Global Pharma Trading development environment.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <hr>
        <p>If you received this email, your email configuration is working correctly!</p>
      `,
    };
    
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // If using Mailtrap, show the inbox URL
    if (process.env.SMTP_HOST.includes('mailtrap')) {
      console.log('📬 Check your Mailtrap inbox: https://mailtrap.io/inboxes');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Email delivery test failed:', error.message);
    return false;
  }
}

async function testStripePayment() {
  console.log('\n💳 TESTING STRIPE PAYMENT');
  console.log('==========================');
  
  try {
    // Check Stripe keys
    console.log('📋 Stripe Configuration:');
    console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'SET (sk_test_...)' : 'NOT SET'}`);
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET (pk_test_...)' : 'NOT SET'}`);
    
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log('❌ Stripe configuration incomplete. Please check your .env.local file.');
      return false;
    }
    
    // Test Stripe connection
    console.log('🔍 Testing Stripe connection...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection verified');
    console.log(`📊 Account ID: ${account.id}`);
    console.log(`🏢 Business Profile: ${account.business_profile?.name || 'Not set'}`);
    
    // Create test PaymentIntent
    console.log('💰 Creating test PaymentIntent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1299, // £12.99 in pence
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        test: 'true',
        prescription_id: 'test-123',
        customer_email: 'test@example.com',
      },
    });
    
    console.log('✅ PaymentIntent created successfully!');
    console.log(`💳 Payment Intent ID: ${paymentIntent.id}`);
    console.log(`💵 Amount: £${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`🔐 Client Secret: ${paymentIntent.client_secret.substring(0, 20)}...`);
    
    // Test webhook endpoint URL
    console.log('🔗 Webhook endpoint for local testing:');
    console.log('   URL: http://localhost:3000/api/webhooks/stripe');
    console.log('   💡 Use ngrok or similar tool to test webhooks locally');
    
    return true;
    
  } catch (error) {
    console.error('❌ Stripe payment test failed:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️ TESTING DATABASE CONNECTION');
  console.log('===============================');
  
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection verified');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Total users in database: ${userCount}`);
    
    // Count prescriptions
    const prescriptionCount = await prisma.prescription.count();
    console.log(`💊 Total prescriptions in database: ${prescriptionCount}`);
    
    // Count orders
    const orderCount = await prisma.order.count();
    console.log(`📦 Total orders in database: ${orderCount}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

async function testPaymentFlow() {
  console.log('\n🔄 TESTING COMPLETE PAYMENT FLOW');
  console.log('==================================');
  
  try {
    // Find a test customer with an approved prescription
    const customer = await prisma.user.findFirst({
      where: { email: 'customer1@example.com' },
      include: {
        prescriptions: {
          where: { status: 'approved', paymentStatus: 'unpaid' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    if (!customer || !customer.prescriptions.length) {
      console.log('❌ No test customer with approved prescription found');
      return false;
    }
    
    const prescription = customer.prescriptions[0];
    console.log(`👤 Test customer: ${customer.name} (${customer.email})`);
    console.log(`💊 Prescription: ${prescription.medicine}`);
    console.log(`💰 Amount: £${prescription.amount}`);
    
    // Create PaymentIntent for this prescription
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(prescription.amount * 100), // Convert to pence
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        prescription_id: prescription.id.toString(),
        customer_email: customer.email,
        customer_name: customer.name,
      },
    });
    
    console.log('✅ PaymentIntent created for prescription');
    console.log(`🔐 Client Secret: ${paymentIntent.client_secret.substring(0, 20)}...`);
    
    // Update prescription with payment intent ID
    await prisma.prescription.update({
      where: { id: prescription.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
    
    console.log('✅ Prescription updated with PaymentIntent ID');
    console.log('💡 You can now test the payment flow in the browser');
    
    return true;
    
  } catch (error) {
    console.error('❌ Payment flow test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 LOCAL ENVIRONMENT TESTING SUITE');
  console.log('===================================');
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  
  const results = {
    database: false,
    email: false,
    stripe: false,
    paymentFlow: false,
  };
  
  // Run all tests
  results.database = await testDatabaseConnection();
  results.email = await testEmailDelivery();
  results.stripe = await testStripePayment();
  results.paymentFlow = await testPaymentFlow();
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`🗄️ Database: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📧 Email: ${results.email ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`💳 Stripe: ${results.stripe ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔄 Payment Flow: ${results.paymentFlow ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(Boolean);
  console.log(`\n🎯 OVERALL STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Your local environment is fully configured and ready for testing!');
    console.log('💡 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Login with test credentials from LOCAL_TEST_USERS.md');
    console.log('   4. Test payment flow with Stripe test card: 4242 4242 4242 4242');
    console.log('   5. Check your Mailtrap inbox for email receipts');
  } else {
    console.log('\n🔧 Please fix the failed tests before proceeding');
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toLocaleString()}`);
}

// Run the test suite
runAllTests()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
