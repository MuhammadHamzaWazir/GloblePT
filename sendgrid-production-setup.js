// SendGrid Setup Guide for Global Pharma Trading Production
console.log('🔥 SENDGRID SETUP FOR GLOBAL PHARMA TRADING');
console.log('==========================================\n');

console.log('📋 STEP 1: CREATE SENDGRID ACCOUNT');
console.log('1. Go to: https://sendgrid.com/');
console.log('2. Click "Start for Free"');
console.log('3. Sign up with your email');
console.log('4. Verify your email address');
console.log('5. Complete the onboarding process\n');

console.log('📋 STEP 2: CREATE API KEY');
console.log('1. Login to SendGrid dashboard');
console.log('2. Go to Settings → API Keys (left sidebar)');
console.log('3. Click "Create API Key" (blue button)');
console.log('4. Choose "Restricted Access"');
console.log('5. Name: "Global Pharma Trading SMTP"');
console.log('6. Under "Mail Send" section, toggle it ON');
console.log('7. Click "Create & View"');
console.log('8. COPY THE API KEY immediately (you won\'t see it again!)');
console.log('9. Save it somewhere secure\n');

console.log('📋 STEP 3: CONFIGURE VERCEL ENVIRONMENT VARIABLES');
console.log('Copy and paste these commands one by one:\n');

console.log('vercel env add SMTP_HOST');
console.log('# When prompted, enter: smtp.sendgrid.net\n');

console.log('vercel env add SMTP_PORT');
console.log('# When prompted, enter: 587\n');

console.log('vercel env add SMTP_USER');
console.log('# When prompted, enter: apikey\n');

console.log('vercel env add SMTP_PASS');
console.log('# When prompted, enter: YOUR_SENDGRID_API_KEY\n');

console.log('vercel env add SMTP_FROM');
console.log('# When prompted, enter: "Global Pharma Trading <noreply@globalpharmatrading.co.uk>"\n');

console.log('📋 STEP 4: DEPLOY TO PRODUCTION');
console.log('vercel --prod\n');

console.log('📋 STEP 5: TEST EMAIL DELIVERY');
console.log('After deployment, test by:');
console.log('1. Go to: https://globalpharmatrading.co.uk/auth/login');
console.log('2. Try logging in with 2FA enabled');
console.log('3. Check your email for verification code\n');

console.log('🎯 WHAT THIS FIXES:');
console.log('✅ User mhamzawazir1996@gmail.com will receive 2FA codes');
console.log('✅ All 2FA email verification will work');
console.log('✅ No more "email system unavailable" messages');
console.log('✅ Professional emails from your domain\n');

console.log('⚠️  IMPORTANT NOTES:');
console.log('• Keep your API key secure and private');
console.log('• SendGrid free tier: 100 emails/day (perfect for your pharmacy)');
console.log('• Check spam folder initially for test emails');
console.log('• Monitor delivery in SendGrid dashboard\n');

console.log('🆘 NEED HELP?');
console.log('If you get stuck, I can help you with each step!');
console.log('Just let me know where you are in the process.\n');

console.log('🔗 USEFUL LINKS:');
console.log('SendGrid Signup: https://sendgrid.com/');
console.log('API Keys: https://app.sendgrid.com/settings/api_keys');
console.log('Your App: https://globalpharmatrading.co.uk/');
