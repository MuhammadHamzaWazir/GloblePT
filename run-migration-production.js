const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function runMigrationInProduction() {
    console.log('🔧 Running database migration in production...');
    
    try {
        // Call setup-production endpoint to run migrations
        const response = await fetch(`${PRODUCTION_URL}/api/setup-production`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'migrate'
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

runMigrationInProduction();
