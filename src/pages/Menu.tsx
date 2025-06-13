import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Utensils, Plus, Minus, Search, Filter, ShoppingCart, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { OrderContext } from '@/contexts/OrderContext';
import Header from '../components/Header';
import { formatCurrency } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Infinity } from 'ldrs/react';
import 'ldrs/react/Infinity.css';
import { useAuth } from '@/contexts/AuthContext';

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
  image_prompt?: string;
}

interface MenuData {
  categories: ApiCategory[];
  menuItems: ApiMenuItem[];
}

const Menu = () => {
  const navigate = useNavigate();
  const { canteenId: canteenIdParam } = useParams<{ canteenId: string }>();
  const { 
    addItem, 
    items, 
    selectedCanteenId, 
    setSelectedCanteenId,
    updateQuantity 
  } = useContext(OrderContext);
  const [activeCategory, setActiveCategory] = useState<number | string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { isGuest } = useAuth();

  const canteenId = canteenIdParam ? parseInt(canteenIdParam, 10) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (canteenId !== null && !isNaN(canteenId) && canteenId !== selectedCanteenId) {
      setSelectedCanteenId(canteenId);
    }
  }, [canteenId, selectedCanteenId, setSelectedCanteenId]);

  if (canteenId === null || isNaN(canteenId)) {
    console.error("Invalid or missing canteenId in URL, redirecting to home.");
    useEffect(() => {
      navigate('/');
    }, [navigate]);
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <p className="text-gray-700">Invalid Canteen ID. Redirecting...</p>
        </div>
      </div>
    );
  }

  const menuQuery = useQuery<MenuData, Error>({
    queryKey: ['menu', canteenId],
    queryFn: async () => {
        if (isGuest) {
            const mockCategories: ApiCategory[] = [
                { id: 1, name: 'Meals', canteen: canteenId! },
                { id: 2, name: 'Snacks', canteen: canteenId! },
                { id: 3, name: 'Drinks', canteen: canteenId! },
            ];
            const mockItems: ApiMenuItem[] = [
                { 
                    id: 1, name: 'Veg Thali', description: 'A complete meal with rice, roti, dal, and sabzi.', price: '120.00', image: 'https://i.ibb.co/8LrdxMtm/Firefly-A-vibrant-Indian-Veg-Thali-on-a-clean-round-stainless-steel-plate-The-thali-should-177735.jpg', category: 1,
                    image_prompt: "A vibrant Indian Veg Thali on a clean, round, stainless steel plate. The thali should feature a mound of fluffy white rice, two folded chapatis, a small bowl of yellow dal, a bowl of mixed vegetable curry, and a side of green chutney. Professional food photography, top-down view, appetizing, with a slightly blurred restaurant background."
                },
                { 
                    id: 2, name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes.', price: '20.00', image: 'https://i.ibb.co/whnCFmWr/Firefly-Two-crispy-golden-brown-samosas-on-a-clean-white-plate-One-samosa-is-whole-and-the-303110.jpg', category: 2,
                    image_prompt: "Two crispy, golden-brown samosas on a clean white plate. One samosa is whole, and the other is broken open to show the steamy, spiced potato and pea filling. A small bowl of tamarind chutney is next to them. Professional food photography, close-up shot, appetizing, with a slightly blurred background."
                },
                { 
                    id: 3, name: 'Masala Chai', description: 'Aromatic and spiced Indian tea.', price: '15.00', image: 'https://i.ibb.co/Sw3HXyp9/Firefly-A-steaming-cup-of-Indian-masala-chai-in-a-traditional-clay-cup-kulhad-The-tea-is-a-177735.jpg', category: 3,
                    image_prompt: "A steaming cup of Indian masala chai in a traditional clay cup (kulhad). The tea is a warm, milky brown color. A couple of cinnamon sticks and star anise are placed beside the cup on a rustic wooden surface. Professional food photography, eye-level shot, appetizing, with a cozy, warm ambiance."
                },
                { 
                    id: 4, name: 'Paneer Butter Masala', description: 'Rich and creamy paneer dish.', price: '150.00', image: 'https://i.ibb.co/HfmYMZBw/Firefly-A-rich-and-creamy-Paneer-Butter-Masala-in-a-traditional-Indian-copper-bowl-kadai-T-759634.jpg', category: 1,
                    image_prompt: "A rich and creamy Paneer Butter Masala in a traditional Indian copper bowl (kadai). The gravy is a vibrant orange color, garnished with a swirl of cream and fresh cilantro. A piece of paneer should be visible. Professional food photography, close-up shot, appetizing, with a slightly blurred, warm background."
                },
                { 
                    id: 6, name: 'Vada Pav', description: 'The classic Mumbai street food.', price: '30.00', image: 'https://i.ibb.co/Rp73SYpL/Firefly-A-classic-Mumbai-Vada-Pav-on-a-simple-white-plate-The-pav-bread-roll-is-soft-and-106596.jpg', category: 2,
                    image_prompt: "A classic Mumbai Vada Pav on a simple white plate. The pav (bread roll) is soft, and the vada (potato fritter) is golden and crispy, sandwiched in between with a layer of green chutney. Professional food photography, close-up shot, appetizing, against a clean, slightly out-of-focus background."
                },
            ];
            return Promise.resolve({ categories: mockCategories, menuItems: mockItems });
        }
      const categories = await apiClient<ApiCategory[]>(`/categories/?canteen=${canteenId}`);
      const menuItems = await apiClient<ApiMenuItem[]>(`/menu-items/?canteen=${canteenId}`);
      return { categories, menuItems };
    },
    enabled: canteenId !== null && !isNaN(canteenId),
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
    
    let filtered = menuQuery.data.menuItems;
    
    // First apply category filter
    if (activeCategory !== 'All') {
      // Convert activeCategory to number for comparison if it's a string number
      const categoryId = typeof activeCategory === 'string' 
        ? parseInt(activeCategory, 10) 
        : activeCategory;
        
      filtered = filtered.filter(item => item.category === categoryId);
    }
    
    // Then apply search filter
    if (searchTerm.trim() !== '') {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(normalizedSearch) || 
        item.description.toLowerCase().includes(normalizedSearch)
      );
    }
    
    return filtered;
  }, [menuQuery.data, activeCategory, searchTerm]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleBack = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    navigate('/payment');
  };

  if (menuQuery.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Infinity
          size="55"
          stroke="4"
          strokeLength="0.15"
          bgOpacity="0.1"
          speed="1.3"
          color="#ff6433" 
        />
        <p className="text-gray-600 font-medium mt-6">
          Loading delicious menu items...
        </p>
      </div>
    );
  }

  if (menuQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="bg-red-50 rounded-xl p-6 shadow-sm max-w-md w-full text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">Something went wrong while loading menu items.</p>
          <pre className="text-xs text-red-500 mb-4 bg-red-50 p-2 rounded overflow-x-auto">
            {menuQuery.error.message}
          </pre>
          <Button
            onClick={() => menuQuery.refetch()}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <div className="bg-[#ff6433] text-white py-4 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center mb-1">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-0 h-auto text-white/80 hover:text-white hover:bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>
            <span className="text-white/80">Canteens</span>
            <span className="mx-2 text-white/60">/</span>
            <span className="font-medium">Menu</span>
          </div>
          <h1 className="text-2xl font-bold">Menu</h1>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#ff6433] focus:border-transparent outline-none shadow-sm"
          />
        </div>
        
        {/* Category Tabs */}
        <div className="overflow-x-auto mb-6">
          <div className="inline-flex space-x-2 pb-1 min-w-full">
            {tabCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  category.id === activeCategory
                    ? "bg-[#ff6433] text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredMenuItems.length} {filteredMenuItems.length === 1 ? 'item' : 'items'} available
          </p>
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSearchTerm('')}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Menu Items Grid */}
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Utensils className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No items found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm 
                ? `No results for "${searchTerm}". Try a different search term or category.` 
                : 'No items available in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenuItems.map((menuItem, index) => {
              const fullImageUrl = menuItem.image
                ? menuItem.image.startsWith('http')
                  ? menuItem.image
                  : `${backendOrigin}${menuItem.image}`
                : null;

              const currentQuantity = getItemQuantity(menuItem.id);

              return (
                <motion.div
                  key={menuItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                    {fullImageUrl ? (
                      <img
                        src={fullImageUrl}
                        alt={menuItem.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.warn(`Failed to load image: ${fullImageUrl}`);
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/f5f5f5/a0aec0?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Utensils className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{menuItem.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{menuItem.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-medium text-[#ff6433] text-lg">{formatCurrency(menuItem.price)}</p>
                      
                      {/* Add Button / Quantity Controls */}
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
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Checkout Button */}
      {items.length > 0 && (
        <div className="sticky bottom-4 mx-auto w-full max-w-xl px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              size="lg"
              className="w-full shadow-lg bg-[#ff6433] hover:bg-[#e05a2d] rounded-xl py-6"
              onClick={handleViewOrder}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  <span>View Order ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                </div>
                <span className="font-semibold">{formatCurrency(totalAmount.toString())}</span>
              </div>
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Menu;
