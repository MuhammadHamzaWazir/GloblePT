#!/usr/bin/env node

console.log('🚀 AUTOMATIC MAILTRAP SETUP FOR PRODUCTION');
console.log('==========================================\n');

async function setupMailtrap() {
  try {
    console.log('1️⃣ Removing old SendGrid configuration...');
    
    // Remove old SendGrid environment variables
    const removeCommands = [
      'vercel env rm SMTP_HOST production',
      'vercel env rm SMTP_USER production', 
      'vercel env rm SMTP_PASS production'
    ];

    for (const command of removeCommands) {
      console.log(`Running: ${command}`);
      // Note: You'll need to confirm each removal manually
    }

    console.log('\n2️⃣ Setting up Mailtrap configuration...');
    console.log('Please provide your Mailtrap credentials:\n');
    
    console.log('📧 MAILTRAP SETUP REQUIRED:');
    console.log('============================');
    console.log('1. Go to https://mailtrap.io/ and sign up');
    console.log('2. Navigate to Sending → Sending Domains');
    console.log('3. Add domain: globalpharmatrading.co.uk');
    console.log('4. Complete domain verification');
    console.log('5. Go to Sending → API Tokens');
    console.log('6. Create an API token');
    console.log('7. Come back here with your API token\n');

    console.log('🔧 ENVIRONMENT VARIABLES TO SET:');
    console.log('=================================');
    console.log('After getting your Mailtrap API token, run:');
    console.log('');
    console.log('vercel env add SMTP_HOST production');
    console.log('# Enter: live.smtp.mailtrap.io');
    console.log('');
    console.log('vercel env add SMTP_PORT production');
    console.log('# Enter: 587');
    console.log('');
    console.log('vercel env add SMTP_USER production');
    console.log('# Enter: api');
    console.log('');
    console.log('vercel env add SMTP_PASS production');
    console.log('# Enter: your-mailtrap-api-token');
    console.log('');
    console.log('vercel env add SMTP_FROM production');
    console.log('# Enter: noreply@globalpharmatrading.co.uk\n');

    console.log('🚀 AFTER SETTING VARIABLES:');
    console.log('============================');
    console.log('1. Run: vercel --prod');
    console.log('2. Wait for deployment to complete');
    console.log('3. Test: node test-mailtrap-email.js\n');

    console.log('✅ ADVANTAGES OF MAILTRAP:');
    console.log('===========================');
    console.log('- No sender identity verification required');
    console.log('- Works immediately after API token setup');
    console.log('- Excellent deliverability rates');
    console.log('- Built-in email testing and debugging');
    console.log('- Real-time analytics and logs');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupMailtrap();
