#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🌐 GoDaddy Static Hosting Deployment Preparation');
console.log('=' .repeat(60));

console.log('⚠️  IMPORTANT: This removes all API functionality for static hosting!');
console.log('   For full functionality, use Vercel or GoDaddy VPS with Node.js');
console.log('');

// Step 1: Backup original config
if (fs.existsSync('next.config.ts')) {
  fs.copyFileSync('next.config.ts', 'next.config.backup.ts');
  console.log('✅ Backed up original next.config.ts');
}

// Step 2: Use static export config
fs.copyFileSync('next.config.godaddy-static.ts', 'next.config.ts');
console.log('✅ Applied GoDaddy static export configuration');

// Step 3: Temporarily remove API routes completely
const apiDir = 'src/app/api';
const tempDir = path.join(__dirname, '..', 'temp-api-backup');

if (fs.existsSync(apiDir)) {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.renameSync(apiDir, tempDir);
  console.log('✅ Temporarily removed API routes (functionality disabled for static hosting)');
}

// Step 4: Build the static export
try {
  console.log('🔨 Building static export...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Static build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore API routes and config
  if (fs.existsSync(tempDir)) {
    fs.renameSync(tempDir, apiDir);
  }
  if (fs.existsSync('next.config.backup.ts')) {
    fs.copyFileSync('next.config.backup.ts', 'next.config.ts');
  }
  process.exit(1);
}

// Step 5: Create .htaccess for GoDaddy
const htaccess = `RewriteEngine On

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
ExpiresByType application/json "access plus 0 seconds"
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

fs.writeFileSync('out/.htaccess', htaccess);
console.log('✅ Created .htaccess file for GoDaddy');

// Step 6: Create upload instructions
const uploadInstructions = `📦 GoDaddy Static Hosting Upload Instructions
${'=' .repeat(50)}

IMPORTANT: This is a STATIC VERSION with limited functionality:
- ❌ No login/authentication
- ❌ No database connectivity  
- ❌ No API endpoints
- ❌ No server-side features
- ✅ Static pages and content only

For full functionality, consider:
1. GoDaddy VPS with Node.js support
2. Vercel deployment (recommended)

UPLOAD STEPS:
1. Log into your GoDaddy cPanel
2. Go to File Manager
3. Navigate to public_html directory
4. Delete any existing files (backup first!)
5. Upload ALL contents of the 'out' folder to public_html
6. Ensure .htaccess file is uploaded
7. Visit your domain to test

FILES TO UPLOAD (from 'out' folder):
- index.html (main page)
- _next/ (Next.js assets)
- 404.html (error page)
- .htaccess (URL rewriting)
- All other generated files

TESTING:
- Visit: https://yourdomain.com
- Check that pages load correctly
- Verify HTTPS redirect works
- Test navigation between pages

NOTE: Login and database features will not work in static mode.
For full pharmacy management features, use Vercel deployment instead.

Need help? Check GODADDY_DEPLOYMENT_GUIDE.md for alternatives.
`;

fs.writeFileSync('UPLOAD_INSTRUCTIONS.txt', uploadInstructions);
console.log('✅ Created upload instructions');

// Step 7: Generate SQL schema for manual database setup
try {
  console.log('🗄️  Generating database schema...');
  execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > database-schema.sql', { stdio: 'inherit' });
  console.log('✅ Database schema exported to database-schema.sql');
} catch (error) {
  console.log('⚠️  Schema generation skipped (not critical for static hosting)');
}

console.log('');
console.log('🎉 GoDaddy Static Deployment Package Ready!');
console.log('');
console.log('📁 Files created:');
console.log('   - out/ (upload this folder\'s contents to public_html)');
console.log('   - UPLOAD_INSTRUCTIONS.txt (detailed upload guide)');
console.log('   - database-schema.sql (if needed later)');
console.log('');
console.log('⚠️  REMEMBER: This is a static version with NO backend functionality!');
console.log('   For full features, consider Vercel deployment instead.');
console.log('');

// Restore original configuration
if (fs.existsSync(tempDir)) {
  fs.renameSync(tempDir, apiDir);
  console.log('✅ Restored API routes');
}

if (fs.existsSync('next.config.backup.ts')) {
  fs.copyFileSync('next.config.backup.ts', 'next.config.ts');
  fs.unlinkSync('next.config.backup.ts');
  console.log('✅ Restored original configuration');
}

console.log('');
console.log('📖 Next steps:');
console.log('1. Read UPLOAD_INSTRUCTIONS.txt');
console.log('2. Upload contents of "out" folder to GoDaddy public_html');
console.log('3. Test your static site');
console.log('4. Consider Vercel for full functionality');
