#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌐 GoDaddy Static Hosting Deployment (Clean)');
console.log('=' .repeat(55));

console.log('⚠️  IMPORTANT: This creates a MINIMAL STATIC version!');
console.log('   For full functionality, use Vercel instead.');
console.log('');

// Create backup directory outside src
const backupDir = path.join(__dirname, '..', 'deployment-backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Step 1: Backup original files
const filesToBackup = [
  'next.config.ts',
  'src/app/layout.tsx'
];

for (const file of filesToBackup) {
  if (fs.existsSync(file)) {
    const backupPath = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, backupPath);
    console.log('✅ Backed up ' + file);
  }
}

// Step 2: Use static export config
fs.copyFileSync('next.config.godaddy-static.ts', 'next.config.ts');
console.log('✅ Applied GoDaddy static export configuration');

// Step 3: Create MINIMAL static-friendly layout
const staticLayout = `import "./globals.css";
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Global Pharma Trading - Pharmacy Management System</title>
        <meta
          name="description"
          content="Professional pharmacy management system for Global Pharma Trading"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">Global Pharma Trading</h1>
            <p className="text-sm">Professional Pharmacy Management System</p>
          </div>
        </nav>
        <main>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2025 Global Pharma Trading. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}`;

fs.writeFileSync('src/app/layout.tsx', staticLayout);
console.log('✅ Created minimal static-friendly layout');

// Step 4: Move API routes to backup
const apiDir = 'src/app/api';
const apiBackupDir = path.join(backupDir, 'api');

if (fs.existsSync(apiDir)) {
  if (fs.existsSync(apiBackupDir)) {
    fs.rmSync(apiBackupDir, { recursive: true, force: true });
  }
  fs.renameSync(apiDir, apiBackupDir);
  console.log('✅ Moved API routes to backup');
}

// Step 5: Move problematic pages to backup
const problematicPages = [
  'src/app/admin',
  'src/app/role-test',
  'src/app/auth',
  'src/app/dashboard',
  'src/app/staff-dashboard',
  'src/app/assistant-portal',
  'src/app/profile',
  'src/app/payment',
  'src/app/complaints'
];

const pageBackups = [];
for (const pagePath of problematicPages) {
  if (fs.existsSync(pagePath)) {
    const backupPath = path.join(backupDir, path.basename(pagePath));
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
    fs.renameSync(pagePath, backupPath);
    pageBackups.push({ original: pagePath, backup: backupPath });
    console.log('✅ Moved ' + pagePath + ' to backup');
  }
}

// Step 6: Build the static export
try {
  console.log('🔨 Building static export...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Static build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore everything
  for (const backup of pageBackups) {
    if (fs.existsSync(backup.backup)) {
      fs.renameSync(backup.backup, backup.original);
    }
  }
  
  if (fs.existsSync(apiBackupDir)) {
    fs.renameSync(apiBackupDir, apiDir);
  }
  
  for (const file of filesToBackup) {
    const backupPath = path.join(backupDir, path.basename(file));
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, file);
    }
  }
  
  process.exit(1);
}

// Step 7: Create .htaccess for GoDaddy
const htaccessContent = `RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle Next.js routing for SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/404\\.html
RewriteRule . /index.html [L]

# Security headers
<IfModule mod_headers.c>
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy strict-origin-when-cross-origin
</IfModule>

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

fs.writeFileSync('out/.htaccess', htaccessContent);
console.log('✅ Created .htaccess file for GoDaddy');

// Step 8: Create comprehensive deployment guide
const deploymentGuide = `# 🚀 GoDaddy Static Deployment Guide

## ⚠️ IMPORTANT LIMITATIONS

This is a **STATIC DEMO VERSION** with the following limitations:
- ❌ **NO login/authentication system**
- ❌ **NO database connectivity**
- ❌ **NO API endpoints**
- ❌ **NO server-side features**
- ❌ **NO admin dashboard functionality**
- ❌ **NO prescription management**
- ❌ **NO user management**
- ✅ **Static pages and content ONLY**

## 🎯 RECOMMENDED DEPLOYMENT OPTIONS

### Option 1: Vercel (RECOMMENDED - Full Functionality)
1. **FREE and full-featured**
2. **Push code to GitHub** (already done)
3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import your pharmacy project
   - Deploy automatically
