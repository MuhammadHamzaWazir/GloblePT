// Set up SendGrid environment variables for Vercel
// Run this after you get your SendGrid API key

console.log('🚀 Setting up SendGrid Environment Variables...\n');

console.log('Please follow these steps AFTER you have your SendGrid API key:\n');

console.log('1. First, remove the current SMTP_HOST:');
console.log('   vercel env rm SMTP_HOST\n');

console.log('2. Add SendGrid SMTP configuration:');
console.log('   vercel env add SMTP_HOST --value="smtp.sendgrid.net"');
console.log('   vercel env add SMTP_PORT --value="587"');
console.log('   vercel env add SMTP_USER --value="apikey"');
console.log('   vercel env add SMTP_PASS --value="YOUR_SENDGRID_API_KEY_HERE"');
console.log('   vercel env add SMTP_FROM --value="Global Pharma Trading <noreply@globalpharmatrading.co.uk>"\n');

console.log('3. Deploy to production:');
console.log('   vercel --prod\n');

console.log('4. Test the email system:');
console.log('   node test-specific-user-email.js\n');

console.log('🔑 YOUR SENDGRID ACCOUNT SETUP:');
console.log('Step 1: Go to https://sendgrid.com/ and create account');
console.log('Step 2: Go to Settings → API Keys');
console.log('Step 3: Create API Key with "Mail Send" permission');
console.log('Step 4: Copy the API key');
console.log('Step 5: Use it in SMTP_PASS environment variable\n');

console.log('⚡ QUICK TEST AFTER SETUP:');
console.log('Once configured, test by going to:');
console.log('https://globalpharmatrading.co.uk/auth/login');
console.log('and trying to log in with 2FA enabled.\n');

console.log('✅ Expected Result:');
console.log('User mhamzawazir1996@gmail.com (and all users) will receive 2FA codes!');
