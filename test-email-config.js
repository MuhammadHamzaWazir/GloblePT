const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function testEmailConfig() {
    console.log('🔧 Testing Email Configuration');
    console.log('='.repeat(40));
    
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'test-config'
            })
        });
        
        const data = await response.json();
        console.log('Email config status:', response.status);
        console.log('Email config response:', data);
        
        if (data.message && data.message.includes('SMTP_HOST is missing')) {
            console.log('\n❌ DIAGNOSIS: SMTP environment variables not set in production');
            console.log('📝 SOLUTION: Set these in Vercel environment variables:');
            console.log('- SMTP_HOST=smtp.sendgrid.net');
            console.log('- SMTP_PORT=587');
            console.log('- SMTP_USER=apikey');
            console.log('- SMTP_PASS=[your SendGrid API key]');
            console.log('- SMTP_FROM=noreply@globalpharmatrading.co.uk');
        }
        
    } catch (error) {
        console.error('❌ Config test failed:', error.message);
    }
}

testEmailConfig();
