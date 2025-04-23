import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Check, Home, Loader2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import Header from '../components/Header';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Type matching OrderSerializer response
interface OrderDetails {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  // Add other fields if needed (e.g., total_amount, created_at)
}

const OrderStatus = () => {
  const navigate = useNavigate();
  const { clearOrder } = useOrder();

  // Get order ID from session storage
  const orderId = sessionStorage.getItem('currentOrderId');

  // Redirect if no order ID (moved redirect outside query)
  useEffect(() => {
    if (!orderId) {
      console.warn("No order ID found, redirecting home.");
      navigate('/');
    }
  }, [orderId, navigate]);

  // Fetch order status using useQuery with polling
  const { data: orderData, isLoading, error, isError } = useQuery<OrderDetails>({
    queryKey: ['orderStatus', orderId],
    queryFn: () => apiClient<OrderDetails>(`/orders/${orderId}/`),
    enabled: !!orderId, // Only run if orderId exists
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling even if tab is not active
  });

  // Calculate progress and display status based on fetched data
  const { displayStatus, progress } = useMemo(() => {
    if (!orderData) return { displayStatus: 'Loading...', progress: 0 };

    switch (orderData.status) {
      case 'PENDING': return { displayStatus: 'Pending Confirmation', progress: 10 };
      case 'PROCESSING': return { displayStatus: 'Preparing Your Order', progress: 40 };
      case 'READY': return { displayStatus: 'Ready for Pickup', progress: 100 };
      case 'COMPLETED': return { displayStatus: 'Order Completed', progress: 100 };
      case 'CANCELLED': return { displayStatus: 'Order Cancelled', progress: 0 };
      default: return { displayStatus: 'Unknown Status', progress: 0 };
    }
  }, [orderData]);

  const handleBack = () => {
    navigate('/order-confirmation');
  };

  const handleNewOrder = () => {
    clearOrder();
    navigate('/');
  };

  // Render loading state
  if (isLoading && !orderData) { // Show loading only initially
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-canteen-primary" /></div>;
  }

  // Render error state
  if (isError) {
    return <div className="p-4 text-red-600 bg-red-50 min-h-screen">Error loading order status: {(error as Error)?.message}</div>;
  }

  // Redirect if no orderId (redundant check, but safe)
  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow canteen-container py-6 animate-fade-in">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 mb-6"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Order Status</h1>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Order ID:</span>
              <span>{orderId}</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-canteen-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              {orderData?.status === 'READY' || orderData?.status === 'COMPLETED' ? (
                <div className="flex items-center text-canteen-success">
                  <Check size={24} className="mr-2" />
                  <span className="font-bold text-lg">{displayStatus}</span>
                </div>
              ) : orderData?.status === 'CANCELLED' ? (
                <div className="flex items-center text-red-600">
                  <Clock size={24} className="mr-2" />
                  <span className="font-bold text-lg">{displayStatus}</span>
                </div>
              ) : (
                <div className="flex items-center text-canteen-warning">
                  <Clock size={24} className="mr-2" />
                  <span className="font-bold text-lg">{displayStatus}</span>
                </div>
              )}
            </div>
          </div>

          {orderData?.status === 'READY' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-center text-green-800">
                Your order is ready! Please proceed to the pickup counter.
              </p>
            </div>
          )}
          {orderData?.status === 'CANCELLED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-center text-red-800">
                This order has been cancelled.
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleNewOrder}
              className="flex items-center justify-center mx-auto secondary-button"
            >
              <Home size={18} className="mr-2" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-gray-500">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrderStatus;
