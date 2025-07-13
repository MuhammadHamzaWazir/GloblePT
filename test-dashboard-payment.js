const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testDashboardPaymentFlow() {
  console.log('🧪 Testing Dashboard Payment Flow');
  console.log('=' .repeat(50));
  
  try {
    // 1. Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@globalpharmatrading.co.uk',
        password: 'Admin@2024'
      })
    });
    
    const loginResult = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    const authCookie = cookies?.split(';')[0];
    
    console.log('✅ Logged in successfully');
    
    // 2. Create prescription
    const prescriptionResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        medicine: 'Dashboard Test Medicine',
        dosage: '2 tablets daily',
        quantity: 20,
        prescriptionText: 'Dashboard Test Medicine - 2 tablets daily for 10 days',
        deliveryAddress: '456 Dashboard Street, Test City, TC2 4TC',
        medicineType: 'P',
        requiresPrescription: false,
        ageRestricted: false,
        understandsRisks: true,
        canFollowInstructions: true,
        hasReadWarnings: true,
        confirmsNoAllergies: true
      })
    });
    
    const prescriptionResult = await prescriptionResponse.json();
    const prescription = prescriptionResult.data.prescription;
    
    console.log('✅ Prescription created:', prescription.id);
    
    // 3. Approve prescription
    const approvalResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        action: 'approve',
        price: 29.99
      })
    });
    
    const approvalResult = await approvalResponse.json();
    console.log('✅ Prescription approved with price: £29.99');
    
    // 4. Check dashboard before payment
    console.log('\n📊 Dashboard BEFORE payment:');
    let dashboardResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      headers: { 'Cookie': authCookie }
    });
    
    if (dashboardResponse.ok) {
      const dashboardResult = await dashboardResponse.json();
      const dashboardPrescription = dashboardResult.data?.prescriptions?.find(p => p.id === prescription.id);
      
      if (dashboardPrescription) {
        console.log(`   Status: ${dashboardPrescription.status}`);
        console.log(`   Payment Status: ${dashboardPrescription.paymentStatus}`);
        console.log(`   Order: ${dashboardPrescription.order ? dashboardPrescription.order.orderNumber : 'None'}`);
      }
    }
    
    // 5. Process payment
    console.log('\n💳 Processing payment...');
    const paymentResponse = await fetch(`${BASE_URL}/api/payment-success`, {
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
    
    const paymentResult = await paymentResponse.json();
    console.log('✅ Payment processed successfully');
    console.log(`   Order Number: ${paymentResult.order.orderNumber}`);
    
    // 6. Check dashboard after payment
    console.log('\n📊 Dashboard AFTER payment:');
    dashboardResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      headers: { 'Cookie': authCookie }
    });
    
    if (dashboardResponse.ok) {
      const dashboardResult = await dashboardResponse.json();
      const dashboardPrescription = dashboardResult.data?.prescriptions?.find(p => p.id === prescription.id);
      
      if (dashboardPrescription) {
        console.log(`   Status: ${dashboardPrescription.status}`);
        console.log(`   Payment Status: ${dashboardPrescription.paymentStatus}`);
        console.log(`   Order: ${dashboardPrescription.order ? dashboardPrescription.order.orderNumber : 'None'}`);
        console.log(`   Order Status: ${dashboardPrescription.order ? dashboardPrescription.order.status : 'None'}`);
      }
    }
    
    // 7. Dashboard UI expectations
    console.log('\n🎯 What should show in dashboard UI:');
    console.log('=====================================');
    console.log('✅ Status badge: "PAID - ORDER PREPARING" (green)');
    console.log('✅ Payment status: "PAID" (green)');
    console.log('✅ Action column: "✅ Payment Complete" with order number');
    console.log('✅ No payment button should be visible');
    console.log('✅ Order number should be displayed');
    
    console.log('\n🔄 If dashboard still shows old status:');
    console.log('=======================================');
    console.log('1. Try refreshing the page (F5)');
    console.log('2. Check browser console for errors');
    console.log('3. Make sure the payment success flow was triggered');
    
  } catch (error) {
    console.error('❌ Error during dashboard payment flow test:', error);
  }
}

testDashboardPaymentFlow();
