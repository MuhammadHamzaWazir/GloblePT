const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function runMigration() {
    console.log('🔧 Running migration in production...');
    
    try {
        const response = await fetch(`${PRODUCTION_URL}/api/admin/migrate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                adminKey: 'global-pharma-admin-2024'
            })
        });
        
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', data);
        
        if (response.ok) {
            console.log('✅ Migration completed successfully!');
        } else {
            console.log('❌ Migration failed');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runMigration();
