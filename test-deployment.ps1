Write-Host "POST-DEPLOYMENT TEST" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

Write-Host "Testing site accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://globalpharmatrading.co.uk" -Method GET
    Write-Host "Site Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Site test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Testing logout endpoint..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "https://globalpharmatrading.co.uk/api/auth/logout" -Method POST
    Write-Host "Logout endpoint working: $($logoutResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "Logout test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "MANUAL TESTING REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Login with: mhamzawazir1996@gmail.com / Test123!" -ForegroundColor White
Write-Host "2. Complete 2FA verification" -ForegroundColor White
Write-Host "3. Check cookies in browser dev tools" -ForegroundColor White
Write-Host "4. Click logout and verify ALL cookies cleared" -ForegroundColor White
Write-Host "5. Confirm cannot access dashboard after logout" -ForegroundColor White
