@echo off
echo ======================================
echo   SMTP Configuration for Production
echo ======================================
echo.
echo I'll help you set up email delivery for your pharmacy app.
echo.
echo OPTION 1: SendGrid (Recommended - Free 100 emails/day)
echo OPTION 2: Gmail SMTP (Using your existing Gmail)
echo.
set /p choice="Which option would you like? (1 or 2): "

if "%choice%"=="1" goto sendgrid
if "%choice%"=="2" goto gmail
goto invalid

:sendgrid
echo.
echo ==========================================
echo   SENDGRID SETUP
echo ==========================================
echo.
echo STEP 1: Create SendGrid Account
echo 1. Go to https://sendgrid.com/
echo 2. Sign up for FREE account
echo 3. Verify your email
echo.
echo STEP 2: Create API Key
echo 1. Go to Settings → API Keys
echo 2. Click "Create API Key" 
echo 3. Name: "Global Pharma SMTP"
echo 4. Choose "Restricted Access"
echo 5. Grant "Mail Send" permission
echo 6. Copy the API key
echo.
set /p apikey="Paste your SendGrid API key here: "
echo.
echo Setting up environment variables...
echo.

vercel env add SMTP_HOST --value=smtp.sendgrid.net
vercel env add SMTP_PORT --value=587
vercel env add SMTP_USER --value=apikey
vercel env add SMTP_PASS --value=%apikey%
vercel env add SMTP_FROM --value="Global Pharma Trading <noreply@globalpharmatrading.co.uk>"

echo.
echo ✅ SendGrid configuration complete!
goto deploy

:gmail
echo.
echo ==========================================
echo   GMAIL SMTP SETUP  
echo ==========================================
echo.
echo STEP 1: Prepare Gmail Account
echo 1. Enable 2-Factor Authentication on Gmail
echo 2. Go to Account Settings → Security
echo 3. Generate "App Password" for "Mail"
echo 4. Copy the 16-character app password
echo.
set /p email="Enter your Gmail address: "
set /p apppass="Enter your Gmail app password: "
echo.
echo Setting up environment variables...
echo.

vercel env add SMTP_HOST --value=smtp.gmail.com
vercel env add SMTP_PORT --value=587
vercel env add SMTP_USER --value=%email%
vercel env add SMTP_PASS --value=%apppass%
vercel env add SMTP_FROM --value="Global Pharma Trading <%email%>"

echo.
echo ✅ Gmail configuration complete!
goto deploy

:deploy
echo.
echo ==========================================
echo   DEPLOYING TO PRODUCTION
echo ==========================================
echo.
echo Deploying with new email configuration...
vercel --prod

echo.
echo ==========================================
echo   TESTING EMAIL DELIVERY
echo ==========================================
echo.
echo Testing email system...
node test-specific-user-email.js

echo.
echo ✅ Setup complete! 
echo Your pharmacy app now has email delivery configured.
echo.
echo Test it by:
echo 1. Going to https://globalpharmatrading.co.uk/auth/login
echo 2. Trying to log in with 2FA enabled
echo 3. Check if you receive the verification email
echo.
pause
goto end

:invalid
echo Invalid choice. Please run the script again and choose 1 or 2.
pause

:end
