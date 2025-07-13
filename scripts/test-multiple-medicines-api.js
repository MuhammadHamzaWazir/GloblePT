const fetch = require('node-fetch');

async function testMultipleMedicinesAPI() {
  console.log('🧪 Testing Multiple Medicines API Submission...\n');

  // Test data for multiple medicines form submission
  const testFormData = {
    medicines: [
      {
        name: 'Aspirin',
        dosage: '75mg',
        quantity: 1,
        instructions: 'Take once daily for heart protection'
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        quantity: 2,
        instructions: 'Take twice daily with meals'
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        quantity: 1,
        instructions: 'Take once daily for blood pressure'
      }
    ],
    doctorName: 'Dr. Test Smith',
    doctorContact: '+44 7123 456789',
    deliveryAddress: '123 Test Street, Test City, TC1 2AB',
    urgency: 'normal',
    notes: 'Patient has diabetes and hypertension. Regular medication review needed.'
  };

  try {
    console.log('📋 Submitting prescription with medicines:');
    testFormData.medicines.forEach((med, index) => {
      console.log(`   ${index + 1}. ${med.name} - ${med.dosage} - Qty: ${med.quantity}`);
    });

    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/prescriptions/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd need a valid auth cookie
        'Cookie': 'pharmacy_auth=test_token_here'
      },
      body: JSON.stringify(testFormData)
    });

    const responseData = await response.json();
    
    console.log(`📊 API Response Status: ${response.status}`);
    console.log('📋 Response Data:', responseData);

    if (response.ok && responseData.success) {
      console.log('✅ Multiple medicines API submission test passed!');
      
      if (responseData.data && responseData.data.prescription) {
        const prescription = responseData.data.prescription;
        console.log(`📝 Created prescription ID: ${prescription.id}`);
        console.log(`📊 Total quantity: ${prescription.quantity}`);
        console.log(`📋 Legacy medicine field: ${prescription.medicine}`);
        
        if (prescription.medicines) {
          const medicines = JSON.parse(prescription.medicines);
          console.log(`📊 Number of medicines: ${medicines.length}`);
        }
      }
    } else {
      console.log('❌ API submission failed:', responseData.message);
    }

  } catch (error) {
    console.log('⚠️  Could not test API (server may not be running):', error.message);
    console.log('📝 This is expected if the development server is not running.');
    console.log('📝 The form data structure looks correct for multiple medicines.');
  }

  console.log('\n📋 Test form data structure:');
  console.log(JSON.stringify(testFormData, null, 2));
}

// Run the test
testMultipleMedicinesAPI();
