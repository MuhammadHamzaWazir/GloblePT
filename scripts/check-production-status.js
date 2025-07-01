#!/usr/bin/env node

/**
 * Check Production Database Migration Status
 * This script checks the status of migrations in the production database
 */

const { execSync } = require('child_process');
const path = require('path');

async function checkStatus() {
  console.log('🔍 Checking production database migration status...');
  
  try {
    // Change to the project root directory
    const projectRoot = path.join(__dirname, '..');
    process.chdir(projectRoot);
    
    // Set the DATABASE_URL for Railway production database
    const DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
    process.env.DATABASE_URL = DATABASE_URL;
    
    console.log('🔧 DATABASE_URL: Set to Railway production database');
    console.log('🔗 Database host: nozomi.proxy.rlwy.net:54948');
    
    // Check migration status
    console.log('📊 Checking migration status...');
    execSync('npx prisma migrate status', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
  } catch (error) {
    console.error('❌ Error checking migration status:', error.message);
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check if the database is accessible');
    console.log('2. Verify network connectivity');
    console.log('3. Check if there are failed migrations that need to be resolved');
    
    process.exit(1);
  }
}

// Run the status check
checkStatus().then(() => {
  console.log('✅ Status check completed!');
}).catch((error) => {
  console.error('❌ Status check failed:', error);
  process.exit(1);
});
