'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  estimatedDelivery: string;
  prescription: {
    medicine: string;
    quantity: number;
    dosage: string;
  };
}

export default function OrderSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchParams) return;
    
    const payment = searchParams.get('payment');
    const prescriptionId = searchParams.get('prescription');

    if (payment === 'success' && prescriptionId) {
      fetchOrderDetails(prescriptionId);
    } else {
      setError('Invalid payment confirmation');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (prescriptionId: string) => {
    try {
      // First get the prescription to find the order
      const prescriptionResponse = await fetch(`/api/prescriptions/${prescriptionId}`);
      if (!prescriptionResponse.ok) {
        throw new Error('Failed to fetch prescription');
      }
      
      const prescriptionData = await prescriptionResponse.json();
      
      // Then get the user's orders to find the matching one
      const ordersResponse = await fetch('/api/orders');
      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const ordersData = await ordersResponse.json();
      const matchingOrder = ordersData.orders.find((o: any) => o.prescriptionId === parseInt(prescriptionId));
      
      if (matchingOrder) {
        setOrder(matchingOrder);
      } else {
        setError('Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-4 border-b border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-green-900">Payment Successful!</h1>
                <p className="text-green-700">Your order has been confirmed and is being processed.</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          {order && (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-gray-900">
                        £{order.totalAmount.toFixed(2)} {order.currency.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Prescription Details */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Prescription Details</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medicine:</span>
                      <span className="font-medium text-gray-900">{order.prescription.medicine}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dosage:</span>
                      <span className="font-medium text-gray-900">{order.prescription.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium text-gray-900">{order.prescription.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Your prescription will be prepared by our qualified pharmacists</li>
                  <li>• You'll receive an email confirmation with tracking details</li>
                  <li>• We'll notify you when your order is dispatched</li>
                  <li>• Expected delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  View All Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
