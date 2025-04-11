
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Utensils } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import Header from '../components/Header';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orderItems, orderType, selectedTable, clearOrder } = useOrder();
  
  // Get order ID from session storage
  const orderId = sessionStorage.getItem('currentOrderId');
  
  // If no order ID, redirect to home
  useEffect(() => {
    if (!orderId || orderItems.length === 0) {
      navigate('/');
    }
  }, [orderId, orderItems, navigate]);
  
  // Handle tracking order for pickup
  const handleTrackOrder = () => {
    navigate('/order-status');
  };
  
  // Handle starting a new order
  const handleNewOrder = () => {
    clearOrder();
    navigate('/');
  };
  
  if (!orderId || orderItems.length === 0) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow canteen-container py-6 animate-fade-in">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. Your order ID is <span className="font-bold">{orderId}</span>.
          </p>
          
          {orderType === 'dine-in' && selectedTable && (
            <div className="mb-6">
              <div className="flex items-center justify-center mb-2">
                <Utensils size={20} className="text-canteen-primary mr-2" />
                <span className="font-medium">Table #{selectedTable}</span>
              </div>
              <p className="text-sm text-gray-600">
                Your order will be served to your table shortly.
              </p>
            </div>
          )}
          
          {orderType === 'pickup' && (
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                We're preparing your order for pickup.
              </p>
              <button
                onClick={handleTrackOrder}
                className="primary-button flex items-center justify-center mx-auto"
              >
                <span>Track Order Status</span>
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          )}
          
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={handleNewOrder}
              className="secondary-button"
            >
              Start New Order
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

export default OrderConfirmation;
