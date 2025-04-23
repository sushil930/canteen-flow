import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem as ContextMenuItemType, useOrder } from '../context/OrderContext';
import { ApiMenuItem } from '../pages/admin/MenuManagement';
import { Badge } from '@/components/ui/badge';

interface MenuItemProps {
  item: ApiMenuItem;
}

const getImageUrl = (imageUrl: string | null) => {
  if (imageUrl && !imageUrl.startsWith('http')) {
    const backendBase = import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8000';
    return `${backendBase}${imageUrl}`;
  }
  return imageUrl || '/placeholder.svg';
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { addItemToOrder } = useOrder();

  const handleAddItem = () => {
    const itemForContext: ContextMenuItemType = {
      id: String(item.id),
      name: item.name,
      description: item.description || '',
      price: parseFloat(item.price),
      image: item.image || '',
      category: item.category || 'Uncategorized',
    };
    addItemToOrder(itemForContext);
  };

  const imageUrl = getImageUrl(item.image);
  const displayPrice = parseFloat(item.price).toFixed(2);

  return (
    <div className={`menu-card flex flex-col sm:flex-row ${!item.is_available ? 'opacity-60' : ''}`}>
      <div className="h-48 sm:h-auto sm:w-32 bg-gray-200 flex-shrink-0">
        <img
          src={imageUrl}
          alt={item.name}
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-medium text-lg">{item.name}</h3>
          {!item.is_available && (
            <Badge variant="outline" className="ml-2">Unavailable</Badge>
          )}
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-bold text-canteen-text">${displayPrice}</span>
          <button
            onClick={handleAddItem}
            disabled={!item.is_available}
            className={`flex items-center space-x-1 text-white px-3 py-1 rounded-full text-sm font-medium ${item.is_available ? 'bg-canteen-primary hover:bg-canteen-primary/90' : 'bg-gray-400 cursor-not-allowed'}`}
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
