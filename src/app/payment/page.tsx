'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // For demo, fixed amount £10
    const amount = 1000;
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const { clientSecret } = await res.json();
    if (!stripe || !elements || !clientSecret) {
      setError('Stripe not loaded or payment intent failed.');
      setLoading(false);
      return;
    }
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });
    if (result.error) {
      setError(result.error.message || 'Payment failed.');
    } else if (result.paymentIntent?.status === 'succeeded') {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-2 border rounded" />
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Processing...' : 'Pay £10'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">Payment successful!</div>}
    </form>
  );
}

export default function PaymentPage() {
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prescription Payment</h1>
      <p className="mb-4">Please complete your payment for your prescription delivery service.</p>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
