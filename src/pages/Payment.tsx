
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { processPayment, generateOrderId } from '../data/mockData';
import Header from '../components/Header';

const Payment = () => {
  const navigate = useNavigate();
  const { orderItems, totalPrice, orderType } = useOrder();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock customer info fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  // Calculate final amount
  const finalAmount = totalPrice * 1.075; // Including tax
  
  const handleBack = () => {
    navigate('/order-summary');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate payment processing
      const result = await processPayment(finalAmount);
      
      if (result.success) {
        // Generate a random order ID
        const orderId = generateOrderId();
        // Store in sessionStorage for order tracking
        sessionStorage.setItem('currentOrderId', orderId);
        
        // Redirect to confirmation
        navigate('/order-confirmation');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Return to menu if cart is empty
  if (orderItems.length === 0) {
    navigate('/menu');
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow canteen-container py-6 animate-fade-in">
        <button 
          onClick={handleBack}
          className="flex items-center text-gray-600 mb-6"
          disabled={loading}
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Order</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Order summary */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="font-semibold text-lg mb-3">Order Summary</h2>
            <div className="flex justify-between font-bold">
              <span>Total to Pay:</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              (Including tax)
            </div>
            
            {orderType === 'pickup' && (
              <div className="bg-canteen-secondary/30 p-3 rounded mt-4 text-sm">
                <p className="font-medium">Your order will be available for pickup at the counter.</p>
              </div>
            )}
          </div>
          
          {/* Payment form */}
          <form onSubmit={handleSubmit}>
            <h2 className="font-semibold text-lg mb-3">Your Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter your name"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email (for receipt)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="youremail@example.com"
                  disabled={loading}
                  required
                />
              </div>
              
              {/* Mock card input (in a real app, use a payment processor component) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                  <p className="text-center text-gray-500">
                    This is a demo. No real payment will be processed.
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                {error}
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full primary-button flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="mr-2" />
                    <span>Pay ${finalAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Payment;
