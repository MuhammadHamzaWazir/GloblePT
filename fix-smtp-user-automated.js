#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Setting SMTP_USER environment variable for SendGrid...');

try {
  // Add SMTP_USER with value "apikey"
  const command = 'echo apikey | vercel env add SMTP_USER production';
  execSync(command, { stdio: 'inherit' });
  console.log('✅ SMTP_USER set successfully!');
} catch (error) {
  console.error('❌ Error setting SMTP_USER:', error.message);
  console.log('');
  console.log('Manual steps:');
  console.log('1. Run: vercel env add SMTP_USER production');
  console.log('2. When prompted, enter exactly: apikey');
  console.log('3. Press Enter');
}
