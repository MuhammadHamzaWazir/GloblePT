#!/usr/bin/env node
/**
 * Production Deployment Script
 * This script handles fresh migration and seeding for production deployment
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  console.log(`Command: ${command}`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function deployProduction() {
  console.log('🚀 Starting Production Deployment');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Reset database and migrations
    console.log('\n📦 Step 1: Database Reset and Migration');
    await runCommand('npx prisma migrate reset --force', 'Resetting database');
    
    // Step 2: Generate Prisma client
    console.log('\n📦 Step 2: Generate Prisma Client');
    await runCommand('npx prisma generate', 'Generating Prisma client');
    
    // Step 3: Run fresh migrations
    console.log('\n📦 Step 3: Fresh Migrations');
    await runCommand('npx prisma migrate deploy', 'Deploying migrations');
    
    // Step 4: Run production seeding
    console.log('\n📦 Step 4: Production Seeding');
    await runCommand('node prisma/seed-production.js', 'Seeding production data');
    
    // Step 5: Verify deployment
    console.log('\n📦 Step 5: Deployment Verification');
    await runCommand('node scripts/health-check.js', 'Running health check');
    
    console.log('\n🎉 Production deployment completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the production server: npm run start');
    console.log('2. Or start with Docker: docker-compose -f docker-compose.prod.yml up');
    console.log('3. Access the application at: http://localhost:3000');
    console.log('4. Login with the credentials displayed above');
    
  } catch (error) {
    console.error('\n❌ Production deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deployProduction();
