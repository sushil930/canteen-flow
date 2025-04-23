import React, { useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Utensils } from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { tableNumber, clearCart } = useOrder();

  useEffect(() => {
    if (!orderId) {
      console.error("Order ID missing in URL");
      navigate('/');
    }
  }, [orderId, navigate]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('lastOrderId');
    };
  }, []);

  const handleNewOrder = () => {
    clearCart();
    sessionStorage.removeItem('lastOrderId');
    navigate('/');
  };

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Order Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you! Your Order ID is <span className="font-bold">#{orderId}</span>.
          </p>

          {tableNumber && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900 rounded-md border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-center mb-1">
                <Utensils size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Table #{tableNumber}</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your order will be served shortly.
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleNewOrder}
              variant="outline"
              className="w-full"
            >
              Start New Order
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 Canteen Ordering System.</p>
      </footer>
    </div>
  );
};

export default OrderConfirmation;
