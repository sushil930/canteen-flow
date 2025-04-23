import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Utensils, Plus, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { OrderContext } from '@/contexts/OrderContext';
import Header from '../components/Header';
import { formatCurrency } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Derive backend origin from API base URL (assuming it ends with /api)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const backendOrigin = apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;

interface TabCategory {
  id: number | string;
  name: string;
}

interface ApiCategory {
  id: number;
  name: string;
  canteen: number;
}

interface ApiMenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string | null;
  category: number;
}

interface MenuData {
  categories: ApiCategory[];
  menuItems: ApiMenuItem[];
}

const Menu = () => {
  const navigate = useNavigate();
  const { addItem, items, selectedCanteenId, updateQuantity } = useContext(OrderContext);
  const [activeCategory, setActiveCategory] = useState<number | string>('All');

  if (!selectedCanteenId) {
    console.warn("No canteen selected, redirecting to home.");
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return <div className="flex justify-center items-center h-screen"><p>No canteen selected. Redirecting...</p></div>;
  }

  const menuQuery = useQuery<MenuData, Error>({
    queryKey: ['menu', selectedCanteenId],
    queryFn: async () => {
      const categories = await apiClient<ApiCategory[]>(`/categories/?canteen=${selectedCanteenId}`);
      const menuItems = await apiClient<ApiMenuItem[]>(`/menu-items/?canteen=${selectedCanteenId}`);
      return { categories, menuItems };
    },
    enabled: !!selectedCanteenId,
  });

  const handleAddItem = (menuItem: ApiMenuItem) => {
    addItem({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: parseFloat(menuItem.price),
      quantity: 1,
    });
  };

  const handleIncreaseQuantity = (menuItemId: number) => {
    const currentQuantity = getItemQuantity(menuItemId);
    updateQuantity(menuItemId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (menuItemId: number) => {
    const currentQuantity = getItemQuantity(menuItemId);
    if (currentQuantity > 0) {
      updateQuantity(menuItemId, currentQuantity - 1);
    }
  };

  const getItemQuantity = (menuItemId: number): number => {
    const item = items.find(i => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const tabCategories = React.useMemo(() => {
    const all: TabCategory = { id: 'All', name: 'All' };
    if (!menuQuery.data?.categories) return [all];
    return [all, ...menuQuery.data.categories];
  }, [menuQuery.data]);

  const filteredMenuItems = React.useMemo(() => {
    if (!menuQuery.data?.menuItems) return [];
    if (activeCategory === 'All') return menuQuery.data.menuItems;
    return menuQuery.data.menuItems.filter(item => item.category === activeCategory);
  }, [menuQuery.data, activeCategory]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const handleBack = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    navigate('/payment');
  };

  if (menuQuery.isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (menuQuery.isError) {
    return <div className="p-4 text-red-600 bg-red-50 min-h-screen">
      Error loading data: {menuQuery.error.message}
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {/* Category Tabs */}
        <div className="overflow-x-auto">
          <div className="inline-flex space-x-2 pb-4 min-w-full">
            {tabCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                  category.id === activeCategory
                    ? "bg-[#ff6433] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items - Restored Layout with Quantity Controls */}
        <div className="space-y-4 mt-4">
          {filteredMenuItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items available in this category.
            </div>
          ) : (
            filteredMenuItems.map((menuItem) => {
              const fullImageUrl = menuItem.image
                ? menuItem.image.startsWith('http')
                  ? menuItem.image
                  : `${backendOrigin}${menuItem.image}`
                : null;

              if (menuItem.image) {
                console.log(`Constructed image URL for ${menuItem.name}:`, fullImageUrl);
              }

              const currentQuantity = getItemQuantity(menuItem.id);

              return (
                <div
                  key={menuItem.id}
                  className="flex items-start p-4 border border-gray-100 rounded-lg bg-white shadow-sm"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {fullImageUrl ? (
                      <img
                        src={fullImageUrl}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn(`Failed to load image: ${fullImageUrl}`);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-400">Image</span>
                      </div>
                    )}
                  </div>

                  {/* Details restored */}
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold text-gray-800 text-lg">{menuItem.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{menuItem.description}</p>
                    <p className="font-medium text-gray-900 mt-2">{formatCurrency(menuItem.price)}</p>
                  </div>

                  {/* Add Button / Quantity Controls */}
                  <div className="ml-4 flex flex-col items-center justify-start pt-1">
                    {currentQuantity === 0 ? (
                      <Button
                        onClick={() => handleAddItem(menuItem)}
                        className="bg-[#ff6433] hover:bg-[#e05a2d] text-white rounded-full h-9 px-4 text-sm"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-gray-300"
                          onClick={() => handleDecreaseQuantity(menuItem.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium text-lg w-6 text-center">{currentQuantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-gray-300"
                          onClick={() => handleIncreaseQuantity(menuItem.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Checkout Button */}
      {items.length > 0 && (
        <div className="sticky bottom-4 mx-auto w-full max-w-md px-4">
          <Button
            size="lg"
            className="w-full shadow-lg bg-[#ff6433] hover:bg-[#e05a2d]"
            onClick={handleViewOrder}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            View Order ({itemCount} items)
          </Button>
        </div>
      )}
    </div>
  );
};

export default Menu;
