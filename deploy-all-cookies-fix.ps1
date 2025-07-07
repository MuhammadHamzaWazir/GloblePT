# PowerShell Deployment Script for Global Pharma Trading
# ALL COOKIES LOGOUT FIX - Automated Deployment
# Date: July 7, 2025

param(
    [string]$GoDaddyFTPHost = "",
    [string]$GoDaddyUsername = "",
    [string]$GoDaddyPassword = "",
    [switch]$PrepareOnly = $false
)

Write-Host "🚀 GLOBAL PHARMA TRADING - ALL COOKIES LOGOUT FIX DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Step 1: Verify deployment package exists
$deploymentPackage = "clear-all-cookies-logout-fix.zip"
if (-not (Test-Path $deploymentPackage)) {
    Write-Host "❌ Deployment package not found: $deploymentPackage" -ForegroundColor Red
    Write-Host "Building the package first..." -ForegroundColor Yellow
    
    # Build the project
    Write-Host "📦 Building Next.js project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    # Create deployment package
    Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
    if (Test-Path $deploymentPackage) {
        Remove-Item $deploymentPackage -Force
    }
    Compress-Archive -Path '.next', 'public', 'package.json', 'next.config.ts', 'middleware.ts' -DestinationPath $deploymentPackage -Force
    Write-Host "✅ Deployment package created: $deploymentPackage" -ForegroundColor Green
}

# Get package info
$packageInfo = Get-Item $deploymentPackage
Write-Host "📦 Package Details:" -ForegroundColor Yellow
Write-Host "   Name: $($packageInfo.Name)" -ForegroundColor White
Write-Host "   Size: $([math]::Round($packageInfo.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host "   Created: $($packageInfo.LastWriteTime)" -ForegroundColor White

# Step 2: Create backup script
$backupScript = @"
# Backup current GoDaddy deployment
Write-Host "💾 Creating backup of current deployment..." -ForegroundColor Yellow

# Create backup folder with timestamp
`$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
`$backupFolder = "godaddy-backup-`$timestamp"
New-Item -ItemType Directory -Path `$backupFolder -Force

Write-Host "✅ Backup folder created: `$backupFolder" -ForegroundColor Green
Write-Host "📌 IMPORTANT: Download current public_html contents manually from GoDaddy File Manager" -ForegroundColor Cyan
Write-Host "   Save them in the `$backupFolder folder before proceeding" -ForegroundColor Cyan
"@

Set-Content -Path "create-backup.ps1" -Value $backupScript
Write-Host "✅ Backup script created: create-backup.ps1" -ForegroundColor Green

# Step 3: Create GoDaddy upload instructions
$uploadInstructions = @"
# 🚀 GODADDY UPLOAD INSTRUCTIONS - ALL COOKIES LOGOUT FIX
# ========================================================

## MANUAL UPLOAD (Recommended for security)

### Step 1: Backup Current Site
1. Login to GoDaddy Web Hosting → Manage → File Manager
2. Select all files in public_html
3. Download as backup zip
4. Save backup with timestamp

### Step 2: Upload Package
1. In GoDaddy File Manager, navigate to public_html
2. Click "Upload" button
3. Select: $deploymentPackage ($('{0:N2}' -f ($packageInfo.Length / 1MB)) MB)
4. Wait for upload to complete

### Step 3: Extract Package
1. Right-click uploaded zip file
2. Select "Extract"
3. Extract to temporary folder
4. Move contents from temp to public_html (replace existing)
5. Delete zip and temp folder

### Step 4: Verify Environment
1. Check .env.production file exists
2. Verify database connection strings
3. Test site loads: https://globalpharmatrading.co.uk

## IMMEDIATE TESTING REQUIRED

### Login Test:
- URL: https://globalpharmatrading.co.uk/auth/login
- Email: mhamzawazir1996@gmail.com
- Password: Test123!
- Complete 2FA verification
- Verify pharmacy_auth cookie appears in browser dev tools

### Logout Test:
- Click logout in dashboard sidebar
- IMMEDIATELY check browser dev tools
- Verify ALL cookies are cleared (not just pharmacy_auth)
- Confirm redirect to login page
- Test cannot access /dashboard without re-login

