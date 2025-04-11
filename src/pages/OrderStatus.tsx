
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Check, Home } from 'lucide-react';
import { getOrderStatus } from '../data/mockData';
import { useOrder } from '../context/OrderContext';
import Header from '../components/Header';

const OrderStatus = () => {
  const navigate = useNavigate();
  const { orderType, clearOrder } = useOrder();
  const [status, setStatus] = useState('Preparing');
  const [progress, setProgress] = useState(33);
  
  // Get order ID from session storage
  const orderId = sessionStorage.getItem('currentOrderId');
  
  // If no order ID or not pickup, redirect to home
  useEffect(() => {
    if (!orderId || orderType !== 'pickup') {
      navigate('/');
    }
  }, [orderId, orderType, navigate]);
  
  // Poll for status updates
  useEffect(() => {
    if (!orderId) return;
    
    const updateStatus = async () => {
      try {
        const newStatus = await getOrderStatus(orderId);
        setStatus(newStatus);
        
        // Update progress based on status
        if (newStatus === 'Preparing') {
          setProgress(33);
        } else if (newStatus === 'Almost Ready') {
          setProgress(66);
        } else if (newStatus === 'Ready for Pickup') {
          setProgress(100);
        }
      } catch (error) {
        console.error('Error fetching order status:', error);
      }
    };
    
    // Initial update
    updateStatus();
    
    // Set up polling interval
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  const handleBack = () => {
    navigate('/order-confirmation');
  };
  
  const handleNewOrder = () => {
    clearOrder();
    navigate('/');
  };
  
  if (!orderId || orderType !== 'pickup') {
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
          <span>Back to Confirmation</span>
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
              {status === 'Ready for Pickup' ? (
                <div className="flex items-center text-canteen-success">
                  <Check size={24} className="mr-2" />
                  <span className="font-bold text-lg">Ready for Pickup!</span>
                </div>
              ) : (
                <div className="flex items-center text-canteen-warning">
                  <Clock size={24} className="mr-2" />
                  <span className="font-bold text-lg">{status}</span>
                </div>
              )}
            </div>
          </div>
          
          {status === 'Ready for Pickup' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-center text-green-800">
                Your order is ready! Please proceed to the pickup counter.
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
