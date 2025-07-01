#!/usr/bin/env node

/**
 * Generate Static Export for GoDaddy Shared Hosting
 * This creates a static version of the site with limited functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generateStaticExport() {
  console.log('📁 Generating Static Export for GoDaddy Shared Hosting...');
  console.log('======================================================\n');
  
  try {
    // Step 1: Update Next.js config for static export
    console.log('🔧 Step 1: Configuring Next.js for static export...');
    
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    const nextConfigContent = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    // serverActions: false // Disabled for static export
  }
};

export default nextConfig;`;
    
    // Backup original config
    if (fs.existsSync(nextConfigPath)) {
      fs.copyFileSync(nextConfigPath, nextConfigPath + '.backup');
      console.log('   ✅ Backed up original next.config.ts');
    }
    
    // Write static export config
    fs.writeFileSync(nextConfigPath, nextConfigContent);
    console.log('   ✅ Updated next.config.ts for static export');
    
    // Step 2: Build the application
    console.log('\n🏗️  Step 2: Building static application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('   ✅ Build completed successfully');
    
    // Step 3: Create .htaccess for Apache
    console.log('\n⚙️  Step 3: Creating .htaccess file...');
    const htaccessContent = `# Apache Configuration for Pharmacy Management System
RewriteEngine On

# Remove .html extension from URLs
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^([^.]+)$ $1.html [NC,L]

# Handle Next.js static routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [NC,L,QSA]

# Enable compression
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
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/icon "access plus 1 year"
    ExpiresByType text/plain "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>`;
    
    const outDir = path.join(process.cwd(), 'out');
    fs.writeFileSync(path.join(outDir, '.htaccess'), htaccessContent);
    console.log('   ✅ Created .htaccess file');
    
    // Step 4: Create upload instructions
    console.log('\n📋 Step 4: Creating upload instructions...');
    const uploadInstructions = `# 📤 UPLOAD INSTRUCTIONS FOR GODADDY SHARED HOSTING

## 🎯 What to Upload
Upload all files from the "out" folder to your GoDaddy hosting account.

## 📁 Upload Location
- **Shared Hosting**: Upload to "public_html" folder
- **cPanel**: Use File Manager or FTP to upload to "public_html"

## 🔗 Files to Upload
All files in the "out" directory including:
- HTML files (*.html)
- CSS files (*.css)
- JavaScript files (*.js)
- Images and assets
- .htaccess file (IMPORTANT!)

## ⚠️ IMPORTANT LIMITATIONS
This static version has LIMITED functionality:

### ✅ What Works:
- Home page
- About page
- Contact page (form display only)
- Static content and styling
- Basic navigation

### ❌ What Doesn't Work:
- User login/registration
- Database operations
- Prescription management
- Payment processing
- Admin dashboard
- API endpoints
- Real-time features

## 🚀 Better Alternative: Use Option 1
Consider using "GoDaddy Domain → Vercel" instead:
- Same custom domain
- Full functionality
- Better performance
- Free hosting

## 📞 Support
If you need full functionality, contact support for VPS hosting
or use the Vercel deployment option.

---
Generated on: ${new Date().toISOString()}`;
    
    fs.writeFileSync(path.join(outDir, 'UPLOAD_INSTRUCTIONS.txt'), uploadInstructions);
    console.log('   ✅ Created upload instructions');
    
    // Step 5: Create a summary README
    const readmeContent = `# Static Export Complete! 📁

## 📋 Summary
Your pharmacy management system has been exported as static files.

## 📁 Upload These Files
Upload everything in the "out" folder to your GoDaddy hosting:
- All HTML files
- All CSS and JS files  
- All images and assets
- .htaccess file (CRITICAL!)

## 🎯 Upload Destination
- **GoDaddy Shared Hosting**: public_html folder
- **Use**: File Manager or FTP client

## ⚠️ Functionality Limitations
This static version only includes basic pages. For full functionality (login, prescriptions, payments), consider:

1. **GoDaddy Domain → Vercel** (Recommended)
2. **GoDaddy VPS Hosting**

See GODADDY_DOMAIN_DEPLOYMENT_GUIDE.md for full instructions.

## 📞 Need Help?
Run: node scripts/configure-godaddy-domain.js
`;
    
    fs.writeFileSync('STATIC_EXPORT_README.md', readmeContent);
    
    // Restore original config
    const backupPath = nextConfigPath + '.backup';
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, nextConfigPath);
      fs.unlinkSync(backupPath);
      console.log('   ✅ Restored original next.config.ts');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 STATIC EXPORT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('📁 Files ready for upload in: ./out/');
    console.log('📋 Upload instructions: ./out/UPLOAD_INSTRUCTIONS.txt');
    console.log('📖 README: ./STATIC_EXPORT_README.md');
    console.log('\n⚠️  REMEMBER: This static version has LIMITED functionality!');
    console.log('🚀 For full features, use "GoDaddy Domain → Vercel" option');
    
  } catch (error) {
    console.error('❌ Static export failed:', error.message);
    
    // Try to restore config if it exists
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    const backupPath = nextConfigPath + '.backup';
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, nextConfigPath);
      fs.unlinkSync(backupPath);
      console.log('🔄 Restored original next.config.ts');
    }
    
    process.exit(1);
  }
}

// Run the export
generateStaticExport().catch(console.error);
