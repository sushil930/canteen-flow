import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Search, Loader2, PackageOpen, ArrowUpDown, Eye } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Infinity } from 'ldrs/react';
import 'ldrs/react/Infinity.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

// Interfaces (assuming structure based on Dashboard and potential needs)
interface ApiCustomer {
  id: number;
  username: string;
  // Add other relevant customer fields if needed
}

interface ApiOrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  quantity: number;
  price: string; // Price at the time of order
}

interface ApiCanteen {
  id: number;
  name: string;
}

export type OrderStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'DELIVERED';

export interface ApiAdminOrder {
  id: number;
  customer: ApiCustomer;
  canteen: ApiCanteen;
  order_items: ApiOrderItem[];
  total_price: string;
  status: OrderStatusType;
  created_at: string;
  updated_at: string;
  // Add other fields like payment_method, table_number etc. if available
}

// Helper to get badge variant based on status
export const getStatusBadgeVariant = (status: OrderStatusType): "default" | "secondary" | "outline" | "destructive" => {
  switch (status) {
    case 'PENDING': return 'outline';
    case 'PROCESSING': return 'secondary';
    case 'COMPLETED': return 'default';
    case 'DELIVERED': return 'default';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
};

// Helper to get badge color classes
export const getStatusColorClasses = (status: OrderStatusType): string => {
  switch (status) {
    case 'PENDING': return 'border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'PROCESSING': return 'border-blue-600/30 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'COMPLETED':
    case 'DELIVERED': return 'border-green-600/30 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'CANCELLED': return 'border-red-600/30 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default: return 'border-gray-600/30 bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const ORDER_STATUSES: OrderStatusType[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'DELIVERED'];

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusType | null>(null);
  const [canteenFilter, setCanteenFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('-created_at'); // Default sort by newest
  const [selectedOrder, setSelectedOrder] = useState<ApiAdminOrder | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const ADMIN_ORDERS_URL = '/admin/orders/';

  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useQuery<ApiAdminOrder[]>({
    queryKey: ['adminOrders', statusFilter, canteenFilter, searchTerm, sortField],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (canteenFilter) params.append('canteen', canteenFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (sortField) params.append('ordering', sortField);
      
      const url = `${ADMIN_ORDERS_URL}?${params.toString()}`;
      return apiClient<ApiAdminOrder[]>(url);
    },
    placeholderData: (prev) => prev,
  });

  // Fetch canteens for filter dropdown
  const { data: canteens, isLoading: isLoadingCanteens } = useQuery<ApiCanteen[]>({ 
    queryKey: ['canteens'], 
    queryFn: () => apiClient<ApiCanteen[]>('/canteens/')
  });

  // --- Mutations ---
   const updateOrderStatus = useMutation<
    ApiAdminOrder,
    Error,
    { orderId: number; status: OrderStatusType }
  >({
    mutationFn: ({ orderId, status }) => 
        apiClient<ApiAdminOrder>(`${ADMIN_ORDERS_URL}${orderId}/update-status/`, { // Assuming specific endpoint
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
    onSuccess: (updatedOrder) => {
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
        // Optionally update the specific order in the cache for instant feedback
        queryClient.setQueryData<ApiAdminOrder[]>(['adminOrders', statusFilter, canteenFilter, searchTerm, sortField], (oldData) =>
            oldData?.map(order => order.id === updatedOrder.id ? updatedOrder : order)
        );
        toast({ title: "Success", description: `Order #${updatedOrder.id} status updated to ${updatedOrder.status}.` });
    },
    onError: (error) => {
        toast({ title: "Error", description: `Failed to update status: ${error.message}`, variant: "destructive" });
    },
});

  // --- Event Handlers ---
  const handleSort = (field: string) => {
    const newSortField = sortField === field ? `-${field}` : field;
    setSortField(newSortField);
  };

  const isLoading = isLoadingOrders || isLoadingCanteens;

  // --- Render ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Infinity size="55" stroke="4" strokeLength="0.15" bgOpacity="0.1" speed="1.3" color="hsl(var(--primary))" />
        <p className="text-muted-foreground font-medium mt-4">Loading orders...</p>
      </div>
    );
  }

  if (ordersError) {
    return <div className="text-destructive p-4 bg-destructive/10 rounded-md">Error loading orders: {(ordersError as Error).message}</div>;
  }

  const orders = ordersData || [];

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Order Management</h1>
          <p className="text-muted-foreground">View and manage customer orders.</p>
        </div>
        {/* Maybe add a refresh button or other actions here */}
      </div>

      {/* Filters and Table Card */}
      <Card className="rounded-xl shadow-md border border-border/50">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-lg">All Orders</CardTitle>
          {/* Filter Row */}
           <div className="flex flex-col md:flex-row gap-3 mt-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search by Order ID, Customer..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value) => setStatusFilter(value === 'all' ? null : value as OrderStatusType)} value={statusFilter ?? 'all'}>
              <SelectTrigger className="w-full md:w-[180px] h-9">
                  <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ORDER_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
              </SelectContent>
              </Select>
            <Select onValueChange={(value) => setCanteenFilter(value === 'all' ? null : value)} value={canteenFilter ?? 'all'}>
              <SelectTrigger className="w-full md:w-[180px] h-9">
                  <SelectValue placeholder="Filter by Canteen" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Canteens</SelectItem>
                  {(canteens ?? []).map(can => (
                  <SelectItem key={can.id} value={can.id.toString()}>{can.name}</SelectItem>
                  ))}
              </SelectContent>
           </Select>
           {/* Add Date Range Filter if needed */}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('id')} className="px-1">
                      Order ID
                      {sortField === 'id' && <ArrowUpDown className="ml-1 h-3 w-3" />} 
                      {sortField === '-id' && <ArrowUpDown className="ml-1 h-3 w-3" />} 
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" size="sm" onClick={() => handleSort('customer__username')} className="px-1">
                      Customer
                      {sortField.includes('customer') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" size="sm" onClick={() => handleSort('canteen__name')} className="px-1">
                      Canteen
                      {sortField.includes('canteen') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('total_price')} className="px-1">
                      Total
                       {sortField.includes('total_price') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" size="sm" onClick={() => handleSort('status')} className="px-1">
                      Status
                      {sortField === 'status' && <ArrowUpDown className="ml-1 h-3 w-3" />} 
                      {sortField === '-status' && <ArrowUpDown className="ml-1 h-3 w-3" />} 
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                     <Button variant="ghost" size="sm" onClick={() => handleSort('created_at')} className="px-1">
                      Date
                       {sortField.includes('created_at') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px] text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-2 px-4">#{order.id}</TableCell>
                      <TableCell className="py-2 px-4 text-muted-foreground">{order.customer.username}</TableCell>
                      <TableCell className="py-2 px-4 text-muted-foreground">{order.canteen.name}</TableCell>
                      <TableCell className="py-2 px-4">${parseFloat(order.total_price).toFixed(2)}</TableCell>
                      <TableCell className="py-2 px-4">
                         <Badge 
                           variant={getStatusBadgeVariant(order.status)} 
                           className={`text-xs ${getStatusColorClasses(order.status)}`}
                         >
                          {order.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right py-2 px-4 text-muted-foreground text-xs">
                        {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                       <TableCell className="text-right py-2 px-4">
                         <DialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                             <Eye size={16} />
                           </Button>
                         </DialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No orders found matching your criteria.
                      {(searchTerm || statusFilter || canteenFilter) && (
                         <Button variant="link" className="ml-2 text-sm" onClick={() => {setSearchTerm(''); setStatusFilter(null); setCanteenFilter(null);}}>Clear filters</Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {/* Add Pagination if needed */}
        {/* <CardFooter className="border-t p-4">
           Pagination Controls
        </CardFooter> */}
      </Card>

       {/* Order Details Dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
                Customer: {selectedOrder?.customer.username} | Canteen: {selectedOrder?.canteen.name}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="text-sm space-y-1">
                <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
                <p><strong>Date:</strong> {format(new Date(selectedOrder.created_at), 'PPP p')}</p>
                <p><strong>Total:</strong> ${parseFloat(selectedOrder.total_price).toFixed(2)}</p>
                <p><strong>Status:</strong> 
                  <Badge 
                    variant={getStatusBadgeVariant(selectedOrder.status)} 
                    className={`ml-2 text-xs ${getStatusColorClasses(selectedOrder.status)}`}
                  >
                   {selectedOrder.status}
                  </Badge>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Items Ordered:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {selectedOrder.order_items.map(item => (
                    <li key={item.id}>
                      {item.quantity} x {item.menu_item_name} (@ ${parseFloat(item.price).toFixed(2)} each)
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Status Update Section */}
              {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PROCESSING') && (
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-sm">Update Status:</h4>
                     <div className="flex gap-2">
                        {selectedOrder.status === 'PENDING' && (
                             <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateOrderStatus.mutate({ orderId: selectedOrder.id, status: 'PROCESSING' })}
                                disabled={updateOrderStatus.isPending}
                             >
                                {updateOrderStatus.isPending && updateOrderStatus.variables?.status === 'PROCESSING' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Mark as Processing
                             </Button>
                        )}
                         {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PROCESSING') && (
                            <Button 
                                size="sm" 
                                variant="default" // Or outline based on preference
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateOrderStatus.mutate({ orderId: selectedOrder.id, status: 'COMPLETED' })}
                                disabled={updateOrderStatus.isPending}
                            >
                                {updateOrderStatus.isPending && updateOrderStatus.variables?.status === 'COMPLETED' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Mark as Completed
                            </Button>
                        )}
                         <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateOrderStatus.mutate({ orderId: selectedOrder.id, status: 'CANCELLED' })}
                            disabled={updateOrderStatus.isPending}
                         >
                             {updateOrderStatus.isPending && updateOrderStatus.variables?.status === 'CANCELLED' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Cancel Order
                         </Button>
                     </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
