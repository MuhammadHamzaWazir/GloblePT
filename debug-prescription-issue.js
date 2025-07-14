// Debug script to test prescription submission locally
const LOCAL_API_BASE = 'http://localhost:3003/api';
const PROD_API_BASE = 'https://globalpharmatrading.co.uk/api';

async function testPrescriptionSubmission() {
  console.log('🔍 Testing Prescription Submission Issues...\n');

  // Test 1: Check if the API endpoints exist
  console.log('📋 Testing API endpoint availability...');
  
  const endpoints = [
    '/prescriptions/user',
    '/upload/prescription-files',
    '/prescriptions/submit-with-files',
    '/users/profile'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint}...`);
      
      // Test locally first
      const localResponse = await fetch(`${LOCAL_API_BASE}${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log(`   Local (${LOCAL_API_BASE}${endpoint}): ${localResponse.status}`);
      
      // Test production
      const prodResponse = await fetch(`${PROD_API_BASE}${endpoint}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log(`   Production (${PROD_API_BASE}${endpoint}): ${prodResponse.status}`);
      
    } catch (error) {
      console.log(`   Error testing ${endpoint}:`, error.message);
    }
  }
  
  // Test 2: Simulate form submission
  console.log('\n📋 Testing form submission simulation...');
  
  const testFormData = {
    prescriptionText: 'Test prescription submission',
    medicine: 'Test Medicine',
    quantity: 1,
    deliveryAddress: '123 Test Street, Test City',
    medicines: [
      {
        name: 'Test Medicine',
        quantity: 1,
        dosage: '500mg',
        instructions: 'Take with food'
      }
    ],
    fileUrls: ['/uploads/prescriptions/test-file.pdf'],
    filename: 'test-prescription.pdf'
  };
  
  try {
    console.log('🚀 Testing prescription submission with test data...');
    
    const response = await fetch(`${LOCAL_API_BASE}/prescriptions/submit-with-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFormData),
      credentials: 'include'
    });
    
    console.log(`📋 Response status: ${response.status}`);
    console.log(`📋 Response URL: ${response.url}`);
    
    const responseData = await response.json();
    console.log('📋 Response data:', responseData);
    
  } catch (error) {
    console.log('❌ Form submission test error:', error.message);
  }
  
  console.log('\n✅ Prescription submission test completed');
}

// Run the test
testPrescriptionSubmission().catch(console.error);
