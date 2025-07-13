const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testPaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow');
  console.log('=' .repeat(50));
  
  try {
    // 1. Login as customer
    console.log('\n📋 Step 1: Login as customer');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@globalpharmatrading.co.uk',
        password: 'Admin@2024'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    const authCookie = cookies?.split(';')[0];
    
    console.log('✅ Customer logged in successfully');
    console.log(`   Name: ${loginResult.user.name}`);
    
    // 2. Create prescription
    console.log('\n📋 Step 2: Create prescription');
    const prescriptionResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        medicine: 'Payment Test Medicine',
        dosage: '1 tablet daily',
        quantity: 10,
        prescriptionText: 'Payment Test Medicine - 1 tablet daily for 10 days',
        deliveryAddress: '123 Test Street, Test City, TC1 2TC',
        medicineType: 'P',
        requiresPrescription: false,
        ageRestricted: false,
        understandsRisks: true,
        canFollowInstructions: true,
        hasReadWarnings: true,
        confirmsNoAllergies: true
      })
    });
    
    if (!prescriptionResponse.ok) {
      console.error('❌ Prescription creation failed');
      const errorText = await prescriptionResponse.text();
      console.log(`   Error: ${errorText}`);
      return;
    }
    
    const prescriptionResult = await prescriptionResponse.json();
    const prescription = prescriptionResult.data.prescription;
    
    console.log('✅ Prescription created successfully');
    console.log(`   ID: ${prescription.id}`);
    console.log(`   Status: ${prescription.status}`);
    console.log(`   Payment Status: ${prescription.paymentStatus}`);
    
    // 3. Approve prescription (needed for payment)
    console.log('\n📋 Step 3: Approve prescription');
    const approvalResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        action: 'approve',
        price: 25.99
      })
    });
    
    if (!approvalResponse.ok) {
      console.error('❌ Approval failed');
      const errorText = await approvalResponse.text();
      console.log(`   Error: ${errorText}`);
      return;
    }
    
    const approvalResult = await approvalResponse.json();
    console.log('✅ Prescription approved successfully');
    console.log(`   Status: ${approvalResult.data.prescription.status}`);
    console.log(`   Amount: £${approvalResult.data.prescription.amount}`);
    
    // 4. Simulate payment success
    console.log('\n📋 Step 4: Simulate payment success');
    const paymentSuccessResponse = await fetch(`${BASE_URL}/api/payment-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        prescriptionId: prescription.id,
        sessionId: 'cs_test_simulation_' + Date.now()
      })
    });
    
    console.log('Payment success response status:', paymentSuccessResponse.status);
    const paymentSuccessText = await paymentSuccessResponse.text();
    console.log('Payment success response:', paymentSuccessText);
    
    if (paymentSuccessResponse.ok) {
      const paymentResult = JSON.parse(paymentSuccessText);
      console.log('✅ Payment success processed');
      console.log(`   Prescription Status: ${paymentResult.prescription.status}`);
      console.log(`   Payment Status: ${paymentResult.prescription.paymentStatus}`);
      console.log(`   Order Number: ${paymentResult.order.orderNumber}`);
      console.log(`   Order Status: ${paymentResult.order.status}`);
    } else {
      console.error('❌ Payment success processing failed');
    }
    
    // 5. Fetch updated prescription
    console.log('\n📋 Step 5: Fetch updated prescription');
    const fetchResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'GET',
      headers: {
        'Cookie': authCookie
      }
    });
    
    if (fetchResponse.ok) {
      const fetchResult = await fetchResponse.json();
      const updatedPrescription = fetchResult.data?.prescriptions?.find(p => p.id === prescription.id);
      
      if (updatedPrescription) {
        console.log('✅ Updated prescription fetched');
        console.log(`   Status: ${updatedPrescription.status}`);
        console.log(`   Payment Status: ${updatedPrescription.paymentStatus}`);
        console.log(`   Paid At: ${updatedPrescription.paidAt}`);
      } else {
        console.error('❌ Updated prescription not found');
      }
    } else {
      console.error('❌ Failed to fetch updated prescription');
    }
    
    console.log('\n🎉 Payment flow test completed!');
    
  } catch (error) {
    console.error('❌ Error during payment flow test:', error);
  }
}

testPaymentFlow();
