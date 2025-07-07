// Gmail SMTP Setup Guide for Global Pharma Trading
console.log('📧 GMAIL SMTP SETUP - Step by Step Guide');
console.log('=========================================\n');

console.log('🔐 STEP 1: PREPARE YOUR GMAIL ACCOUNT');
console.log('--------------------------------------');
console.log('1. Go to your Google Account settings:');
console.log('   → Visit: https://myaccount.google.com/');
console.log('   → Click "Security" in the left sidebar\n');

console.log('2. Enable 2-Factor Authentication (if not already enabled):');
console.log('   → Look for "2-Step Verification"');
console.log('   → Follow the setup process\n');

console.log('3. Generate App Password:');
console.log('   → In Security settings, find "App passwords"');
console.log('   → Click "App passwords"');
console.log('   → Select "Mail" as the app');
console.log('   → Select "Other (custom name)" as device');
console.log('   → Enter: "Global Pharma Trading"');
console.log('   → Click "Generate"');
console.log('   → COPY the 16-character password (save it!)\n');

console.log('📝 STEP 2: CONFIGURE VERCEL ENVIRONMENT VARIABLES');
console.log('------------------------------------------------');
console.log('Run these commands in your terminal:\n');

console.log('Command 1:');
console.log('vercel env add SMTP_HOST');
console.log('When prompted, enter: smtp.gmail.com\n');

console.log('Command 2:');
console.log('vercel env add SMTP_PORT');
console.log('When prompted, enter: 587\n');

console.log('Command 3:');
console.log('vercel env add SMTP_USER');
console.log('When prompted, enter: YOUR_GMAIL_ADDRESS@gmail.com\n');

console.log('Command 4:');
console.log('vercel env add SMTP_PASS');
console.log('When prompted, enter: THE_16_CHARACTER_APP_PASSWORD\n');

console.log('Command 5:');
console.log('vercel env add SMTP_FROM');
console.log('When prompted, enter: "Global Pharma Trading <YOUR_GMAIL_ADDRESS@gmail.com>"\n');

console.log('🚀 STEP 3: DEPLOY TO PRODUCTION');
console.log('-------------------------------');
console.log('vercel --prod\n');

console.log('✅ STEP 4: TEST EMAIL DELIVERY');
console.log('------------------------------');
console.log('After deployment, test by:');
console.log('1. Visit: https://globalpharmatrading.co.uk/auth/login');
console.log('2. Try logging in with 2FA enabled');
console.log('3. Check your email for verification code\n');

console.log('🎯 READY TO START?');
console.log('Follow the steps above, and I\'ll help you configure the environment variables!');
