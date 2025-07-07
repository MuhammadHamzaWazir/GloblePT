#!/usr/bin/env node

console.log('🔍 VERCEL ENVIRONMENT VARIABLES TROUBLESHOOTING');
console.log('================================================\n');

console.log('❌ CURRENT PRODUCTION VALUES (STILL INCORRECT):');
console.log('SMTP_HOST = contact@globalpharmatrading.co.uk');
console.log('SMTP_USER = apikey \\r\\n');
console.log('This means the environment variables are NOT updated correctly.\n');

console.log('🔧 TROUBLESHOOTING CHECKLIST:');
console.log('==============================');
console.log('1. ✅ Did you go to https://vercel.com/dashboard?');
console.log('2. ✅ Did you click on the correct project (globalpharmatrading)?');
console.log('3. ✅ Did you go to Settings → Environment Variables?');
console.log('4. ⚠️  Did you update for the PRODUCTION environment (not Preview)?');
console.log('5. ⚠️  Did you click SAVE after making the changes?');
console.log('6. ⚠️  Are you sure you changed the correct variables?\n');

console.log('📝 PLEASE DOUBLE-CHECK THESE EXACT CHANGES:');
console.log('============================================');
console.log('Variable: SMTP_HOST');
console.log('  OLD: contact@globalpharmatrading.co.uk');
console.log('  NEW: smtp.sendgrid.net');
console.log('');
console.log('Variable: SMTP_USER');
console.log('  OLD: apikey \\r\\n');
console.log('  NEW: apikey');
console.log('');
console.log('Variable: SMTP_PASS');
console.log('  Should be: [Your SendGrid API Key]');
console.log('');
console.log('Environment: PRODUCTION (not Preview/Development)\n');

console.log('🚀 AFTER UPDATING, WAIT 2-3 MINUTES THEN TEST:');
console.log('================================================');
console.log('Sometimes Vercel takes a few minutes to propagate changes.');
console.log('Run this command again: node diagnose-smtp.js');
console.log('');
console.log('✅ SUCCESS INDICATORS:');
console.log('- SMTP_HOST should show: smtp.sendgrid.net');
console.log('- SMTP_USER should show: apikey (no extra characters)');
console.log('- SMTP connection test should succeed\n');

console.log('🔄 IF STILL NOT WORKING:');
console.log('=========================');
console.log('1. Try deleting the variables completely and re-adding them');
console.log('2. Make sure you\'re in the right Vercel project');
console.log('3. Check if you have multiple projects with similar names');
console.log('4. Verify you\'re updating Production environment (not Preview)');
