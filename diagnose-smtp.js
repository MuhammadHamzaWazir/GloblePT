const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function diagnoseAndFixSMTP() {
    console.log('🔧 SMTP Configuration Diagnosis and Fix');
    console.log('='.repeat(50));
    
    try {
        // Check current SMTP configuration
        console.log('1️⃣ Checking current SMTP configuration...');
        const configResponse = await fetch(`${PRODUCTION_URL}/api/admin/smtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminKey: 'global-pharma-admin-2024',
                action: 'check-config'
            })
        });
        
        const configData = await configResponse.json();
        console.log('SMTP config status:', configResponse.status);
        console.log('SMTP config:', JSON.stringify(configData, null, 2));
        
        if (!configData.allConfigured) {
            console.log('\n❌ SMTP Configuration Incomplete!');
            console.log('Missing environment variables:', configData.missingVars);
            console.log('\n📝 TO FIX THIS:');
            console.log('1. Go to: https://vercel.com/[your-project]/settings/environment-variables');
            console.log('2. Add these environment variables:');
            console.log('');
            
            if (!configData.config.hasHost) {
                console.log('   SMTP_HOST = smtp.sendgrid.net');
            }
            if (!configData.config.hasPort) {
                console.log('   SMTP_PORT = 587');
            }
            if (!configData.config.hasUser) {
                console.log('   SMTP_USER = apikey');
            }
            if (!configData.config.hasPass) {
                console.log('   SMTP_PASS = [Your SendGrid API Key]');
            }
            if (!configData.config.hasFrom) {
                console.log('   SMTP_FROM = noreply@globalpharmatrading.co.uk');
            }
            
            console.log('\n3. Redeploy the application');
            console.log('\n💡 For SendGrid API Key:');
            console.log('   - Go to https://app.sendgrid.com/');
            console.log('   - Navigate to Settings > API Keys');
            console.log('   - Create a new API key with "Mail Send" permissions');
            
            return;
        }
        
        // Test SMTP connection
        console.log('\n2️⃣ Testing SMTP connection...');
        const testResponse = await fetch(`${PRODUCTION_URL}/api/admin/smtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminKey: 'global-pharma-admin-2024',
                action: 'test-smtp'
            })
        });
        
        const testData = await testResponse.json();
        console.log('SMTP test status:', testResponse.status);
        console.log('SMTP test result:', JSON.stringify(testData, null, 2));
        
        if (!testData.success) {
            console.log('\n❌ SMTP connection failed!');
            console.log('Error:', testData.error);
            return;
        }
        
        // Send test email
        console.log('\n3️⃣ Sending test email...');
        const emailResponse = await fetch(`${PRODUCTION_URL}/api/admin/smtp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminKey: 'global-pharma-admin-2024',
                action: 'send-test-email',
                to: 'mhamzawazir1996@gmail.com'
            })
        });
        
        const emailData = await emailResponse.json();
        console.log('Test email status:', emailResponse.status);
        console.log('Test email result:', JSON.stringify(emailData, null, 2));
        
        if (emailData.success) {
            console.log('\n✅ EMAIL SYSTEM IS WORKING!');
            console.log('📧 Check your inbox for the test email');
            
            // Now test the verification code
            console.log('\n4️⃣ Testing verification code sending...');
            const verifyResponse = await fetch(`${PRODUCTION_URL}/api/auth/send-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'mhamzawazir1996@gmail.com'
                })
            });
            
            const verifyData = await verifyResponse.json();
            console.log('Verification code status:', verifyResponse.status);
            console.log('Verification code result:', JSON.stringify(verifyData, null, 2));
            
            if (verifyData.emailSent) {
                console.log('\n🎉 SUCCESS! 2FA emails are now working!');
                console.log('📧 Check your inbox for the verification code');
            } else {
                console.log('\n⚠️ Verification code generation working, but email delivery may still have issues');
            }
            
        } else {
            console.log('\n❌ Test email failed!');
            console.log('Error:', emailData.error);
        }
        
    } catch (error) {
        console.error('❌ SMTP diagnosis failed:', error.message);
    }
}

diagnoseAndFixSMTP();
