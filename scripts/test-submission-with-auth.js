const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

async function testPrescriptionSubmissionWithAuth() {
  console.log('🧪 Testing Prescription Submission with Proper Authentication...\n');

  try {
    // First, let's create a valid JWT token for testing
    // In production, this would come from the login process
    const testUserId = 14; // Admin user ID from our tests
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const token = jwt.sign(
      { userId: testUserId, id: testUserId },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('🔑 Created test JWT token for user ID:', testUserId);

    // Test data that matches the frontend form structure
    const testFormData = {
      medicines: [
        {
          name: 'Test Medicine Alpha',
          dosage: '500mg',
          quantity: 1,
          instructions: 'Take with food'
        },
        {
          name: 'Test Medicine Beta',
          dosage: '200mg', 
          quantity: 2,
          instructions: 'Take after meals'
        }
      ],
      doctorName: 'Dr. Test Smith',
      doctorContact: '+44 7123 456789',
      deliveryAddress: '123 Test Street, Test City, TC1 2AB',
      urgency: 'normal',
      notes: 'Test prescription submission via API'
    };

    console.log('📋 Submitting prescription with:');
    console.log(`   - Medicines: ${testFormData.medicines.length}`);
    console.log(`   - Doctor: ${testFormData.doctorName}`);
    console.log(`   - Address: ${testFormData.deliveryAddress}`);

    // Test the submit API endpoint
    const response = await fetch('http://localhost:3004/api/prescriptions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${token}`
      },
      body: JSON.stringify(testFormData)
    });

    const responseData = await response.json();
    
    console.log(`\n📊 API Response:`);
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Success: ${responseData.success}`);
    console.log(`   - Message: ${responseData.message}`);

    if (responseData.error) {
      console.log(`   - Error: ${responseData.error}`);
    }

    if (response.ok && responseData.success) {
      console.log('✅ Prescription submission successful!');
      
      if (responseData.data && responseData.data.prescription) {
        const prescription = responseData.data.prescription;
        console.log(`   - Prescription ID: ${prescription.id}`);
        console.log(`   - Amount: ${prescription.amount}`);
        console.log(`   - Status: ${prescription.status}`);
        console.log(`   - Legacy Medicine: ${prescription.medicine}`);
        
        if (prescription.medicines) {
          const medicines = JSON.parse(prescription.medicines);
          console.log(`   - Medicines Count: ${medicines.length}`);
        }
      }
    } else {
      console.log('❌ Prescription submission failed!');
      console.log('   This indicates there is still an issue with the API.');
      
      if (response.status === 500) {
        console.log('   - Server error (500) - check server logs for details');
      } else if (response.status === 401) {
        console.log('   - Authentication error (401) - token issue');
      } else if (response.status === 400) {
        console.log('   - Validation error (400) - form data issue');
      }
    }

    // Also test the validation logic directly
    console.log('\n🔍 Testing Validation Logic:');
    const hasValidMedicine = testFormData.medicines.some((med) => med.name && med.name.trim());
    console.log(`   - Has valid medicine: ${hasValidMedicine}`);
    console.log(`   - Delivery address present: ${!!testFormData.deliveryAddress}`);
    console.log(`   - Should pass validation: ${hasValidMedicine && !!testFormData.deliveryAddress}`);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Server is not running on port 3004. Please start the dev server first.');
    } else {
      console.log('💡 Unexpected error during testing.');
    }
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testPrescriptionSubmissionWithAuth();
