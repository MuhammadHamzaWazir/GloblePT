#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Logout Fixes to Production');
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

async function createProductionFiles() {
  console.log('📝 Creating production deployment files...');
  
  // Create .htaccess for proper Next.js deployment
  const htaccess = `RewriteEngine On

# Handle Next.js API routes
RewriteRule ^api/(.*)$ /api/$1 [L]

# Handle Next.js pages
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1.html [L,QSA]

# Security headers for cookies
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cookie security
Header always edit Set-Cookie (.*) "$1; HttpOnly; Secure; SameSite=Lax"

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`;

  fs.writeFileSync('.htaccess', htaccess);
  console.log('✅ .htaccess file created for production');
  
  // Create deployment info
  const deployInfo = {
    deploymentDate: new Date().toISOString(),
    version: '1.0.0-logout-fix',
    changes: [
      'Fixed logout cookie clearing issues',
      'Updated logout API to match login cookie properties exactly',
      'Improved cookie deletion headers',
      'Enhanced cross-browser compatibility'
    ],
    apiRoutes: [
      '/api/auth/login',
      '/api/auth/logout', 
      '/api/auth/me'
    ]
  };
  
  fs.writeFileSync('deployment-info.json', JSON.stringify(deployInfo, null, 2));
  console.log('✅ Deployment info created');
}

async function packageForUpload() {
  console.log('📦 Creating deployment package...');
  
  try {
    // Create deployment directory using Node.js
    if (fs.existsSync('deployment-package')) {
      console.log('🔄 Removing old deployment package...');
      fs.rmSync('deployment-package', { recursive: true, force: true });
      console.log('✅ Old deployment package removed');
    }
    fs.mkdirSync('deployment-package');
    
    // Copy essential files using Node.js
    const filesToCopy = [
      { src: '.next', isDir: true },
      { src: 'public', isDir: true },
      { src: 'package.json', isDir: false },
      { src: '.htaccess', isDir: false },
      { src: 'deployment-info.json', isDir: false }
    ];
    
    for (const file of filesToCopy) {
      if (fs.existsSync(file.src)) {
        console.log(`🔄 Copying ${file.src}...`);
        const destPath = path.join('deployment-package', path.basename(file.src));
        
        if (file.isDir) {
          copyDir(file.src, destPath);
        } else {
          fs.copyFileSync(file.src, destPath);
        }
        console.log(`✅ ${file.src} copied`);
      }
    }
    
    console.log('✅ Deployment package created in deployment-package/');
    
  } catch (error) {
    console.error('❌ Error creating deployment package:', error);
    throw error;
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function createDeploymentInstructions() {
  const instructions = `
# 🚀 PRODUCTION DEPLOYMENT INSTRUCTIONS

## Logout Fix Deployment - ${new Date().toISOString()}

### Files to Upload to GoDaddy Hosting:

1. **Upload the entire contents of deployment-package/ to your public_html directory**
2. **Ensure the following critical files are in place:**
   - .htaccess (for proper routing and security)
   - .next/ folder (contains the built application)
   - public/ folder (static assets)
   - package.json (dependencies info)

### Critical API Routes Updated:
- ✅ /api/auth/logout - Fixed cookie clearing
- ✅ /api/auth/login - Consistent cookie setting  
- ✅ /api/auth/me - Authentication verification

### Testing After Deployment:

1. **Login Test:**
   - Go to https://globalpharmatrading.co.uk/auth/login
   - Login with valid credentials
   - Verify login works and user is authenticated

2. **Logout Test:**
   - Click logout button or go to logout endpoint
   - Verify user is redirected to login page
   - Try to access protected pages - should be redirected to login
   - Check browser DevTools → Application → Cookies
   - Verify pharmacy_auth cookie is deleted

3. **Automated Test:**
   \`\`\`bash
   node test-production-logout.js
   \`\`\`

### Cookie Fixes Applied:
- ✅ Logout API now matches login cookie properties exactly
- ✅ Proper HttpOnly, Secure, SameSite attributes
- ✅ Correct expiration headers for cookie deletion
- ✅ Cross-browser compatibility improvements

### If Issues Persist:
1. Clear browser cache and cookies
2. Check browser DevTools for any JavaScript errors
3. Verify .htaccess file is properly uploaded
4. Check that API routes are accessible
5. Run the test scripts to verify functionality

### Support:
- Local test: node test-local-logout-new.js
- Production test: node test-production-logout.js
- Browser test: Open logout-test.html

---
Deployment completed: ${new Date().toLocaleString()}
`;

  fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', instructions);
  console.log('✅ Deployment instructions created');
}

async function deployLogoutFixes() {
  try {
    console.log('🎯 Starting logout fixes deployment...\n');
    
    // Verify build exists
    if (!fs.existsSync('.next')) {
      throw new Error('No build found. Please run "npm run build" first.');
    }
    
    // Create production files
    await createProductionFiles();
    
    // Package for upload
    await packageForUpload();
    
    // Create instructions
    await createDeploymentInstructions();
    
    console.log('\n🎉 DEPLOYMENT PREPARATION COMPLETE!');
    console.log('=' .repeat(50));
    console.log('✅ Build verified and ready');
    console.log('✅ Production files created');
    console.log('✅ Deployment package ready');
    console.log('✅ Instructions generated');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Upload contents of deployment-package/ to your GoDaddy public_html directory');
    console.log('2. Follow instructions in DEPLOYMENT_INSTRUCTIONS.md');
    console.log('3. Test logout functionality using the provided test scripts');
    
    console.log('\n🧪 TESTING:');
    console.log('- Run: node test-production-logout.js');
    console.log('- Open: logout-test.html in browser');
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT PREPARATION FAILED:', error.message);
    process.exit(1);
  }
}

deployLogoutFixes();
