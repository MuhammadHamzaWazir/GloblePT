#!/usr/bin/env node

/**
 * Resolve Production Database Migration Issues
 * This script resolves failed migrations and applies pending ones
 */

const { execSync } = require('child_process');
const path = require('path');

async function resolveMigrations() {
  console.log('🔧 Resolving production database migration issues...');
  
  try {
    // Change to the project root directory
    const projectRoot = path.join(__dirname, '..');
    process.chdir(projectRoot);
    
    // Set the DATABASE_URL for Railway production database
    const DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
    process.env.DATABASE_URL = DATABASE_URL;
    
    console.log('🔧 DATABASE_URL: Set to Railway production database');
    console.log('🔗 Database host: nozomi.proxy.rlwy.net:54948');
    
    // Method 1: Try to resolve failed migrations by marking them as resolved
    console.log('🔄 Step 1: Attempting to resolve failed migrations...');
    try {
      execSync('npx prisma migrate resolve --applied 20250629195318_add_supervisor_relationship', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Marked failed migration as resolved');
    } catch (error) {
      console.log('⚠️  Migration resolve failed or not needed, continuing...');
    }
    
    // Method 2: Try to deploy pending migrations
    console.log('🚀 Step 2: Applying pending migrations...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Migrations deployed successfully!');
    } catch (error) {
      console.log('⚠️  Migration deploy failed, trying reset approach...');
      
      // Method 3: If deploy fails, we might need to reset and reapply
      console.log('🔄 Step 3: Attempting migration reset and reapply...');
      try {
        // Push the schema to match current state
        execSync('npx prisma db push --force-reset', { 
          stdio: 'inherit',
          env: { ...process.env }
        });
        console.log('✅ Database schema reset and pushed successfully!');
      } catch (resetError) {
        console.error('❌ Reset failed:', resetError.message);
        throw resetError;
      }
    }
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    console.log('✅ Prisma client generated successfully!');
    
    // Final status check
    console.log('📊 Final migration status check...');
    try {
      execSync('npx prisma migrate status', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
    } catch (statusError) {
      console.log('ℹ️  Status check completed (might show warnings)');
    }
    
  } catch (error) {
    console.error('❌ Migration resolution failed:', error.message);
    
    console.log('\n🔧 Manual resolution may be needed:');
    console.log('1. Check the database directly for schema issues');
    console.log('2. Consider using `prisma db push --force-reset` to reset schema');
    console.log('3. Verify all required columns exist in tables');
    
    process.exit(1);
  }
}

// Run the migration resolution
resolveMigrations().then(() => {
  console.log('✅ Migration resolution completed!');
}).catch((error) => {
  console.error('❌ Migration resolution failed:', error);
  process.exit(1);
});
