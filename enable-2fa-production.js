const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function enable2FAInProduction() {
    console.log('🔧 Enabling 2FA for user in production...');
    
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/admin/enable-2fa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'mhamzawazir1996@gmail.com',
                enable2FA: true,
                adminKey: 'global-pharma-admin-2024'
            })
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (response.ok) {
            console.log('✅ 2FA enabled successfully!');
        } else {
            console.log('❌ Failed to enable 2FA');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

enable2FAInProduction();

enable2FAInProduction();
