
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { getAvailableTables } from '../data/mockData';
import Table from '../components/Table';
import Header from '../components/Header';

const TableSelection = () => {
  const navigate = useNavigate();
  const { selectedTable, orderType } = useOrder();
  const tables = getAvailableTables();
  
  // Redirect if not coming from dine-in selection
  useEffect(() => {
    if (orderType !== 'dine-in') {
      navigate('/');
    }
  }, [orderType, navigate]);
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleContinue = () => {
    if (selectedTable) {
      navigate('/menu');
    }
  };
  
  if (orderType !== 'dine-in') {
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
          <span>Back to Home</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-2">Select Your Table</h1>
        <p className="text-gray-600 mb-6">
          Choose an available table for your dining experience
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {tables.map(table => (
            <Table
              key={table.id}
              id={table.id}
              seats={table.seats}
              available={table.available}
            />
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedTable}
            className={`primary-button ${!selectedTable ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue to Menu
          </button>
        </div>
      </main>
      
      <footer className="text-center p-4 text-sm text-gray-500">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TableSelection;
