#!/usr/bin/env node

console.log('🔧 Setting SMTP_USER for SendGrid');
console.log('');
console.log('For SendGrid SMTP authentication, SMTP_USER must be set to: "apikey"');
console.log('This is a literal string, not a placeholder.');
console.log('');
console.log('Steps to fix:');
console.log('1. Run: vercel env rm SMTP_USER production');
console.log('2. Run: vercel env add SMTP_USER production');
console.log('3. When prompted for value, enter exactly: apikey');
console.log('4. Run: vercel --prod (to redeploy)');
console.log('');
console.log('SendGrid SMTP Configuration:');
console.log('SMTP_HOST: smtp.sendgrid.net');
console.log('SMTP_PORT: 587');
console.log('SMTP_USER: apikey  <-- This must be exactly "apikey"');
console.log('SMTP_PASS: <your SendGrid API key>');
console.log('SMTP_FROM: noreply@globalpharmatrading.co.uk');
