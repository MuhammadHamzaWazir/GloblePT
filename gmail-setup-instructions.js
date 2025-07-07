// Gmail SMTP Setup Alternative for Global Pharma Trading
async function setupGmailSMTP() {
  console.log('📧 Gmail SMTP Setup for Global Pharma Trading');
  console.log('==============================================\n');
  
  console.log('📋 STEP-BY-STEP INSTRUCTIONS:\n');
  
  console.log('1. PREPARE YOUR GMAIL ACCOUNT');
  console.log('   → Go to your Gmail account settings');
  console.log('   → Enable 2-Factor Authentication (if not already)');
  console.log('   → Go to Google Account → Security → App passwords');
  console.log('   → Generate app password for "Mail"');
  console.log('   → Copy the 16-character password\n');
  
  console.log('2. CONFIGURE VERCEL ENVIRONMENT VARIABLES');
  console.log('   Copy and run these commands one by one:\n');
  
  console.log('   vercel env add SMTP_HOST');
  console.log('   → Enter: smtp.gmail.com\n');
  
  console.log('   vercel env add SMTP_PORT');
  console.log('   → Enter: 587\n');
  
  console.log('   vercel env add SMTP_USER');
  console.log('   → Enter: your-email@gmail.com\n');
  
  console.log('   vercel env add SMTP_PASS');
  console.log('   → Enter: YOUR_GMAIL_APP_PASSWORD\n');
  
  console.log('   vercel env add SMTP_FROM');
  console.log('   → Enter: "Global Pharma Trading <your-email@gmail.com>"\n');
  
  console.log('3. REDEPLOY TO PRODUCTION');
  console.log('   vercel --prod\n');
  
  console.log('🎯 PROS:');
  console.log('   → Uses your existing Gmail account');
  console.log('   → No need to create new service account');
  console.log('   → Reliable delivery\n');
  
  console.log('⚠️  CONSIDERATIONS:');
  console.log('   → Gmail has daily sending limits');
  console.log('   → Emails come from your personal Gmail');
  console.log('   → Requires app-specific password setup\n');
  
  console.log('🔥 RECOMMENDED: Use SendGrid for production');
  console.log('   → More professional');
  console.log('   → Better deliverability');
  console.log('   → Detailed analytics\n');
}

setupGmailSMTP();
