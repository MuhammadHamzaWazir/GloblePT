// Simple test to check if the verification system is working
async function testVerificationSystem() {
    console.log('🧪 Testing Email Verification System...\n');
    
    const testEmail = 'test@example.com';
    const baseUrl = 'https://globalpharmatrading.co.uk';
    
    try {
        // Test 1: Send verification code
        console.log('📧 Testing send verification...');
        const sendResponse = await fetch(`${baseUrl}/api/auth/send-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: testEmail })
        });
        
        const sendResult = await sendResponse.json();
        console.log(`Status: ${sendResponse.status}`);
        console.log(`Response:`, sendResult);
        
        if (sendResponse.ok) {
            console.log('✅ Send verification API is working!');
        } else {
            console.log('❌ Send verification failed:', sendResult.message);
        }
        
        console.log('\n');
        
        // Test 2: Verify code (with dummy code - should fail)
        console.log('🔢 Testing verify code...');
        const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: testEmail,
                code: '123456' 
            })
        });
        
        const verifyResult = await verifyResponse.json();
        console.log(`Status: ${verifyResponse.status}`);
        console.log(`Response:`, verifyResult);
        
        if (verifyResponse.status === 401) {
            console.log('✅ Verify code API is working (correctly rejecting invalid code)!');
        } else {
            console.log('❌ Unexpected verify response');
        }
        
    } catch (error) {
        console.error('🚨 Test failed:', error.message);
    }
}

// Run the test
testVerificationSystem();
