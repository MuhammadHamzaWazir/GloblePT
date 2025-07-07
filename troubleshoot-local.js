#!/usr/bin/env node

console.log('🔧 LOCAL DEVELOPMENT TROUBLESHOOTING GUIDE');
console.log('===========================================\n');

console.log('❌ CURRENT ISSUES DETECTED:');
console.log('============================');
console.log('1. Database check failed');
console.log('2. Email configuration failed');
console.log('3. API endpoints not responding properly\n');

console.log('🛠️  STEP-BY-STEP FIXES:');
console.log('========================\n');

console.log('1️⃣ CHECK DATABASE CONNECTION:');
console.log('------------------------------');
console.log('Make sure MySQL is running and accessible.');
console.log('Current DATABASE_URL in .env: mysql://root:password@localhost:3306/pharmacy');
console.log('');
console.log('Commands to check:');
console.log('• mysql -u root -p  (test MySQL connection)');
console.log('• CREATE DATABASE pharmacy;  (create database if needed)');
console.log('• npx prisma migrate deploy  (apply database schema)\n');

console.log('2️⃣ CHECK ENVIRONMENT VARIABLES:');
console.log('--------------------------------');
console.log('Your .env file should have:');
console.log('DATABASE_URL="mysql://root:password@localhost:3306/pharmacy"');
console.log('NODE_ENV=development');
console.log('SMTP_HOST=smtp.ethereal.email');
console.log('SMTP_PORT=587');
console.log('SMTP_FROM=noreply@globalpharmatrading.co.uk');
console.log('NEXTAUTH_SECRET=your-secret');
console.log('JWT_SECRET=your-jwt-secret');
console.log('NEXTAUTH_URL=http://localhost:3000\n');

console.log('3️⃣ CHECK DEVELOPMENT SERVER:');
console.log('-----------------------------');
console.log('In your terminal running npm run dev, look for:');
console.log('• Any red error messages');
console.log('• Database connection errors');
console.log('• Prisma schema errors');
console.log('• Port conflicts\n');

console.log('4️⃣ SIMPLE EMAIL TEST:');
console.log('----------------------');
console.log('Once server is running properly, test with:');
console.log('');
console.log('curl -X POST http://localhost:3000/api/test-email \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"action": "test-config"}\'');
console.log('');
console.log('Should return: {"success": true, "message": "Email configuration is valid"}\n');

console.log('5️⃣ DATABASE MIGRATION:');
console.log('-----------------------');
console.log('If database issues persist, run:');
console.log('npx prisma generate');
console.log('npx prisma migrate deploy');
console.log('npx prisma db seed  (if you have seed data)\n');

console.log('6️⃣ QUICK FIXES TO TRY:');
console.log('-----------------------');
console.log('• Restart the development server (Ctrl+C, then npm run dev)');
console.log('• Clear Next.js cache: rm -rf .next');
console.log('• Reinstall dependencies: npm install');
console.log('• Check if port 3000 is free: netstat -an | findstr 3000\n');

console.log('🎯 GOAL FOR LOCAL TESTING:');
console.log('===========================');
console.log('Once fixed, you should be able to:');
console.log('✅ See Ethereal email preview URLs in server console');
console.log('✅ Test 2FA login flow locally');
console.log('✅ Verify email templates and content');
console.log('✅ Debug email sending logic before production deployment\n');

console.log('💡 NEXT STEPS:');
console.log('===============');
console.log('1. Fix the issues above');
console.log('2. Run: node test-local-2fa-simple.js');
console.log('3. Check server console for Ethereal email preview URLs');
console.log('4. Once local testing works, deploy to production with Mailtrap');

console.log('\n📧 NEED HELP?');
console.log('=============');
console.log('Share your development server console output to see specific errors.');
console.log('The errors will help identify exactly what needs to be fixed.');
