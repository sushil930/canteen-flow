
import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { OrderItem as OrderItemType } from '../context/OrderContext';
import { useOrder } from '../context/OrderContext';

interface OrderItemProps {
  item: OrderItemType;
}

const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
  const { updateItemQuantity, removeItemFromOrder } = useOrder();
  
  const handleIncrement = () => {
    updateItemQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateItemQuantity(item.id, item.quantity - 1);
    } else {
      removeItemFromOrder(item.id);
    }
  };
  
  const handleRemove = () => {
    removeItemFromOrder(item.id);
  };
  
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-600 mt-1">${item.price.toFixed(2)} each</p>
        </div>
        <div className="text-right">
          <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleDecrement}
            className="bg-gray-100 rounded-full p-1 hover:bg-gray-200"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button 
            onClick={handleIncrement}
            className="bg-gray-100 rounded-full p-1 hover:bg-gray-200"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <button 
          onClick={handleRemove}
          className="text-gray-500 hover:text-canteen-error"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default OrderItem;