## ENHANCED FEATURES DEPLOYED:
✅ 13 different cookie types cleared automatically
✅ 91 total deletion attempts per logout (13 cookies × 7 strategies)
✅ Production domain-specific handling for globalpharmatrading.co.uk
✅ Client-side verification and comprehensive session cleanup
✅ Universal browser compatibility (Chrome, Firefox, Edge, Safari)

## SUCCESS CRITERIA:
- All cookies cleared from browser after logout
- Clean redirect to login page  
- Cannot access protected routes after logout
- No console errors during logout process
- Same behavior across all browsers

Package ready for deployment: $deploymentPackage
Deployment date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

Set-Content -Path "GODADDY_UPLOAD_INSTRUCTIONS.md" -Value $uploadInstructions
Write-Host "✅ Upload instructions created: GODADDY_UPLOAD_INSTRUCTIONS.md" -ForegroundColor Green

# Step 4: Create post-deployment test script
$testScript = @"
# Post-Deployment Testing Script
Write-Host "🧪 POST-DEPLOYMENT TESTING" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Test logout endpoint
Write-Host "🔍 Testing logout endpoint..." -ForegroundColor Yellow
try {
    `$response = Invoke-RestMethod -Uri "https://globalpharmatrading.co.uk/api/auth/logout" -Method POST -Headers @{"Content-Type"="application/json"}
    Write-Host "✅ Logout endpoint response:" -ForegroundColor Green
    `$response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Logout endpoint test failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# Test site accessibility
Write-Host "🔍 Testing site accessibility..." -ForegroundColor Yellow
try {
    `$siteResponse = Invoke-WebRequest -Uri "https://globalpharmatrading.co.uk" -Method GET
    Write-Host "✅ Site accessible - Status: `$(`$siteResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Site accessibility test failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# Test login page
Write-Host "🔍 Testing login page..." -ForegroundColor Yellow
try {
    `$loginResponse = Invoke-WebRequest -Uri "https://globalpharmatrading.co.uk/auth/login" -Method GET
    Write-Host "✅ Login page accessible - Status: `$(`$loginResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Login page test failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚨 MANUAL TESTING REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Login with: mhamzawazir1996@gmail.com / Test123!" -ForegroundColor White
Write-Host "2. Complete 2FA verification" -ForegroundColor White
Write-Host "3. Check pharmacy_auth cookie in browser dev tools" -ForegroundColor White
Write-Host "4. Click logout and verify ALL cookies are cleared" -ForegroundColor White
Write-Host "5. Confirm cannot access dashboard after logout" -ForegroundColor White
"@

Set-Content -Path "test-deployment.ps1" -Value $testScript
Write-Host "✅ Test script created: test-deployment.ps1" -ForegroundColor Green

# Step 5: Create summary report
Write-Host ""
Write-Host "📊 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Package: $deploymentPackage ($('{0:N2}' -f ($packageInfo.Length / 1MB)) MB)" -ForegroundColor White
Write-Host "Build: Latest with ALL cookies clearing functionality" -ForegroundColor White
Write-Host "Features: 13 cookie types × 7 deletion strategies = 91 clearing attempts" -ForegroundColor White
Write-Host "Target: https://globalpharmatrading.co.uk" -ForegroundColor White
Write-Host "Test User: mhamzawazir1996@gmail.com / Test123!" -ForegroundColor White

# Step 6: Show next steps
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Review: GODADDY_UPLOAD_INSTRUCTIONS.md" -ForegroundColor White
Write-Host "2. Backup: Run create-backup.ps1 or download manually" -ForegroundColor White
Write-Host "3. Upload: Follow manual upload instructions" -ForegroundColor White
Write-Host "4. Test: Run test-deployment.ps1 after upload" -ForegroundColor White
Write-Host "5. Verify: Manual testing with real user credentials" -ForegroundColor White

Write-Host ""
Write-Host "🎉 DEPLOYMENT PREPARATION COMPLETE!" -ForegroundColor Green
Write-Host "Ready to upload $deploymentPackage to GoDaddy" -ForegroundColor Green
Write-Host ""
