
import React from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { ShoppingBag } from 'lucide-react';

const Header: React.FC = () => {
  const { orderItems } = useOrder();
  
  const itemCount = orderItems.reduce((count, item) => count + item.quantity, 0);
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="canteen-container flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-canteen-primary text-2xl font-heading font-bold">Canteen</span>
        </Link>
        
        {itemCount > 0 && (
          <Link 
            to="/order-summary" 
            className="flex items-center space-x-1 bg-canteen-primary/10 text-canteen-primary px-3 py-2 rounded-full"
          >
            <ShoppingBag size={20} />
            <span className="font-medium">{itemCount}</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
