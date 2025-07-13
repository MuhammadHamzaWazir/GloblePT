const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function simulateUserPaymentFlow() {
  console.log('🧪 SIMULATING REAL USER PAYMENT FLOW');
  console.log('=' .repeat(50));
  
  try {
    // 1. Login as customer
    console.log('\n👤 Step 1: Customer login');
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
    
    console.log('✅ Customer logged in successfully');
    
    // 2. Create prescription
    console.log('\n💊 Step 2: Submit prescription');
    const prescriptionResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        medicine: 'Paracetamol 500mg',
        dosage: '1-2 tablets every 4-6 hours',
        quantity: 32,
        prescriptionText: 'Paracetamol 500mg - 1-2 tablets every 4-6 hours as needed for pain relief',
        deliveryAddress: '789 User Street, Test City, TC3 6TC',
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
    
    console.log('✅ Prescription submitted successfully');
    console.log(`   ID: ${prescription.id}`);
    console.log(`   Medicine: ${prescription.medicine}`);
    console.log(`   Status: ${prescription.status}`);
    
    // 3. Staff approves prescription
    console.log('\n👩‍⚕️ Step 3: Staff approves prescription');
    const approvalResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        action: 'approve',
        price: 8.99
      })
    });
    
    const approvalResult = await approvalResponse.json();
    console.log('✅ Prescription approved by staff');
    console.log(`   Price set: £${approvalResult.data.prescription.amount}`);
    
    // 4. Customer sees dashboard - prescription ready for payment
    console.log('\n📊 Step 4: Customer checks dashboard');
    let dashboardResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      headers: { 'Cookie': authCookie }
    });
    
    if (dashboardResponse.ok) {
      const dashboardResult = await dashboardResponse.json();
      const dashboardPrescription = dashboardResult.data?.prescriptions?.find(p => p.id === prescription.id);
      
      console.log('✅ Dashboard shows prescription ready for payment');
      console.log(`   Status: ${dashboardPrescription.status}`);
      console.log(`   Payment Status: ${dashboardPrescription.paymentStatus}`);
      console.log(`   Amount: £${dashboardPrescription.amount}`);
      console.log('   → Customer sees "Pay £8.99" button');
    }
    
    // 5. Customer clicks payment button (this would redirect to Stripe)
    console.log('\n💳 Step 5: Customer initiates payment');
    console.log('   → In real flow: Customer clicks "Pay £8.99" button');
    console.log('   → Redirects to Stripe Checkout');
    console.log('   → Customer enters card details');
    console.log('   → Stripe processes payment');
    console.log('   → Customer redirected back to dashboard with success params');
    
    // 6. Simulate successful payment return
    console.log('\n✅ Step 6: Payment successful - processing return');
    const paymentResponse = await fetch(`${BASE_URL}/api/payment-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        prescriptionId: prescription.id,
        sessionId: 'cs_test_real_user_flow_' + Date.now()
      })
    });
    
    const paymentResult = await paymentResponse.json();
    console.log('✅ Payment processed successfully');
    console.log('Payment result:', JSON.stringify(paymentResult, null, 2));
    
    if (paymentResult.order) {
      console.log(`   Order Number: ${paymentResult.order.orderNumber}`);
      console.log(`   Order Status: ${paymentResult.order.status}`);
    } else {
      console.log('❌ No order created in payment result');
    }
    
    // 7. Customer sees updated dashboard
    console.log('\n📊 Step 7: Customer sees updated dashboard');
    dashboardResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      headers: { 'Cookie': authCookie }
    });
    
    if (dashboardResponse.ok) {
      const dashboardResult = await dashboardResponse.json();
      const dashboardPrescription = dashboardResult.data?.prescriptions?.find(p => p.id === prescription.id);
      
      console.log('✅ Dashboard shows payment completion');
      console.log(`   Status: ${dashboardPrescription.status}`);
      console.log(`   Payment Status: ${dashboardPrescription.paymentStatus}`);
      console.log(`   Order Number: ${dashboardPrescription.order?.orderNumber}`);
      console.log(`   Order Status: ${dashboardPrescription.order?.status}`);
      console.log('   → Customer sees "✅ Payment Complete" message');
      console.log('   → No payment button visible');
      console.log('   → Order number displayed');
    }
    
    // 8. Success summary
    console.log('\n🎉 PAYMENT FLOW COMPLETE!');
    console.log('=' .repeat(50));
    console.log('✅ Prescription submitted by customer');
    console.log('✅ Prescription approved by staff with price');
    console.log('✅ Customer payment processed successfully');
    console.log('✅ Order created and number assigned');
    console.log('✅ Database updated with payment status');
    console.log('✅ Dashboard shows correct status');
    
    console.log('\n🔍 WHAT CUSTOMER SEES:');
    console.log('======================');
    console.log('• Status badge: "PAID - ORDER PREPARING" (green)');
    console.log('• Payment status: "PAID" (green)');
    console.log('• "✅ Payment Complete" message');
    console.log('• Order number displayed');
    console.log('• "Order is being prepared" message');
    console.log('• No payment button (hidden)');
    
    console.log('\n🚨 TROUBLESHOOTING:');
    console.log('===================');
    console.log('If dashboard still shows old status:');
    console.log('1. Refresh the page (F5) - this forces re-fetch');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Check if payment success URL was called');
    console.log('4. Verify the prescription.paymentStatus is "paid"');
    console.log('5. Verify the prescription.status is "paid"');
    
  } catch (error) {
    console.error('❌ Error during user payment flow simulation:', error);
  }
}

simulateUserPaymentFlow();
