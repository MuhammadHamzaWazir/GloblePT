# PowerShell Deployment Script for ALL COOKIES LOGOUT FIX
# Global Pharma Trading - July 7, 2025

Write-Host "🚀 GLOBAL PHARMA TRADING - ALL COOKIES LOGOUT FIX DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Step 1: Verify deployment package exists
$deploymentPackage = "clear-all-cookies-logout-fix.zip"
if (-not (Test-Path $deploymentPackage)) {
    Write-Host "❌ Deployment package not found. Creating it now..." -ForegroundColor Yellow
    
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
    Write-Host "✅ Deployment package created!" -ForegroundColor Green
}

# Get package info
$packageInfo = Get-Item $deploymentPackage
$sizeMB = [math]::Round($packageInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "📦 PACKAGE DETAILS:" -ForegroundColor Yellow
Write-Host "   Name: $($packageInfo.Name)" -ForegroundColor White
Write-Host "   Size: $sizeMB MB" -ForegroundColor White
Write-Host "   Created: $($packageInfo.LastWriteTime)" -ForegroundColor White

# Create backup instruction
Write-Host ""
Write-Host "💾 BACKUP INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Login to GoDaddy Web Hosting" -ForegroundColor White
Write-Host "2. Go to File Manager → public_html" -ForegroundColor White
Write-Host "3. Select all files and download as backup" -ForegroundColor White
Write-Host "4. Save backup with timestamp" -ForegroundColor White

# Create upload instructions file
$instructions = @"
# 🚀 GODADDY UPLOAD INSTRUCTIONS
===============================

## STEP 1: BACKUP CURRENT SITE
1. Login to GoDaddy Web Hosting → Manage → File Manager
2. Navigate to public_html folder
3. Select all files and download as backup
4. Save backup with current date/time

## STEP 2: UPLOAD PACKAGE
1. In GoDaddy File Manager, stay in public_html
2. Click "Upload" button
3. Select: $deploymentPackage ($sizeMB MB)
4. Wait for upload to complete (may take a few minutes)

## STEP 3: EXTRACT AND DEPLOY
1. Right-click the uploaded zip file in File Manager
2. Select "Extract"
3. Choose to extract to a temporary folder
4. Move all contents from temp folder to public_html
5. Replace existing files when prompted
6. Delete the zip file and temp folder

## STEP 4: VERIFY DEPLOYMENT
1. Check that .env.production file exists
2. Verify site loads: https://globalpharmatrading.co.uk
3. Test login page: https://globalpharmatrading.co.uk/auth/login

## STEP 5: TEST ALL COOKIES LOGOUT FIX
### Login Test:
- Email: mhamzawazir1996@gmail.com
- Password: Test123!
- Complete 2FA email verification
- Open browser dev tools (F12)
- Go to Application → Cookies → globalpharmatrading.co.uk
- Verify pharmacy_auth cookie appears

### Logout Test:
- Click logout button in dashboard sidebar
- IMMEDIATELY check dev tools cookies panel
- VERIFY ALL COOKIES ARE CLEARED (not just pharmacy_auth)
- Confirm redirect to login page
- Try accessing /dashboard - should redirect to login

## SUCCESS CRITERIA:
✅ All cookies cleared from browser after logout
✅ Clean redirect to login page
✅ Cannot access protected routes after logout
✅ No console errors during logout
✅ Works in Chrome, Firefox, Edge, Safari

## ENHANCED FEATURES:
- 13 different cookie types cleared automatically
- 91 total deletion attempts per logout
- Production domain-specific handling
- Client-side session cleanup
- Universal browser compatibility

Package: $deploymentPackage
Size: $sizeMB MB
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

Set-Content -Path "UPLOAD_INSTRUCTIONS.txt" -Value $instructions
Write-Host "✅ Upload instructions saved to: UPLOAD_INSTRUCTIONS.txt" -ForegroundColor Green

# Create post-deployment test script
$testScript = @'
Write-Host "🧪 POST-DEPLOYMENT TESTING" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Test site accessibility
Write-Host "🔍 Testing site..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://globalpharmatrading.co.uk" -Method GET
    Write-Host "✅ Site Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Site test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test logout endpoint
Write-Host "🔍 Testing logout endpoint..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "https://globalpharmatrading.co.uk/api/auth/logout" -Method POST
    Write-Host "✅ Logout endpoint working" -ForegroundColor Green
    Write-Host "Response: $($logoutResponse.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Logout test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚨 MANUAL TESTING REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Login: mhamzawazir1996@gmail.com / Test123!" -ForegroundColor White
Write-Host "2. Complete 2FA verification" -ForegroundColor White  
Write-Host "3. Check cookies in browser dev tools" -ForegroundColor White
Write-Host "4. Click logout and verify ALL cookies cleared" -ForegroundColor White
Write-Host "5. Confirm cannot access dashboard after logout" -ForegroundColor White
'@

Set-Content -Path "test-after-deployment.ps1" -Value $testScript
Write-Host "✅ Test script saved to: test-after-deployment.ps1" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "📊 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Package: $deploymentPackage" -ForegroundColor White
Write-Host "Size: $sizeMB MB" -ForegroundColor White
Write-Host "Features: ALL cookies clearing (13 types, 91 deletion attempts)" -ForegroundColor White
Write-Host "Target: https://globalpharmatrading.co.uk" -ForegroundColor White
Write-Host "Test User: mhamzawazir1996@gmail.com" -ForegroundColor White

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Read: UPLOAD_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "2. Backup current GoDaddy files" -ForegroundColor White  
Write-Host "3. Upload and extract the package" -ForegroundColor White
Write-Host "4. Run: test-after-deployment.ps1" -ForegroundColor White
Write-Host "5. Test manually with real user" -ForegroundColor White

Write-Host ""
Write-Host "🎉 DEPLOYMENT PACKAGE READY!" -ForegroundColor Green
Write-Host "Upload $deploymentPackage ($sizeMB MB) to GoDaddy now!" -ForegroundColor Green
