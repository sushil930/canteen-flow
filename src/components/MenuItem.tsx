
import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem as MenuItemType } from '../context/OrderContext';
import { useOrder } from '../context/OrderContext';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { addItemToOrder } = useOrder();
  
  const handleAddItem = () => {
    addItemToOrder(item);
  };
  
  return (
    <div className="menu-card flex flex-col sm:flex-row">
      <div className="h-48 sm:h-auto sm:w-32 bg-gray-200 flex-shrink-0">
        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500">
          <span className="text-sm">Image</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-medium text-lg">{item.name}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-canteen-text">${item.price.toFixed(2)}</span>
          <button 
            onClick={handleAddItem}
            className="flex items-center space-x-1 bg-canteen-primary text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
