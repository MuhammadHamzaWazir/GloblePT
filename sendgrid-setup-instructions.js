// Quick SendGrid SMTP Setup for Global Pharma Trading
async function setupSendGridSMTP() {
  console.log('🔥 SendGrid SMTP Setup for Global Pharma Trading');
  console.log('=================================================\n');
  
  console.log('📋 STEP-BY-STEP INSTRUCTIONS:\n');
  
  console.log('1. CREATE SENDGRID ACCOUNT');
  console.log('   → Go to: https://sendgrid.com/');
  console.log('   → Click "Start for Free"');
  console.log('   → Complete signup process');
  console.log('   → Verify your email address\n');
  
  console.log('2. CREATE API KEY');
  console.log('   → Login to SendGrid dashboard');
  console.log('   → Go to Settings → API Keys');
  console.log('   → Click "Create API Key"');
  console.log('   → Name: "Global Pharma Trading SMTP"');
  console.log('   → Choose "Restricted Access"');
  console.log('   → Under "Mail Send", toggle it ON');
  console.log('   → Click "Create & View"');
  console.log('   → COPY THE API KEY (you won\'t see it again!)\n');
  
  console.log('3. CONFIGURE VERCEL ENVIRONMENT VARIABLES');
  console.log('   Copy and run these commands one by one:\n');
  
  console.log('   vercel env add SMTP_HOST');
  console.log('   → Enter: smtp.sendgrid.net\n');
  
  console.log('   vercel env add SMTP_PORT');
  console.log('   → Enter: 587\n');
  
  console.log('   vercel env add SMTP_USER');
  console.log('   → Enter: apikey\n');
  
  console.log('   vercel env add SMTP_PASS');
  console.log('   → Enter: YOUR_SENDGRID_API_KEY_HERE\n');
  
  console.log('   vercel env add SMTP_FROM');
  console.log('   → Enter: "Global Pharma Trading <noreply@globalpharmatrading.co.uk>"\n');
  
  console.log('4. REDEPLOY TO PRODUCTION');
  console.log('   vercel --prod\n');
  
  console.log('5. TEST EMAIL DELIVERY');
  console.log('   → Visit: https://globalpharmatrading.co.uk/auth/login');
  console.log('   → Try logging in with 2FA enabled');
  console.log('   → Check your email for verification code\n');
  
  console.log('🎯 IMMEDIATE BENEFIT:');
  console.log('   → User mhamzawazir1996@gmail.com will receive 2FA codes');
  console.log('   → All email verification will work');
  console.log('   → No more "email system unavailable" messages\n');
  
  console.log('⚠️  IMPORTANT NOTES:');
  console.log('   → Keep your API key secure');
  console.log('   → SendGrid free tier: 100 emails/day');
  console.log('   → Check spam folder initially');
  console.log('   → Monitor email delivery in SendGrid dashboard\n');
  
  console.log('Need help? Email: contact@globalpharmatrading.co.uk');
}

setupSendGridSMTP();
