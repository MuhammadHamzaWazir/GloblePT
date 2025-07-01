#!/usr/bin/env node

/**
 * Production Database Migration Script
 * This script applies all pending Prisma migrations to the production database
 */

const { execSync } = require('child_process');
const path = require('path');

async function runMigrations() {
  console.log('🚀 Starting production database migration...');
  
  try {
    // Change to the project root directory
    const projectRoot = path.join(__dirname, '..');
    process.chdir(projectRoot);
    
    console.log('📍 Working directory:', process.cwd());
    
    // Set the DATABASE_URL for Railway production database
    const DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
    process.env.DATABASE_URL = DATABASE_URL;
    
    console.log('🔧 DATABASE_URL: Set to Railway production database');
    console.log('🔗 Database host: nozomi.proxy.rlwy.net:54948');
    
    // Run Prisma migrations
    console.log('⚡ Applying database migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Database migrations completed successfully!');
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Prisma client generated successfully!');
    
    // Show current database status
    console.log('📊 Checking database status...');
    try {
      execSync('npx prisma migrate status', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
    } catch (error) {
      console.log('ℹ️  Migration status check completed (some warnings are normal)');
    }
    
    console.log('\n🎉 Production database migration completed!');
    console.log('You can now run the seeding script to populate your database.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure DATABASE_URL is correctly set');
    console.log('2. Check that the database is accessible');
    console.log('3. Verify network connectivity to the database');
    process.exit(1);
  }
}

// Run the migration
runMigrations();
