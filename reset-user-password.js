const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function resetUserPassword() {
    console.log('🔧 Resetting user password in production...');
    
    try {
        // Use a simple endpoint to reset password (we'll create this)
        const response = await fetch(`${PRODUCTION_URL}/api/admin/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'mhamzawazir1996@gmail.com',
                newPassword: 'Test123!',
                adminKey: 'global-pharma-admin-2024'
            })
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (response.ok) {
            console.log('✅ Password reset successfully!');
        } else {
            console.log('❌ Password reset failed');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

resetUserPassword();
