#!/usr/bin/env node

/**
 * ENVIRONMENT VERIFICATION SCRIPT
 * Quick check of all system components
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function verifySystem() {
  console.log('🔍 SYSTEM VERIFICATION');
  console.log('======================');
  
  try {
    // 1. Check Database
    console.log('\n1. 🗄️ DATABASE STATUS:');
    const userCount = await prisma.user.count();
    const prescriptionCount = await prisma.prescription.count();
    const orderCount = await prisma.order.count();
    
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   💊 Prescriptions: ${prescriptionCount}`);
    console.log(`   📦 Orders: ${orderCount}`);
    
    // 2. Check Stripe
    console.log('\n2. 💳 STRIPE STATUS:');
    const account = await stripe.accounts.retrieve();
    console.log(`   ✅ Connected to account: ${account.id}`);
    console.log(`   🔑 Test mode: ${account.livemode ? 'NO (Live)' : 'YES (Test)'}`);
    
    // 3. Check Email Config
    console.log('\n3. 📧 EMAIL CONFIG:');
    console.log(`   📧 Host: ${process.env.SMTP_HOST || 'NOT SET'}`);
    console.log(`   🔐 User: ${process.env.SMTP_USER || 'NOT SET'}`);
    console.log(`   🔑 Pass: ${process.env.SMTP_PASS ? 'SET' : 'NOT SET'}`);
    console.log(`   📤 From: ${process.env.SMTP_FROM || 'NOT SET'}`);
    
    // 4. Check Test Users
    console.log('\n4. 👥 TEST USERS:');
    const testUsers = await prisma.user.findMany({
      include: { role: true },
      orderBy: { id: 'asc' },
    });
    
    testUsers.forEach(user => {
      console.log(`   • ${user.name} (${user.email}) - ${user.role.name}`);
    });
    
    // 5. Check Approved Prescriptions
    console.log('\n5. 💊 READY FOR PAYMENT:');
    const approvedPrescriptions = await prisma.prescription.findMany({
      where: { status: 'approved', paymentStatus: 'unpaid' },
      include: { user: true },
    });
    
    approvedPrescriptions.forEach(prescription => {
      console.log(`   • ${prescription.user.name}: ${prescription.medicine} - £${prescription.amount}`);
    });
    
    // 6. System Status
    console.log('\n6. 🎯 SYSTEM STATUS:');
    const emailReady = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const stripeReady = !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    const dbReady = userCount > 0;
    
    console.log(`   🗄️ Database: ${dbReady ? '✅ READY' : '❌ NOT READY'}`);
    console.log(`   💳 Stripe: ${stripeReady ? '✅ READY' : '❌ NOT READY'}`);
    console.log(`   📧 Email: ${emailReady ? '✅ READY' : '❌ NOT READY'}`);
    
    const allReady = emailReady && stripeReady && dbReady;
    console.log(`   🎉 Overall: ${allReady ? '✅ ALL SYSTEMS GO' : '⚠️ NEEDS ATTENTION'}`);
    
    // 7. Next Steps
    console.log('\n7. 🚀 NEXT STEPS:');
    if (!emailReady) {
      console.log('   ❌ Update .env.local with your Mailtrap credentials');
    }
    if (allReady) {
      console.log('   ✅ Test payment: Login as customer1@example.com / Customer@2024');
      console.log('   ✅ Use test card: 4242 4242 4242 4242');
      console.log('   ✅ Check Mailtrap inbox for email receipts');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifySystem();
