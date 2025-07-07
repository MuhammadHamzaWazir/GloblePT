const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function testProductionLogin() {
    console.log('🧪 Testing production login with 2FA...');
    
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'mhamzawazir1996@gmail.com',
                password: 'Test123!'
            })
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (data.requiresVerification) {
            console.log('✅ 2FA modal should appear! User needs to verify with code.');
            console.log('✅ sessionId:', data.sessionId);
        } else if (data.success) {
            console.log('❌ User logged in directly without 2FA - this should not happen');
        } else {
            console.log('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testProductionLogin();
