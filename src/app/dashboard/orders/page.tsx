'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '@/components/AuthGuard';
import { FaShoppingCart, FaEye, FaTruck, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedDelivery: string;
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
  prescriptions: {
    id: number;
    medicine: string;
    quantity: number;
    amount: number;
    status: string;
  }[];
}

export default function OrdersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OrdersContent />
    </AuthGuard>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Failed to load orders');
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
      case 'ready_to_ship':
        return 'bg-purple-100 text-purple-800';
      case 'dispatched':
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'confirmed':
      case 'approved':
        return '✅';
      case 'preparing':
      case 'ready_to_ship':
        return '📦';
      case 'dispatched':
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✨';
      case 'cancelled':
      case 'rejected':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Your Orders</h1>
        <p className="text-gray-600">
          Track your prescription orders and delivery status.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-4">
            You haven't placed any orders yet. Upload a prescription to get started!
          </p>
          <a
            href="/dashboard/prescriptions"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block transition-colors"
          >
            Upload Prescription
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-black">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {formatStatus(order.status)}
                    </div>
                    <p className="text-lg font-semibold text-black mt-1">
                      £{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Progress and Tracking */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <FaClock className="mr-1" />
                      Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Simple tracking info when dispatched */}
                  {order.status.toLowerCase() === 'dispatched' && order.trackingNumber && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaTruck className="text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800">Package Dispatched</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-blue-600">Tracking No: </span>
                          <span className="font-bold text-black">{order.trackingNumber}</span>
                          {order.courierName && (
                            <div className="text-xs text-blue-600 mt-1">
                              via {order.courierName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Regular tracking display for other statuses */}
                  {order.trackingNumber && order.status.toLowerCase() !== 'dispatched' && (
                    <div className="flex items-center text-sm text-gray-600 mt-2">
                      <FaTruck className="mr-1" />
                      <div>
                        <span className="text-black">Tracking No: {order.trackingNumber}</span>
                        {order.courierName && (
                          <span className="text-gray-500 ml-2">via {order.courierName}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Prescriptions in order */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-black mb-3">Items in this order:</h4>
                  <div className="space-y-2">
                    {order.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-black">{prescription.medicine}</span>
                          <span className="text-gray-600 ml-2">x{prescription.quantity}</span>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(prescription.status)}`}>
                            {formatStatus(prescription.status)}
                          </div>
                          <p className="font-medium text-black">£{prescription.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-green-600 hover:text-green-800 flex items-center"
                  >
                    <FaEye className="mr-1" />
                    View Details
                  </button>
                  
                  {order.trackingNumber && (
                    <div className="flex items-center space-x-2">
                      {order.status.toLowerCase() === 'dispatched' && (
                        <div className="flex items-center text-blue-600 mr-2 bg-blue-50 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">� Ready to Track →</span>
                        </div>
                      )}
                      <span className="font-medium text-black">Tracking No: {order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black">Order #{selectedOrder.orderNumber}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Simple tracking number display in modal */}
                {selectedOrder.trackingNumber && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-600 text-white p-3 rounded-full mr-3">
                        <FaTruck className="text-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 text-xl">� Your Medication is on the Way!</h4>
                        <p className="text-blue-700">Your prescription has been dispatched and is being delivered</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 uppercase tracking-wide font-semibold mb-2">Tracking Information</p>
                        <p className="font-bold text-black text-lg tracking-wider mb-1">Tracking No: {selectedOrder.trackingNumber}</p>
                        {selectedOrder.courierName && (
                          <p className="text-blue-700 text-sm">via {selectedOrder.courierName}</p>
                        )}
                      </div>
                      <div>
                        <a
                          href={`https://track.royalmail.com/portal/rm/track?trackingNumber=${selectedOrder.trackingNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 w-full font-medium text-lg shadow-lg"
                        >
                          <FaMapMarkerAlt className="mr-3 text-xl" />
                          Track Live Progress
                        </a>
                        <p className="text-xs text-blue-600 text-center mt-2">Opens Royal Mail tracking website</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-black">
                  <p><strong>Status:</strong> {formatStatus(selectedOrder.status)}</p>
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total Amount:</strong> £{selectedOrder.totalAmount.toFixed(2)}</p>
                  <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                  {selectedOrder.trackingNumber && selectedOrder.status.toLowerCase() !== 'dispatched' && (
                    <div>
                      <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
                      {selectedOrder.courierName && (
                        <p><strong>Courier:</strong> {selectedOrder.courierName}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-black">Items:</h4>
                  {selectedOrder.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="font-medium text-black">{prescription.medicine}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {prescription.quantity} | 
                        Status: {formatStatus(prescription.status)} | 
                        Price: £{prescription.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
