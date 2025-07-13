#!/usr/bin/env node

/**
 * EMAIL CONFIGURATION HELPER
 * Helps set up Mailtrap email configuration
 */

const fs = require('fs');
const path = require('path');

console.log('📧 EMAIL CONFIGURATION HELPER');
console.log('==============================');
console.log('');
console.log('To set up email delivery with Mailtrap:');
console.log('');
console.log('1. 🌐 Go to https://mailtrap.io');
console.log('2. 📝 Sign up or log in to your account');
console.log('3. 📮 Create a new inbox or use an existing one');
console.log('4. ⚙️ Go to your inbox settings');
console.log('5. 📋 Copy the SMTP settings');
console.log('');
console.log('Your Mailtrap SMTP settings should look like:');
console.log('─────────────────────────────────────────────');
console.log('Host: sandbox.smtp.mailtrap.io (or live.smtp.mailtrap.io)');
console.log('Port: 2525 (or 587)');
console.log('Username: [your_mailtrap_username]');
console.log('Password: [your_mailtrap_password]');
console.log('');
console.log('Once you have these credentials, update your .env file:');
console.log('');

// Show current config
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Current .env file email configuration:');
  console.log('─────────────────────────────────────────');
  
  const emailLines = envContent.split('\n').filter(line => 
    line.includes('SMTP_') || line.includes('NODE_ENV') || line.includes('# Local email')
  );
  
  emailLines.forEach(line => {
    console.log(line);
  });
}

console.log('');
console.log('🔧 TO UPDATE YOUR EMAIL CONFIG:');
console.log('================================');
console.log('1. Replace the following lines in your .env file:');
console.log('');
console.log('SMTP_HOST=sandbox.smtp.mailtrap.io');
console.log('SMTP_PORT=2525');
console.log('SMTP_SECURE=false');
console.log('SMTP_USER=your_actual_mailtrap_username');
console.log('SMTP_PASS=your_actual_mailtrap_password');
console.log('');
console.log('2. Save the file');
console.log('3. Run: node verify-system.js');
console.log('4. Test email delivery: node test-local-environment.js');
console.log('');
console.log('💡 TIP: Make sure to use your actual Mailtrap credentials!');
console.log('');
console.log('🎯 Once email is configured, you can:');
console.log('• Test payment receipts');
console.log('• Test order confirmations');
console.log('• Test user verification emails');
console.log('• See all emails in your Mailtrap inbox');
