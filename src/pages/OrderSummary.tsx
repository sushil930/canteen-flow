
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import OrderItem from '../components/OrderItem';
import Header from '../components/Header';

const OrderSummary = () => {
  const navigate = useNavigate();
  const { orderItems, orderType, selectedTable, totalPrice } = useOrder();
  
  const handleBack = () => {
    navigate('/menu');
  };
  
  const handlePayment = () => {
    navigate('/payment');
  };
  
  // Return to menu if cart is empty
  if (orderItems.length === 0) {
    navigate('/menu');
    return null;
  }
  
  let title = 'Your Order';
  if (orderType === 'dine-in' && selectedTable) {
    title = `Table #${selectedTable} - Your Order`;
  } else if (orderType === 'pickup') {
    title = 'Pickup - Your Order';
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
          <span>Back to Menu</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          {orderItems.map(item => (
            <OrderItem key={item.id} item={item} />
          ))}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tax</span>
              <span>${(totalPrice * 0.075).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total</span>
              <span>${(totalPrice * 1.075).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {orderType === 'dine-in' && selectedTable && (
          <div className="bg-canteen-accent/50 rounded-lg p-4 mb-6">
            <p className="text-center font-medium">
              You're ordering to Table #{selectedTable}
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handlePayment}
            className="primary-button flex items-center space-x-2"
          >
            <CreditCard size={20} />
            <span>Proceed to Payment</span>
          </button>
        </div>
      </main>
      
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrderSummary;
