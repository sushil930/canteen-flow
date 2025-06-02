import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Check, Home, Loader2, RefreshCw } from 'lucide-react';
import { useOrder, OrderItem } from '@/contexts/OrderContext';
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Interface for the current order status details
interface CurrentOrderStatus {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}

// Re-added ApiOrderItem and OrderHistoryItem interfaces
interface ApiOrderItem {
  id: number;
  menu_item: {
    id: number;
    name: string;
    price: string;
    description?: string;
    category?: string;
    image_url?: string; // For item image
  };
  quantity: number;
  price: string;
}

interface OrderHistoryItem {
  id: number;
  created_at: string;
  updated_at: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_price: string;
  notes: string | null;
  table_number: string | null;
  canteen: {
    id: number;
    name: string;
  };
  items: ApiOrderItem[];
}

const OrderStatus = () => {
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { clearCart, addItem, setSelectedCanteenId } = useOrder();

  const currentOrderId = paramOrderId || sessionStorage.getItem('currentOrderId');

  useEffect(() => {
    if (!currentOrderId && !user) {
      console.warn("No current order ID or user found, redirecting home.");
      navigate('/');
    }
  }, [currentOrderId, user, navigate]);

  const { data: currentOrderData, isLoading: isLoadingCurrent, error: currentError, isError: isCurrentError } = useQuery<CurrentOrderStatus>({
    queryKey: ['orderStatus', currentOrderId],
    queryFn: () => apiClient<CurrentOrderStatus>(`/orders/${currentOrderId}/`),
    enabled: !!currentOrderId,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const { data: historyOrders, isLoading: isLoadingHistory, error: historyError } = useQuery<OrderHistoryItem[]>({
    queryKey: ['orderHistory'],
    queryFn: () => apiClient<OrderHistoryItem[]>('/orders/'),
    enabled: !!user,
  });

  const { displayStatus, progress } = useMemo(() => {
    if (!currentOrderData) return { displayStatus: 'Loading...', progress: 0 };
    switch (currentOrderData.status) {
      case 'PENDING': return { displayStatus: 'Pending Confirmation', progress: 10 };
      case 'PROCESSING': return { displayStatus: 'Preparing Your Order', progress: 40 };
      case 'READY': return { displayStatus: 'Ready for Pickup', progress: 100 };
      case 'COMPLETED': return { displayStatus: 'Order Completed', progress: 100 };
      case 'CANCELLED': return { displayStatus: 'Order Cancelled', progress: 0 };
      default: return { displayStatus: 'Unknown Status', progress: 0 };
    }
  }, [currentOrderData]);

  const handleRepeatOrder = (order: OrderHistoryItem) => {
    clearCart();
    setSelectedCanteenId(order.canteen.id);
    order.items.forEach(apiItem => {
      const itemToAdd: OrderItem = {
        menuItemId: apiItem.menu_item.id,
        quantity: apiItem.quantity,
        name: apiItem.menu_item.name,
        price: parseFloat(apiItem.menu_item.price),
      };
      addItem(itemToAdd);
    });
    navigate('/order-summary');
    toast({
      title: "Order Repeated",
      description: "Your previous order items have been added to your cart.",
    });
  };

  const getStatusBadgeVariant = (status: OrderHistoryItem['status']): BadgeProps['variant'] => {
    switch (status) {
      case 'COMPLETED':
      case 'READY':
        return 'default';
      case 'PROCESSING':
        return 'secondary';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleNewOrder = () => {
    clearCart();
    navigate('/');
  };

  if (isLoadingCurrent && !currentOrderData && !historyOrders) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-canteen-primary" /></div>;
  }

  if (isCurrentError && !currentOrderId) {
    return <div className="p-4 text-red-600 bg-red-50 min-h-screen">Error loading current order status: {(currentError as Error)?.message}</div>;
  }
  
  if (!currentOrderId && !user && !isLoadingCurrent && !isLoadingHistory) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 animate-fade-in flex flex-col items-center justify-center">
          <div className="text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-semibold text-gray-700 mb-2">No Order Selected</h1>
            <p className="text-gray-500 mb-6">Please select an order to view its status or log in to see your history.</p>
            <Button onClick={() => navigate('/')}><Home size={16} className="mr-2" /> Go to Homepage</Button>
          </div>
        </main>
        <footer className="text-center p-4 text-sm text-gray-500 border-t bg-white">
          <p>© 2025 Canteen. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
          
          {currentOrderId && (
            <section className="lg:w-1/3 space-y-6">
              <button onClick={handleBack} className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 lg:mb-0">
                <ArrowLeft size={16} className="mr-1.5" />
                <span>Back</span>
              </button>
              
              {isLoadingCurrent && !currentOrderData && <div className="flex justify-center items-center py-12"><Loader2 className="h-10 w-10 animate-spin text-canteen-primary" /></div>}
              {isCurrentError && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow"><p className="font-bold">Error Loading Order</p><p>{(currentError as Error)?.message}</p></div>}
              {currentOrderData && (
                <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <CardHeader className="bg-gray-50 p-6">
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">Your Current Order</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-semibold text-md">Order ID:</span>
                      <span className="font-mono text-md bg-gray-100 px-2 py-1 rounded">{currentOrderId}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-canteen-primary transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex items-center justify-center">
                        {currentOrderData?.status === 'READY' || currentOrderData?.status === 'COMPLETED' ? (
                          <div className="flex items-center text-green-600"><Check size={24} className="mr-2" /><span className="font-semibold text-xl">{displayStatus}</span></div>
                        ) : currentOrderData?.status === 'CANCELLED' ? (
                          <div className="flex items-center text-red-600"><Clock size={24} className="mr-2" /><span className="font-semibold text-xl">{displayStatus}</span></div>
                        ) : (
                          <div className="flex items-center text-yellow-600"><Clock size={24} className="mr-2" /><span className="font-semibold text-xl">{displayStatus}</span></div>
                        )}
                      </div>
                    </div>
                    {currentOrderData?.status === 'READY' && (
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-md p-4 text-sm text-green-700">
                        <p className="font-medium">Your order is ready! Please proceed to the pickup counter.</p>
                      </div>
                    )}
                    {currentOrderData?.status === 'PROCESSING' && (
                         <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-md p-4 text-sm text-yellow-700">
                            <p className="font-medium">We're preparing your order. It will be ready soon!</p>
                         </div>
                    )}
                    {currentOrderData?.status === 'PENDING' && (
                         <div className="bg-blue-50 border-l-4 border-blue-500 rounded-md p-4 text-sm text-blue-700">
                            <p className="font-medium">Your order is pending confirmation. We'll notify you shortly.</p>
                         </div>
                    )}
                    {currentOrderData?.status === 'CANCELLED' && (
                      <div className="bg-red-50 border-l-4 border-red-500 rounded-md p-4 text-sm text-red-700">
                        <p className="font-medium">This order has been cancelled.</p>
                      </div>
                    )}
                    <div className="text-center pt-2">
                      <Button onClick={handleNewOrder} variant="outline" className="border-canteen-primary text-canteen-primary hover:bg-canteen-primary/10">
                        <Home size={16} className="mr-2" />
                        <span>Start New Order</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          )}

          {user && (
            <section className={`lg:w-2/3 ${!currentOrderId ? 'lg:w-full' : ''} space-y-6`}>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-semibold text-gray-700">Order History</h2>
                <p className="text-sm text-gray-500">View your past orders and reorder your favorites.</p>
              </div>

              {isLoadingHistory && <div className="flex justify-center items-center py-12"><Loader2 className="h-10 w-10 animate-spin text-canteen-primary" /></div>}
              {historyError && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow"><p className="font-bold">Error Loading History</p><p>{(historyError as Error)?.message}</p></div>}
              
              {historyOrders && historyOrders.length > 0 && (
                <div className="space-y-6"> 
                  {historyOrders.map((order) => (
                    <Card key={order.id} className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden flex flex-col">
                      <CardHeader className="pb-4 pt-5 px-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-bold text-canteen-primary">Order #{order.id}</CardTitle>
                            <p className="text-xs text-gray-500">
                              {format(parseISO(order.created_at), "dd MMM yyyy, p")}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                            {order.status.toLowerCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 py-4 space-y-4 text-sm flex-grow">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="font-medium text-gray-600">Canteen:</span>
                          <span className="text-gray-800 text-right">{order.canteen.name}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="font-medium text-gray-600">Total:</span>
                          <span className="font-semibold text-gray-800">₹{parseFloat(order.total_price).toFixed(2)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 mb-2 text-xs sm:text-sm">Items:</p>
                          <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {order.items.map(item => (
                              <li key={item.id} className="flex items-center space-x-2 text-xs text-gray-700">
                                {item.menu_item.image_url && (
                                  <img 
                                    src={item.menu_item.image_url} 
                                    alt={item.menu_item.name} 
                                    className="w-10 h-10 object-cover rounded-md shadow-sm"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                  />
                                )}
                                <span className="flex-grow">
                                  {item.quantity}x {item.menu_item.name}
                                </span>
                                <span className="text-gray-600 font-medium whitespace-nowrap">
                                  ₹{parseFloat(item.price).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {order.table_number && (
                           <div className="flex justify-between text-xs pt-1">
                             <span className="font-medium text-gray-500">Table:</span>
                             <span className="text-gray-700">{order.table_number}</span>
                           </div>
                        )}
                         {order.notes && (
                           <div className="text-xs pt-1">
                             <p className="font-medium text-gray-500 mb-0.5">Notes:</p>
                             <p className="text-gray-700 bg-gray-50 p-2 rounded italic text-xs">
                               {order.notes} 
                             </p>
                           </div>
                        )}
                      </CardContent>
                      <div className="px-5 py-4 bg-gray-50/70 border-t mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-canteen-primary text-canteen-primary hover:bg-canteen-primary hover:text-white transition-colors"
                          onClick={() => handleRepeatOrder(order)}
                          disabled={order.status === 'CANCELLED'}
                        >
                          <RefreshCw size={14} className="mr-2" />
                          Repeat Order
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {historyOrders && historyOrders.length === 0 && !isLoadingHistory && (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-3 text-lg font-medium text-gray-700">No Orders Yet</p>
                  <p className="mt-1 text-sm text-gray-500">You haven't placed any orders. Start by exploring our menu!</p>
                  <Button onClick={handleNewOrder} className="mt-6 bg-canteen-primary hover:bg-canteen-primary/90">
                     <Home size={16} className="mr-2" /> Start New Order
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-gray-500 border-t bg-white">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrderStatus;
