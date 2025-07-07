const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function testAndFixEmail() {
    console.log('🔧 Testing and Fixing Email Configuration');
    console.log('='.repeat(50));
    
    try {
        // Test current email configuration
        console.log('1️⃣ Testing current email configuration...');
        const configResponse = await fetch(`${PRODUCTION_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'test-config'
            })
        });
        
        const configData = await configResponse.json();
        console.log('Current config status:', configResponse.status);
        console.log('Current config response:', JSON.stringify(configData, null, 2));
        
        // Try to send a test email
        console.log('\n2️⃣ Attempting to send test email...');
        const testEmailResponse = await fetch(`${PRODUCTION_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'send-test',
                to: 'mhamzawazir1996@gmail.com'
            })
        });
        
        const testEmailData = await testEmailResponse.json();
        console.log('Test email status:', testEmailResponse.status);
        console.log('Test email response:', JSON.stringify(testEmailData, null, 2));
        
        // Test verification code sending
        console.log('\n3️⃣ Testing verification code sending...');
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
        console.log('Verification code response:', JSON.stringify(verifyData, null, 2));
        
        console.log('\n' + '='.repeat(50));
        console.log('📋 DIAGNOSIS AND NEXT STEPS:');
        
        if (verifyData.emailSent === false) {
            console.log('❌ Email delivery is failing');
            console.log('🔧 SOLUTION: Update Vercel environment variables');
            console.log('');
            console.log('📝 Required environment variables in Vercel:');
            console.log('- SMTP_HOST=smtp.sendgrid.net');
            console.log('- SMTP_PORT=587');
            console.log('- SMTP_USER=apikey');
            console.log('- SMTP_PASS=[SendGrid API Key]');
            console.log('- SMTP_FROM=noreply@globalpharmatrading.co.uk');
            console.log('');
            console.log('🌐 Go to: https://vercel.com/[your-project]/settings/environment-variables');
        } else {
            console.log('✅ Email delivery is working!');
            console.log('📧 Check your inbox for the verification code');
        }
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
    }
}

testAndFixEmail();