4. **Point your GoDaddy domain to Vercel:**
   - In GoDaddy DNS Manager:
     - Add CNAME record: \`www\` → \`your-app.vercel.app\`
     - Add A record: \`@\` → \`76.76.19.61\`
   - In Vercel dashboard:
     - Add your custom domain
     - Configure environment variables
5. **Get FULL functionality** including login, database, APIs, etc.

### Option 2: GoDaddy VPS with Node.js (Full Functionality)
1. **Upgrade to GoDaddy VPS hosting**
2. **Enable Node.js support**
3. **Upload full project and run with Node.js**
4. **Get full functionality**

### Option 3: GoDaddy Shared Hosting (Static Demo Only)
**Use the files generated by this script for demo purposes only**

## 📁 GoDaddy Static Upload Instructions

If you want to proceed with the limited static version:

### Step 1: Access GoDaddy cPanel
1. Log into [GoDaddy](https://sso.godaddy.com/)
2. Go to your hosting account
3. Open cPanel
4. Navigate to **File Manager**

### Step 2: Upload Files
1. Go to **public_html** directory
2. **Delete existing files** (backup first if needed)
3. **Upload ALL contents** of the \`out\` folder to public_html
4. **Ensure .htaccess file** is uploaded (enable "Show Hidden Files")

### Step 3: Files to Upload (from 'out' folder)
- \`index.html\` (homepage)
- \`_next/\` (Next.js assets folder)
- \`404.html\` (error page)
- \`.htaccess\` (URL rewriting rules)
- All other generated files and folders

### Step 4: Test Your Site
- ✅ Visit: \`https://yourdomain.com\`
- ✅ Check that homepage loads correctly
- ✅ Verify HTTPS redirect works
- ✅ Test navigation between static pages
- ❌ Login will NOT work (static only)
- ❌ Database features will NOT work

## 🌟 STRONGLY RECOMMENDED: Use Vercel Instead

For your pharmacy management system to work properly with:
- ✅ User authentication and login
- ✅ Database connectivity
- ✅ Admin dashboard
- ✅ Prescription management
- ✅ Staff management
- ✅ Customer management
- ✅ Complaint system
- ✅ Payment processing
- ✅ All API endpoints

**Deploy to Vercel following the instructions above.**

## 🔧 Troubleshooting

### Common Issues:
1. **Pages don't load properly**: Check .htaccess file was uploaded
2. **Images not showing**: Verify all _next/ folder contents uploaded
3. **HTTPS not working**: Check GoDaddy SSL certificate settings
4. **404 errors**: Ensure .htaccess rewrite rules are working

### Need Help?
- Check \`DEPLOYMENT_GUIDE.md\` for Vercel instructions
- Contact support if you need help with full deployment

---

**Remember: This static version is for demonstration only. For full pharmacy management functionality, use Vercel deployment.**
`;

fs.writeFileSync('GODADDY_STATIC_DEPLOYMENT_GUIDE.md', deploymentGuide);
console.log('✅ Created comprehensive deployment guide');

console.log('');
console.log('🎉 GoDaddy Static Package Ready!');
console.log('');
console.log('📁 Files created:');
console.log('   - out/ (upload contents to public_html)');
console.log('   - GODADDY_STATIC_DEPLOYMENT_GUIDE.md (detailed guide)');
console.log('   - deployment-backup/ (your original files)');
console.log('');
console.log('⚠️  REMEMBER: This is STATIC DEMO ONLY!');
console.log('   For full functionality, use Vercel instead.');
console.log('');

// Step 9: Restore original files
for (const backup of pageBackups) {
  if (fs.existsSync(backup.backup)) {
    fs.renameSync(backup.backup, backup.original);
    console.log('✅ Restored ' + backup.original);
  }
}

if (fs.existsSync(apiBackupDir)) {
  fs.renameSync(apiBackupDir, apiDir);
  console.log('✅ Restored API routes');
}

for (const file of filesToBackup) {
  const backupPath = path.join(backupDir, path.basename(file));
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, file);
    console.log('✅ Restored ' + file);
  }
}

console.log('');
console.log('📖 NEXT STEPS:');
console.log('');
console.log('🌟 RECOMMENDED: Deploy to Vercel for full functionality');
console.log('   1. Go to vercel.com and sign up with GitHub');
console.log('   2. Import your pharmacy project');
console.log('   3. Point your GoDaddy domain to Vercel');
console.log('   4. Get full pharmacy management features');
console.log('');
console.log('📁 OR: Upload static demo to GoDaddy shared hosting');
console.log('   1. Read GODADDY_STATIC_DEPLOYMENT_GUIDE.md');
console.log('   2. Upload "out" folder contents to public_html');
console.log('   3. Test your static demo site');
console.log('');
console.log('🎯 VERCEL IS HIGHLY RECOMMENDED FOR FULL FEATURES!');
