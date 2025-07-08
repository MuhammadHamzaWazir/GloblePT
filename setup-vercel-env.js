#!/usr/bin/env node

/**
 * VERCEL ENVIRONMENT VARIABLES SETUP GUIDE
 * Use this script to set up your Stripe keys in Vercel
 */

console.log('🚀 SETTING UP VERCEL ENVIRONMENT VARIABLES');
console.log('==========================================');

console.log('\n📋 REQUIRED STRIPE ENVIRONMENT VARIABLES:');
console.log('=========================================');

// Read the local .env file to show the user what needs to be set
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract Stripe keys
  const stripeSecretMatch = envContent.match(/STRIPE_SECRET_KEY="([^"]+)"/);
  const stripePublicMatch = envContent.match(/NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="([^"]+)"/);
  
  if (stripeSecretMatch && stripePublicMatch) {
    const secretKey = stripeSecretMatch[1];
    const publicKey = stripePublicMatch[1];
    
    console.log('\n✅ Found your Stripe keys in .env file:');
    console.log(`🔑 STRIPE_SECRET_KEY: ${secretKey.substring(0, 15)}...`);
    console.log(`🔑 STRIPE_PUBLISHABLE_KEY: ${publicKey.substring(0, 15)}...`);
    
    console.log('\n🎯 STEP 1: Set Environment Variables in Vercel Dashboard');
    console.log('=======================================================');
    console.log('1. Go to: https://vercel.com/dashboard');
    console.log('2. Select your project: global-pharma-trading');
    console.log('3. Go to Settings → Environment Variables');
    console.log('4. Add these variables:');
    
    console.log('\n📝 ADD THESE EXACT VARIABLES:');
    console.log('=============================');
    console.log(`Name: STRIPE_SECRET_KEY`);
    console.log(`Value: ${secretKey}`);
    console.log(`Environment: Production, Preview, Development`);
    console.log('');
    console.log(`Name: STRIPE_PUBLISHABLE_KEY`);
    console.log(`Value: ${publicKey}`);
    console.log(`Environment: Production, Preview, Development`);
    
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('===================');
    console.log('✅ Only add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY');
    console.log('❌ DO NOT add STRIPE_WEBHOOK_SECRET (not needed)');
    console.log('🔒 These keys are for TEST mode (sk_test_... and pk_test_...)');
    console.log('💡 For production, you\'ll need live keys from Stripe');
    
    console.log('\n🎯 STEP 2: Alternative - Use Vercel CLI');
    console.log('=====================================');
    console.log('You can also set these using the Vercel CLI:');
    console.log('');
    console.log(`vercel env add STRIPE_SECRET_KEY`);
    console.log(`# Paste: ${secretKey}`);
    console.log('# Select: Production, Preview, Development');
    console.log('');
    console.log(`vercel env add STRIPE_PUBLISHABLE_KEY`);
    console.log(`# Paste: ${publicKey}`);
    console.log('# Select: Production, Preview, Development');
    
    console.log('\n🎯 STEP 3: Redeploy After Adding Variables');
    console.log('==========================================');
    console.log('After adding the environment variables:');
    console.log('1. Go back to your Vercel project dashboard');
    console.log('2. Go to Deployments tab');
    console.log('3. Click "Redeploy" on the latest deployment');
    console.log('OR run: vercel --prod');
    
    console.log('\n🧪 STEP 4: Verify Deployment');
    console.log('============================');
    console.log('After redeployment, run: node final-deployment-verification.js');
    console.log('This will test that your Stripe integration is working correctly.');
    
  } else {
    console.log('❌ Could not find Stripe keys in .env file');
    console.log('Please make sure your .env file contains:');
    console.log('STRIPE_SECRET_KEY="sk_test_..."');
    console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."');
  }
  
} catch (error) {
  console.log('❌ Could not read .env file:', error.message);
  console.log('\nManually add these to Vercel:');
  console.log('STRIPE_SECRET_KEY=your_stripe_secret_key');
  console.log('STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key');
}

console.log('\n🔗 USEFUL LINKS:');
console.log('================');
console.log('Vercel Dashboard: https://vercel.com/dashboard');
console.log('Environment Variables Guide: https://vercel.com/docs/projects/environment-variables');
console.log('Your Live Site: https://globalpharmatrading.co.uk');

console.log('\n✅ REMEMBER: No webhook secret needed for this deployment!');
console.log('The app only uses direct Stripe API calls, no webhooks.');
