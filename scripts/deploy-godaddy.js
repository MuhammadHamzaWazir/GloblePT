#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  GoDaddy Deployment Preparation');
console.log('=' .repeat(50));

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

async function createGoDaddyConfig() {
  console.log('📝 Creating GoDaddy-specific configurations...');
  
  // Create static export Next.js config
  const nextConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '',
};

export default nextConfig;`;

  fs.writeFileSync('next.config.godaddy.ts', nextConfig);
  
  // Create .htaccess for GoDaddy
  const htaccess = `RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle Next.js routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/jpg "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
ExpiresByType image/gif "access plus 1 year"
ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Compress files
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/plain
AddOutputFilterByType DEFLATE text/html
AddOutputFilterByType DEFLATE text/xml
AddOutputFilterByType DEFLATE text/css
AddOutputFilterByType DEFLATE application/xml
AddOutputFilterByType DEFLATE application/xhtml+xml
AddOutputFilterByType DEFLATE application/rss+xml
AddOutputFilterByType DEFLATE application/javascript
AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>`;

  fs.writeFileSync('.htaccess', htaccess);
  
  // Create production environment template
  const envProduction = `# GoDaddy Production Environment Variables
# Replace with your actual values

# Database Configuration (GoDaddy MySQL)
DATABASE_URL="mysql://your_db_user:your_db_password@localhost:3306/your_database_name"

# JWT Secret (generate a secure 32+ character string)
JWT_SECRET="your-super-secure-jwt-secret-key-32-chars-minimum"

# Next.js Configuration  
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-minimum"
NEXTAUTH_URL="https://yourdomain.com"

# App Configuration
APP_NAME="Global Pharma Trading"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Email Configuration (GoDaddy SMTP)
EMAIL_HOST="smtpout.secureserver.net"
EMAIL_PORT="465"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="noreply@yourdomain.com"

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"

# Environment
NODE_ENV="production"`;

  fs.writeFileSync('.env.production.template', envProduction);
  
  console.log('✅ GoDaddy configuration files created');
}

async function generateSQLSchema() {
  console.log('🗄️  Generating SQL schema for GoDaddy MySQL...');
  
  try {
    // Generate database schema SQL
    await runCommand('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > godaddy-schema.sql', 'Generate database schema');
    
    // Create seeding SQL
    const seedingSQL = `-- GoDaddy Database Seeding Script
-- Run this after uploading the schema

-- Insert this after schema creation:
-- You can run the seeding by accessing: https://yourdomain.com/api/seed-production

INSERT INTO godaddy_instructions (message) VALUES 
('After uploading schema, visit https://yourdomain.com/api/seed-production to populate data');`;

    fs.writeFileSync('godaddy-seeding.sql', seedingSQL);
    
    console.log('✅ SQL files generated for GoDaddy');
  } catch (error) {
    console.log('⚠️  Could not generate SQL schema automatically');
    console.log('   You can create it manually after deployment');
  }
}

async function createDeploymentPackage() {
  console.log('📦 Creating deployment package...');
  
  // Copy current config
  if (fs.existsSync('next.config.ts')) {
    fs.copyFileSync('next.config.ts', 'next.config.original.ts');
  }
  
  // Use GoDaddy config
  fs.copyFileSync('next.config.godaddy.ts', 'next.config.ts');
  
  // Build for static export
  await runCommand('npm run build', 'Build application for static export');
  
  // Restore original config
  if (fs.existsSync('next.config.original.ts')) {
    fs.copyFileSync('next.config.original.ts', 'next.config.ts');
    fs.unlinkSync('next.config.original.ts');
  }
  
  // Copy .htaccess to out directory
  if (fs.existsSync('out')) {
    fs.copyFileSync('.htaccess', 'out/.htaccess');
  }
  
  console.log('✅ Deployment package ready in "out" folder');
}

async function createUploadInstructions() {
  const instructions = `
🚀 GoDaddy Upload Instructions
=====================================

FILES TO UPLOAD:
📁 Upload ALL contents of the "out" folder to your GoDaddy public_html directory

UPLOAD METHODS:
1. cPanel File Manager:
   - Login to GoDaddy cPanel
   - Open File Manager
   - Navigate to public_html
   - Upload and extract files

2. FTP Client (FileZilla):
   - Host: your-domain.com
   - Username: Your cPanel username  
   - Password: Your cPanel password
   - Upload to /public_html/

3. GoDaddy Website Builder:
   - Use the file upload feature
   - Upload to root directory

DATABASE SETUP:
1. Create MySQL database in cPanel
2. Import godaddy-schema.sql via phpMyAdmin
3. Update .env.production with your database details
4. Visit https://yourdomain.com/api/seed-production (once)

CONFIGURATION:
1. Update .env.production.template with your actual values
2. Upload as .env.production to your server root

TEST AFTER UPLOAD:
✅ Visit https://yourdomain.com
✅ Test login: admin@pharmacy.com / password123
✅ Check admin dashboard
✅ Verify all pages load correctly

SUPPORT:
- Check GODADDY_DEPLOYMENT_GUIDE.md for detailed instructions
- Contact GoDaddy support if needed
- Check cPanel error logs for troubleshooting
`;

  fs.writeFileSync('UPLOAD_INSTRUCTIONS.txt', instructions);
  console.log('✅ Upload instructions created');
}

async function main() {
  try {
    console.log('🎯 Preparing your pharmacy system for GoDaddy hosting...\n');
    
    await createGoDaddyConfig();
    await generateSQLSchema();
    await createDeploymentPackage();
    await createUploadInstructions();
    
    console.log('\n🎉 GoDaddy deployment preparation complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. 📁 Upload contents of "out" folder to GoDaddy public_html');
    console.log('2. 🗄️  Import godaddy-schema.sql to your MySQL database');
    console.log('3. ⚙️  Configure .env.production with your GoDaddy details');
    console.log('4. 🌱 Visit yourdomain.com/api/seed-production to populate data');
    console.log('5. 🧪 Test your live website!');
    console.log('\n📖 Read GODADDY_DEPLOYMENT_GUIDE.md for detailed instructions');
    console.log('📝 Check UPLOAD_INSTRUCTIONS.txt for quick reference');
    
  } catch (error) {
    console.log('\n❌ Deployment preparation failed!');
    console.log('Error:', error.message);
    console.log('\n📖 Check GODADDY_DEPLOYMENT_GUIDE.md for manual steps');
  }
}

main();
