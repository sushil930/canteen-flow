import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { ArrowLeft, Clock, Check, Home, Loader2, RefreshCw } from 'lucide-react';
import { useOrder, OrderItem } from '@/contexts/OrderContext'; // Adjusted import
import Header from '@/components/Header';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { format, parseISO } from 'date-fns'; // Import date-fns
import { Badge, BadgeProps } from '@/components/ui/badge'; // Import BadgeProps if needed for explicit typing
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Interface for the current order status details
interface CurrentOrderStatus {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  // Add other fields if needed
}

// Interface for items in the order history list
interface ApiOrderItem {
  id: number;
  menu_item: {
    id: number;
    name: string;
    price: string;
    description?: string;
    category?: string;
  };
  quantity: number;
  price: string;
}

// Interface for the full order history item from API
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
  const { orderId: paramOrderId } = useParams<{ orderId: string }>(); // Get orderId from URL params
  const { user } = useAuth();
  const { toast } = useToast();
  // Correct the function names here
  const { clearCart, addItem, setSelectedCanteenId } = useOrder(); 

  // Determine the current order ID (prefer URL param, fallback to session storage)
  const currentOrderId = paramOrderId || sessionStorage.getItem('currentOrderId');

  // Redirect if no current order ID
  useEffect(() => {
    if (!currentOrderId) {
      console.warn("No current order ID found, redirecting home.");
      navigate('/');
    }
  }, [currentOrderId, navigate]);

  // --- Fetch CURRENT Order Status --- 
  const { data: currentOrderData, isLoading: isLoadingCurrent, error: currentError, isError: isCurrentError } = useQuery<CurrentOrderStatus>({
    queryKey: ['orderStatus', currentOrderId],
    queryFn: () => apiClient<CurrentOrderStatus>(`/orders/${currentOrderId}/`),
    enabled: !!currentOrderId, // Only run if currentOrderId exists
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // --- Fetch Order HISTORY --- 
  const { data: historyOrders, isLoading: isLoadingHistory, error: historyError } = useQuery<OrderHistoryItem[]>({
    queryKey: ['orderHistory'],
    queryFn: () => apiClient<OrderHistoryItem[]>('/orders/'), // Endpoint for fetching all user orders
    enabled: !!user, // Only fetch if user is logged in
  });

  // Calculate progress and display status for the CURRENT order
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

  // --- Repeat Order Logic --- 
  const handleRepeatOrder = (order: OrderHistoryItem) => {
    clearCart(); // Use clearCart
    setSelectedCanteenId(order.canteen.id);
    order.items.forEach(apiItem => {
      const itemToAdd: OrderItem = { 
        menuItemId: apiItem.menu_item.id,
        quantity: apiItem.quantity,
        name: apiItem.menu_item.name,
        price: parseFloat(apiItem.menu_item.price),
      };
      addItem(itemToAdd); // Use addItem
    });
    navigate('/order-summary');
    toast({
      title: "Order Repeated",
      description: "Your previous order items have been added to your cart.",
    });
  };

  // --- Badge Variant Logic --- 
  // Update the return types to match valid Badge variants
  const getStatusBadgeVariant = (status: OrderHistoryItem['status']): BadgeProps['variant'] => {
    switch (status) {
      case 'COMPLETED':
      case 'READY':
        return 'default'; // Use 'default' (often styled as success) instead of 'success'
      case 'PROCESSING':
        return 'secondary'; // Use 'secondary' instead of 'warning'
      case 'PENDING':
        return 'secondary'; // Keep as 'secondary'
      case 'CANCELLED':
        return 'destructive'; // Keep as 'destructive'
      default:
        return 'outline'; // Keep as 'outline'
    }
  };

  const handleBack = () => {
    // Navigate back intelligently - maybe to menu or home?
    navigate(-1); // Go back one step in history
  };

  const handleNewOrder = () => {
    clearCart(); // Use clearCart
    navigate('/');
  };

  // Combined Loading State
  if (isLoadingCurrent && !currentOrderData) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-canteen-primary" /></div>;
  }

  // Combined Error State
  if (isCurrentError) {
    return <div className="p-4 text-red-600 bg-red-50 min-h-screen">Error loading current order status: {(currentError as Error)?.message}</div>;
  }

  // Redirect if no currentOrderId (redundant check, but safe)
  if (!currentOrderId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow canteen-container py-6 animate-fade-in space-y-8">
        {/* Back Button */} 
        <button onClick={handleBack} className="flex items-center text-gray-600">
          <ArrowLeft size={18} className="mr-1" />
          <span>Back</span>
        </button>

        {/* Current Order Status Section */} 
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Current Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Order ID:</span>
                <span>{currentOrderId}</span>
              </div>
            </div>
            <div className="mb-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-canteen-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                {/* Status Icon and Text Logic */} 
                {currentOrderData?.status === 'READY' || currentOrderData?.status === 'COMPLETED' ? (
                  <div className="flex items-center text-canteen-success"><Check size={20} className="mr-2" /><span className="font-bold text-lg">{displayStatus}</span></div>
                ) : currentOrderData?.status === 'CANCELLED' ? (
                  <div className="flex items-center text-red-600"><Clock size={20} className="mr-2" /><span className="font-bold text-lg">{displayStatus}</span></div>
                ) : (
                  <div className="flex items-center text-canteen-warning"><Clock size={20} className="mr-2" /><span className="font-bold text-lg">{displayStatus}</span></div>
                )}
              </div>
            </div>
            {/* Status Specific Messages */} 
            {currentOrderData?.status === 'READY' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center text-sm text-green-800">
                Your order is ready! Please proceed to the pickup counter.
              </div>
            )}
            {currentOrderData?.status === 'CANCELLED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center text-sm text-red-800">
                This order has been cancelled.
              </div>
            )}
            <div className="text-center">
              <Button onClick={handleNewOrder} variant="outline" size="sm">
                <Home size={16} className="mr-2" />
                <span>Return to Home</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order History Section */} 
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>View your past orders and reorder your favorites</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-canteen-primary" />
              </div>
            ) : historyError ? (
              <div className="p-4 text-red-600 bg-red-50 rounded-lg">
                Error loading order history: {(historyError as Error)?.message}
              </div>
            ) : historyOrders && historyOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Canteen</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{format(parseISO(order.created_at), "dd MMM yy, HH:mm")}</TableCell>
                      <TableCell>{order.canteen.name}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        {order.items.map(item => `${item.quantity}x ${item.menu_item.name}`).join(', ')}
                      </TableCell>
                      <TableCell>${parseFloat(order.total_price).toFixed(2)}</TableCell>
                      <TableCell>
                        {/* The Badge component will now receive a valid variant */}
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRepeatOrder(order)}
                          disabled={order.status === 'CANCELLED'}
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Repeat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                You haven't placed any orders yet.
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="text-center p-4 text-sm text-gray-500">
        <p>© 2025 Canteen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OrderStatus;
