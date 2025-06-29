#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌐 GoDaddy Static Hosting Deployment (Minimal)');
console.log('=' .repeat(60));

console.log('⚠️  IMPORTANT: This creates a MINIMAL STATIC version!');
console.log('   For full functionality, use Vercel instead.');
console.log('');

// Step 1: Backup original files
const filesToBackup = [
  'next.config.ts',
  'src/app/layout.tsx'
];

for (const file of filesToBackup) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, file + '.backup');
    console.log('✅ Backed up ' + file);
  }
}

// Step 2: Use static export config
fs.copyFileSync('next.config.godaddy-static.ts', 'next.config.ts');
console.log('✅ Applied GoDaddy static export configuration');

// Step 3: Create MINIMAL static-friendly layout (no dependencies)
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

// Step 4: Temporarily remove API routes completely
const apiDir = 'src/app/api';
const tempDir = path.join(__dirname, '..', 'temp-api-backup');

if (fs.existsSync(apiDir)) {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.renameSync(apiDir, tempDir);
  console.log('✅ Temporarily removed API routes');
}

// Step 5: Remove pages that require server-side features
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

const tempPageBackups = [];
for (const pagePath of problematicPages) {
  if (fs.existsSync(pagePath)) {
    const backupPath = pagePath + '-backup';
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
    fs.renameSync(pagePath, backupPath);
    tempPageBackups.push({ original: pagePath, backup: backupPath });
    console.log('✅ Temporarily removed ' + pagePath);
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
  for (const backup of tempPageBackups) {
    if (fs.existsSync(backup.backup)) {
      fs.renameSync(backup.backup, backup.original);
    }
  }
  
  if (fs.existsSync(tempDir)) {
    fs.renameSync(tempDir, apiDir);
  }
  
  for (const file of filesToBackup) {
    if (fs.existsSync(file + '.backup')) {
      fs.copyFileSync(file + '.backup', file);
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

// Step 8: Create upload instructions
const uploadInstructions = `📦 GoDaddy Static Hosting Upload Instructions
${'=' .repeat(50)}

⚠️  CRITICAL LIMITATIONS OF STATIC VERSION:
- ❌ No login/authentication system
- ❌ No database connectivity
- ❌ No API endpoints  
- ❌ No server-side features
- ❌ No admin dashboard functionality
- ❌ No prescription management
- ❌ No user management
- ✅ Static pages and content ONLY

This is essentially a DEMO/PRESENTATION version only!

🎯 RECOMMENDED ALTERNATIVES FOR FULL FUNCTIONALITY:
1. 🌟 Vercel deployment (FREE, full functionality) - HIGHLY RECOMMENDED
2. GoDaddy VPS with Node.js support (paid, full functionality)
3. Use this static version only for demo/presentation purposes

📁 UPLOAD STEPS FOR STATIC VERSION:
1. Log into your GoDaddy cPanel (https://sso.godaddy.com/)
2. Go to File Manager in the Files section
3. Navigate to public_html directory
4. Delete any existing files (backup first if needed!)
5. Upload ALL contents of the 'out' folder to public_html
6. Ensure .htaccess file is uploaded (enable "Show Hidden Files")
7. Visit your domain to test

FILES TO UPLOAD (from 'out' folder):
- index.html (homepage)
- _next/ (Next.js assets folder)
- 404.html (error page)
- .htaccess (URL rewriting rules)
- All other generated files and folders

TESTING CHECKLIST:
- ✅ Visit: https://yourdomain.com
- ✅ Check that homepage loads correctly
- ✅ Verify HTTPS redirect works
- ✅ Test navigation between static pages
- ❌ Login will NOT work (static only)
- ❌ Database features will NOT work

🚀 FOR FULL PHARMACY MANAGEMENT FUNCTIONALITY:
Deploy to Vercel instead (RECOMMENDED):
1. Push your code to GitHub (already done)
2. Go to vercel.com and sign up with GitHub
3. Import your pharmacy project
4. Deploy (automatic)
5. Point your GoDaddy domain to Vercel:
   - In GoDaddy DNS: Add CNAME record: www -> your-app.vercel.app
   - In GoDaddy DNS: Add A record: @ -> 76.76.19.61
   - In Vercel: Add your custom domain
6. Set up environment variables in Vercel
7. Get FULL functionality including login, database, APIs, etc.

Need help with Vercel deployment? Check DEPLOYMENT_GUIDE.md
`;

fs.writeFileSync('UPLOAD_INSTRUCTIONS.txt', uploadInstructions);
console.log('✅ Created upload instructions');

console.log('');
console.log('🎉 GoDaddy Static Package Ready!');
console.log('');
console.log('📁 Files created:');
console.log('   - out/ (upload contents to public_html)');
console.log('   - UPLOAD_INSTRUCTIONS.txt (detailed guide)');
console.log('');
console.log('⚠️  REMEMBER: This is STATIC ONLY - no backend functionality!');
console.log('   For full pharmacy management features, use Vercel instead.');
console.log('');

// Step 9: Restore original files
for (const backup of tempPageBackups) {
  if (fs.existsSync(backup.backup)) {
    fs.renameSync(backup.backup, backup.original);
    console.log('✅ Restored ' + backup.original);
  }
}

if (fs.existsSync(tempDir)) {
  fs.renameSync(tempDir, apiDir);
  console.log('✅ Restored API routes');
}

for (const file of filesToBackup) {
  if (fs.existsSync(file + '.backup')) {
    fs.copyFileSync(file + '.backup', file);
    fs.unlinkSync(file + '.backup');
    console.log('✅ Restored ' + file);
  }
}

console.log('');
console.log('📖 NEXT STEPS:');
console.log('1. Read UPLOAD_INSTRUCTIONS.txt carefully');
console.log('2. Upload "out" folder contents to GoDaddy public_html');
console.log('3. Test your static site');
console.log('4. 🌟 STRONGLY CONSIDER Vercel for full functionality');
console.log('');
console.log('🎯 VERCEL DEPLOYMENT IS RECOMMENDED FOR FULL FEATURES!');
