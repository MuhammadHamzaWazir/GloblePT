// Test for specific error scenarios in production
async function diagnoseProductionIssues() {
  console.log('🔍 Diagnosing Production Issues...\n');

  const baseUrl = 'https://globalpharmatrading.co.uk';
  
  // Test scenarios that might cause internal server errors
  const testScenarios = [
    {
      name: 'Valid email format',
      email: 'test@example.com'
    },
    {
      name: 'Email with special characters',
      email: 'test+tag@example.com'
    },
    {
      name: 'Long email',
      email: 'verylongemailaddressthatmightcauseissues@example.com'
    },
    {
      name: 'Email with quotes',
      email: 'test"quote@example.com'
    },
    {
      name: 'Potential SQL injection attempt',
      email: "'; DROP TABLE users; --@example.com"
    },
    {
      name: 'Empty email',
      email: ''
    },
    {
      name: 'Null email',
      email: null
    },
    {
      name: 'Non-string email',
      email: 123
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`Testing: ${scenario.name}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: scenario.email })
      });

      const data = await response.json();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Response: ${data.message || JSON.stringify(data)}`);
      
      if (response.status === 500) {
        console.log('  🚨 INTERNAL SERVER ERROR FOUND!');
        console.log(`  🔍 Scenario: ${scenario.name}`);
        console.log(`  📧 Email: ${JSON.stringify(scenario.email)}`);
      } else {
        console.log('  ✅ No error');
      }
      
    } catch (error) {
      console.log(`  ❌ Network/Fetch Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  // Test verify endpoint with various scenarios
  console.log('\n🔢 Testing Verify Code Endpoint...');
  
  const verifyScenarios = [
    { email: 'test@example.com', code: '123456' },
    { email: '', code: '123456' },
    { email: 'test@example.com', code: '' },
    { email: null, code: null },
    { email: 'test@example.com', code: 'abc123' },
    { email: 'test@example.com', code: '1234567' }, // 7 digits
    { email: 'test@example.com', code: '12345' },   // 5 digits
  ];

  for (const scenario of verifyScenarios) {
    console.log(`Testing verify: email="${scenario.email}", code="${scenario.code}"`);
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario)
      });

      const data = await response.json();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Response: ${data.message || JSON.stringify(data)}`);
      
      if (response.status === 500) {
        console.log('  🚨 INTERNAL SERVER ERROR FOUND!');
      } else {
        console.log('  ✅ No error');
      }
      
    } catch (error) {
      console.log(`  ❌ Network/Fetch Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

// Run the diagnosis
diagnoseProductionIssues();
