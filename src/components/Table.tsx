
import React from 'react';
import { useOrder } from '../context/OrderContext';

interface TableProps {
  id: number;
  seats: number;
  available: boolean;
}

const Table: React.FC<TableProps> = ({ id, seats, available }) => {
  const { selectedTable, setSelectedTable } = useOrder();
  
  const isSelected = selectedTable === id;
  
  const handleSelectTable = () => {
    if (available) {
      setSelectedTable(isSelected ? null : id);
    }
  };
  
  let tableClasses = "relative p-4 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-200";
  
  if (!available) {
    tableClasses += " bg-gray-200 text-gray-400 cursor-not-allowed";
  } else if (isSelected) {
    tableClasses += " bg-canteen-primary text-white border-2 border-canteen-primary shadow-md";
  } else {
    tableClasses += " bg-white border-2 border-gray-200 hover:border-canteen-primary cursor-pointer";
  }
  
  return (
    <div 
      className={tableClasses}
      onClick={handleSelectTable}
    >
      <div className="text-2xl font-bold">#{id}</div>
      <div className="text-sm mt-1">{seats} seats</div>
      
      {!available && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-20 rounded-lg flex items-center justify-center">
          <div className="bg-gray-600 text-white text-xs font-bold uppercase px-2 py-1 rounded">
            Occupied
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
