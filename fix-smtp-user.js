// Set SMTP_USER correctly for SendGrid
console.log('🔧 Setting SMTP_USER correctly for SendGrid...\n');

console.log('⚠️  IMPORTANT: For SendGrid SMTP, SMTP_USER must be exactly "apikey"');
console.log('   Do NOT use your email or username - use the literal word "apikey"\n');

console.log('Run this command:');
console.log('vercel env add SMTP_USER');
console.log('When prompted for value, enter exactly: apikey');
console.log('(just the word "apikey" without quotes)\n');

console.log('This is required for SendGrid authentication to work properly.');
