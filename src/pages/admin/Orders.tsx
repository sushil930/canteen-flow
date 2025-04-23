import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

// Type for order data from API (matches OrderSerializer)
interface ApiAdminOrderItem {
  id: number;
  menu_item: { id: number; name: string; }; // Simplified nested item
  quantity: number;
  price_at_time_of_order: string;
}

// EXPORT this interface
export interface ApiAdminOrder {
  id: number;
  customer: { username: string; email: string; };
  canteen: { id: number; name: string; };
  created_at: string;
  updated_at: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_price: string;
  notes: string | null;
  table_number: string | null;
  items: {
    id: number;
    menu_item: { id: number; name: string; price: string; };
    quantity: number;
    price: string;
  }[];
}

// Available statuses for dropdown/filtering
const ORDER_STATUSES: ApiAdminOrder['status'][] = [
  'PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'
];

export function getStatusBadgeVariant(status: ApiAdminOrder['status']): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'PENDING': return 'secondary';
    case 'PROCESSING': return 'secondary';
    case 'READY': return 'default';
    case 'COMPLETED': return 'default';
    case 'CANCELLED': return 'destructive';
    default: return 'outline';
  }
}

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Fetch Orders --- 
  const { data: ordersData, isLoading, error } = useQuery<ApiAdminOrder[]>({
    queryKey: ['adminOrders', statusFilter], // Refetch if filter changes
    queryFn: async () => {
      let url = '/admin/orders/';
      if (statusFilter !== 'All') {
        url += `?status=${statusFilter}`;
      }
      const data = await apiClient<ApiAdminOrder[]>(url);
      // TODO: Implement client-side search filtering for now
      if (searchTerm) {
        return data.filter(order => String(order.id).includes(searchTerm) ||
          order.customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.canteen.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return data;
    },
    // Consider keeping previous data while refetching based on filter
    // keepPreviousData: true, 
  });

  // --- Status Update Mutation --- 
  const updateOrderStatusMutation = useMutation<
    ApiAdminOrder,
    Error,
    { orderId: number; newStatus: ApiAdminOrder['status'] }
  >({
    mutationFn: ({ orderId, newStatus }) => {
      return apiClient<ApiAdminOrder>(`/admin/orders/${orderId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    },
    onSuccess: (updatedOrder) => {
      // Update the query cache directly for instant UI feedback
      queryClient.setQueryData<ApiAdminOrder[]>(['adminOrders', statusFilter], (oldData) =>
        oldData ? oldData.map(order => order.id === updatedOrder.id ? updatedOrder : order) : []
      );
      // Optionally invalidate to ensure consistency, though setQueryData might be enough
      // queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast({ title: "Success", description: `Order #${updatedOrder.id} status updated.` });
    },
    onError: (error, variables) => {
      toast({
        title: "Error",
        description: `Failed to update status for Order #${variables.orderId}: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  // Display loading/error states
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-canteen-primary" /></div>;
  }
  if (error) {
    return <div className="text-red-600 p-4 bg-red-50 rounded-md">Error loading orders: {(error as Error).message}</div>;
  }

  const orders = ordersData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all customer orders</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {ORDER_STATUSES.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter size={18} className="mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage customer orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading orders...</p>}
          {error && <p className="text-red-600">Error loading orders: {error.message}</p>}

          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Canteen</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customer.username}</TableCell>
                    <TableCell>{order.canteen.name}</TableCell>
                    <TableCell>{order.table_number || 'N/A'}</TableCell>
                    <TableCell>
                      {order.items.map(item => item.menu_item.name).join(', ')}
                    </TableCell>
                    <TableCell>${parseFloat(order.total_price).toFixed(2)}</TableCell>
                    <TableCell>{format(parseISO(order.created_at), "HH:mm dd/MM/yy")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => {
                          if (ORDER_STATUSES.includes(newStatus as ApiAdminOrder['status'])) {
                            updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              newStatus: newStatus as ApiAdminOrder['status']
                            });
                          }
                        }}
                        disabled={updateOrderStatusMutation.isPending && updateOrderStatusMutation.variables?.orderId === order.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !isLoading && <p>No orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
