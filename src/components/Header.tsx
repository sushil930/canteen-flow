
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrder } from '../context/OrderContext';
import { ShoppingBag, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { orderItems } = useOrder();
  const location = useLocation();
  
  const itemCount = orderItems.reduce((count, item) => count + item.quantity, 0);
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // Don't show the regular header on admin pages or the login page
  if (isAdminPage) {
    return null;
  }
  
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="canteen-container flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-canteen-primary text-2xl font-heading font-bold">Canteen</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {itemCount > 0 && (
            <Link 
              to="/order-summary" 
              className="flex items-center space-x-1 bg-canteen-primary/10 text-canteen-primary px-3 py-2 rounded-full"
            >
              <ShoppingBag size={20} />
              <span className="font-medium">{itemCount}</span>
            </Link>
          )}
          
          <Link
            to="/admin/login"
            className="flex items-center space-x-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} />
            <span className="font-medium">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
