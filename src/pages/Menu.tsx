
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { getMenuItemsByCategory, categories } from '../data/mockData';
import MenuItem from '../components/MenuItem';
import CategoryTabs from '../components/CategoryTabs';
import Header from '../components/Header';

const Menu = () => {
  const navigate = useNavigate();
  const { orderType, orderItems, selectedTable } = useOrder();
  const [activeCategory, setActiveCategory] = useState('All');
  
  const menuItems = getMenuItemsByCategory(activeCategory);
  const itemCount = orderItems.reduce((count, item) => count + item.quantity, 0);
  
  const handleBack = () => {
    if (orderType === 'dine-in') {
      navigate('/table-selection');
    } else {
      navigate('/');
    }
  };
  
  const handleViewOrder = () => {
    navigate('/order-summary');
  };
  
  let title = 'Menu';
  if (orderType === 'dine-in' && selectedTable) {
    title = `Table #${selectedTable} - Menu`;
  } else if (orderType === 'pickup') {
    title = 'Pickup Order - Menu';
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow canteen-container py-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold">{title}</h1>
          
          {itemCount > 0 && (
            <button 
              onClick={handleViewOrder}
              className="flex items-center space-x-1 bg-canteen-primary px-3 py-1 rounded-full text-white"
            >
              <ShoppingBag size={16} />
              <span>{itemCount}</span>
            </button>
          )}
        </div>
        
        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        
        <div className="mt-6 space-y-4">
          {menuItems.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
        
        {itemCount > 0 && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={handleViewOrder}
              className="primary-button shadow-lg flex items-center space-x-2"
            >
              <ShoppingBag size={20} />
              <span>View Order ({itemCount} items)</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Menu;
