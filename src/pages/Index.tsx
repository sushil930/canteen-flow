
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, ShoppingBag } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const Index = () => {
  const navigate = useNavigate();
  const { setOrderType } = useOrder();
  const [clickedButton, setClickedButton] = useState<null | 'dine-in' | 'pickup'>(null);
  
  const handleOrderTypeSelection = (type: 'dine-in' | 'pickup') => {
    setClickedButton(type);
    setTimeout(() => {
      setOrderType(type);
      if (type === 'dine-in') {
        navigate('/table-selection');
      } else {
        navigate('/menu');
      }
    }, 200); // Animation duration before navigation
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-canteen-primary mb-2">
            Welcome to Canteen
          </h1>
          <p className="text-lg text-gray-600">
            Order delicious food your way
          </p>
        </div>
        
        <div className="w-full max-w-md space-y-6">
          <button
            onClick={() => handleOrderTypeSelection('dine-in')}
            className={`w-full flex items-center justify-between p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 transform ${
              clickedButton === 'dine-in' ? 'animate-scale-in' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="bg-canteen-primary/10 p-3 rounded-full mr-4">
                <Utensils className="h-6 w-6 text-canteen-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold">Dine In</h2>
                <p className="text-gray-500 text-sm">Eat at the restaurant</p>
              </div>
            </div>
            <div className="text-canteen-primary">→</div>
          </button>
          
          <button
            onClick={() => handleOrderTypeSelection('pickup')}
            className={`w-full flex items-center justify-between p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 transform ${
              clickedButton === 'pickup' ? 'animate-scale-in' : ''
            }`}
          >
            <div className="flex items-center">
              <div className="bg-canteen-primary/10 p-3 rounded-full mr-4">
                <ShoppingBag className="h-6 w-6 text-canteen-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold">Counter Pickup</h2>
                <p className="text-gray-500 text-sm">Order now, pick up when ready</p>
              </div>
            </div>
            <div className="text-canteen-primary">→</div>
          </button>
        </div>
      </div>
      
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
