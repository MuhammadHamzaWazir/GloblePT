#!/usr/bin/env node

console.log('📧 MAILTRAP SMTP CONFIGURATION SETUP');
console.log('====================================\n');

console.log('🔧 MAILTRAP SMTP SETTINGS:');
console.log('==========================');
console.log('SMTP Host: live.smtp.mailtrap.io');
console.log('SMTP Port: 587 (STARTTLS)');
console.log('Security: STARTTLS');
console.log('Auth: API Token or Username/Password\n');

console.log('📝 ENVIRONMENT VARIABLES TO SET:');
console.log('=================================');
console.log('SMTP_HOST=live.smtp.mailtrap.io');
console.log('SMTP_PORT=587');
console.log('SMTP_SECURE=false');
console.log('SMTP_USER=api (for API token) or your-username');
console.log('SMTP_PASS=your-api-token or your-password');
console.log('SMTP_FROM=noreply@globalpharmatrading.co.uk\n');

console.log('⚠️  IMPORTANT NOTES:');
console.log('====================');
console.log('1. Sign up for Mailtrap account at https://mailtrap.io/');
console.log('2. Go to Sending → Sending Domains');
console.log('3. Add and verify your domain: globalpharmatrading.co.uk');
console.log('4. Get your API token from Sending → API Tokens');
console.log('5. Use API token for better security than username/password\n');

console.log('🔒 SECURITY BEST PRACTICES:');
console.log('============================');
console.log('- Use API token instead of username/password');
console.log('- Verify your sending domain in Mailtrap');
console.log('- Monitor your sending limits and reputation');
console.log('- Use dedicated IP if you have high volume\n');

console.log('🧪 MAILTRAP ADVANTAGES:');
console.log('========================');
console.log('- Reliable delivery rates');
console.log('- Built-in email testing and debugging');
console.log('- Real-time analytics and logs');
console.log('- No complex DNS setup required');
console.log('- Works immediately after verification\n');

console.log('📋 SETUP STEPS:');
console.log('================');
console.log('1. Sign up at https://mailtrap.io/');
console.log('2. Verify your email and create account');
console.log('3. Go to Sending → Sending Domains');
console.log('4. Add domain: globalpharmatrading.co.uk');
console.log('5. Add DNS records to verify domain');
console.log('6. Get API token from Sending → API Tokens');
console.log('7. Set environment variables in Vercel');
console.log('8. Deploy and test email delivery\n');

console.log('🚀 QUICK START COMMANDS:');
console.log('=========================');
console.log('# Remove old SendGrid variables');
console.log('vercel env rm SMTP_HOST production');
console.log('vercel env rm SMTP_USER production');
console.log('vercel env rm SMTP_PASS production');
console.log('');
console.log('# Add Mailtrap variables');
console.log('vercel env add SMTP_HOST production  # live.smtp.mailtrap.io');
console.log('vercel env add SMTP_USER production  # api');
console.log('vercel env add SMTP_PASS production  # your-api-token');
console.log('vercel env add SMTP_PORT production  # 587');
console.log('');
console.log('# Deploy');
console.log('vercel --prod');
