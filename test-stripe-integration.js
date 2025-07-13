// Test script to verify Stripe payment integration
const API_BASE = 'http://localhost:3000/api';

async function testStripePaymentIntegration() {
  console.log('🔍 Testing Stripe Payment Integration...\n');

  // Test 1: Check if Stripe keys are configured
  try {
    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    console.log('🔑 Stripe Configuration:');
    console.log('   Public Key:', stripePublicKey ? 'Configured ✅' : 'Missing ❌');
    console.log('   Secret Key:', stripeSecretKey ? 'Configured ✅' : 'Missing ❌');
    
    if (stripePublicKey && stripePublicKey.startsWith('pk_test_')) {
      console.log('   Environment: Test Mode ✅');
    } else {
      console.log('   Environment: Production Mode ⚠️');
    }
    
  } catch (error) {
    console.log('❌ Error checking Stripe configuration:', error.message);
  }

  // Test 2: Check payment API endpoint
  try {
    console.log('\n📤 Testing payment API endpoint...');
    const response = await fetch(`${API_BASE}/prescriptions/1/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.text();
    console.log('📥 Payment API status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Payment API correctly requires authentication');
    } else {
      console.log('ℹ️ Payment API response:', result.substring(0, 100) + '...');
    }

  } catch (error) {
    console.log('❌ Payment API error:', error.message);
  }

  // Test 3: Check payment success API endpoint
  try {
    console.log('\n📤 Testing payment success API endpoint...');
    const response = await fetch(`${API_BASE}/payment-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prescriptionId: 1,
        sessionId: 'cs_test_simulation_12345'
      })
    });

    const result = await response.text();
    console.log('📥 Payment Success API status:', response.status);
    console.log('📥 Payment Success API response:', result.substring(0, 100) + '...');

  } catch (error) {
    console.log('❌ Payment Success API error:', error.message);
  }

  console.log('\n🏁 Stripe Payment Integration Test Complete');
  console.log('\n💡 To test full payment flow:');
  console.log('1. Login as admin@pharmacy.com / admin123');
  console.log('2. Navigate to /dashboard/prescriptions');
  console.log('3. Submit a prescription');
  console.log('4. Approve and price the prescription (as admin)');
  console.log('5. Click "Pay Now" button');
  console.log('6. Complete payment on Stripe checkout page');
  console.log('7. Verify payment success and order creation');
}

// Run if called directly
if (typeof window === 'undefined') {
  testStripePaymentIntegration().catch(console.error);
}

module.exports = { testStripePaymentIntegration };
