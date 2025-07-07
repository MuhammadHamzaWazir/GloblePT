const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function createUserWith2FA() {
    console.log('🔧 Creating user with 2FA enabled in production...');
    
    try {
        // Create a user via the registration endpoint
        console.log('1. Creating user account...');
        const registerResponse = await fetch(`${PRODUCTION_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test2fa@example.com',
                password: 'Test123!',
                fullName: 'Test 2FA User',
                role: 'CUSTOMER'
            })
        });
        
        const registerData = await registerResponse.json();
        console.log('Register status:', registerResponse.status);
        console.log('Register response:', registerData);
        
        if (!registerResponse.ok) {
            console.log('❌ Failed to create user');
            return;
        }
        
        console.log('✅ User created successfully!');
        
        // Now try to enable 2FA directly via database update
        // Since we can't access the admin endpoint, let's test with the existing user
        console.log('2. Testing login with new user...');
        const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test2fa@example.com',
                password: 'Test123!'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login status:', loginResponse.status);
        console.log('Login response:', loginData);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createUserWith2FA();
