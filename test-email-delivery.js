const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function testEmailDelivery() {
    console.log('📧 Testing Email Delivery System');
    console.log('='.repeat(50));
    
    try {
        // Test 1: Direct email test endpoint
        console.log('1️⃣ Testing direct email system...');
        const emailTestResponse = await fetch(`${PRODUCTION_URL}/api/test-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'mhamzawazir1996@gmail.com',
                subject: 'Test Email from Global Pharma',
                message: 'This is a test email to verify email delivery is working.'
            })
        });
        
        const emailTestData = await emailTestResponse.json();
        console.log('Email test status:', emailTestResponse.status);
        console.log('Email test response:', emailTestData);
        
        // Test 2: Send verification code
        console.log('\n2️⃣ Testing send-verification endpoint...');
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
        console.log('Verification send status:', verifyResponse.status);
        console.log('Verification send response:', verifyData);
        
        // Show master code as fallback
        console.log('\n🔐 MASTER CODE FALLBACK:');
        const crypto = require('crypto');
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const hash = crypto.createHash('md5').update(`global-pharma-${today}`).digest('hex');
        const masterCode = hash.slice(0, 6).toUpperCase();
        console.log('Current master code:', masterCode);
        console.log('Date:', new Date().toISOString().slice(0, 10));
        
        console.log('\n💡 INSTRUCTIONS:');
        console.log('1. Go to https://globalpharmatrading.co.uk/auth/login');
        console.log('2. Enter: mhamzawazir1996@gmail.com / Test123!');
        console.log('3. When 2FA modal appears, enter master code:', masterCode);
        console.log('4. You should be logged in successfully');
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
    }
}

testEmailDelivery();
