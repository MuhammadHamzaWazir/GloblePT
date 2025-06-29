#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Global Pharma Trading - Deployment Setup');
console.log('=' .repeat(50));

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('⚠️  .env.local not found. Please create it from .env.example');
  console.log('📝 Required environment variables:');
  console.log('   - DATABASE_URL (MySQL connection string)');
  console.log('   - JWT_SECRET (32+ character secret)');
  console.log('   - NEXTAUTH_SECRET (32+ character secret)');
  console.log('   - NEXTAUTH_URL (your domain URL)');
  console.log('');
  console.log('📖 See DEPLOYMENT_GUIDE.md for detailed instructions');
  process.exit(1);
}

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${description} failed:`, error.message);
        reject(error);
      } else {
        console.log(`✅ ${description} completed`);
        if (stdout) console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

async function main() {
  try {
    // Install dependencies
    await runCommand('npm install', 'Installing dependencies');
    
    // Generate Prisma client
    await runCommand('npm run db:generate', 'Generating Prisma client');
    
    // Run migrations
    await runCommand('npm run db:migrate:deploy', 'Running database migrations');
    
    // Seed database
    await runCommand('npm run db:seed:prod', 'Seeding database with production data');
    
    // Build application
    await runCommand('npm run build', 'Building application');
    
    console.log('');
    console.log('🎉 Deployment setup completed successfully!');
    console.log('');
    console.log('🔐 Default login credentials:');
    console.log('   Admin: admin@pharmacy.com / password123');
    console.log('   Staff: sarah.johnson@pharmacy.com / password123');
    console.log('   Customer: alice.smith@gmail.com / password123');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Start the server: npm run start');
    console.log('   2. Test APIs: npm run test:api');
    console.log('   3. Deploy to Vercel: vercel --prod');
    console.log('');
    console.log('📖 For detailed deployment instructions, see DEPLOYMENT_GUIDE.md');
    
  } catch (error) {
    console.log('');
    console.log('❌ Deployment setup failed!');
    console.log('📖 Check DEPLOYMENT_GUIDE.md for troubleshooting');
    process.exit(1);
  }
}

main();
