
import React, { useState } from 'react';
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
import { Search, Filter } from 'lucide-react';

// Mock data for orders
const mockOrders = [
  { 
    id: 'ORD-001', 
    items: ['Classic Burger x2', 'French Fries x1', 'Cola x2'],
    table: 'Table 3', 
    total: 24.97, 
    status: 'Preparing', 
    timestamp: '2025-04-11T12:30:00Z'
  },
  { 
    id: 'ORD-002', 
    items: ['Veggie Burger x1', 'Onion Rings x1', 'Lemonade x1'],
    table: 'Table 5', 
    total: 19.47, 
    status: 'Delivered', 
    timestamp: '2025-04-11T12:15:00Z'
  },
  { 
    id: 'ORD-003', 
    items: ['Cheese Burger x1', 'Caesar Salad x1', 'Chocolate Shake x1'],
    table: 'Pickup', 
    total: 22.97, 
    status: 'Ready for Pickup', 
    timestamp: '2025-04-11T12:10:00Z'
  },
  { 
    id: 'ORD-004', 
    items: ['Greek Salad x2', 'Chicken Wrap x1'],
    table: 'Table 1', 
    total: 25.97, 
    status: 'Pending', 
    timestamp: '2025-04-11T12:40:00Z'
  },
  { 
    id: 'ORD-005', 
    items: ['Veggie Wrap x2', 'Lemonade x2'],
    table: 'Pickup', 
    total: 18.96, 
    status: 'Preparing', 
    timestamp: '2025-04-11T12:35:00Z'
  }
];

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-800';
    case 'Preparing':
      return 'bg-blue-100 text-blue-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Ready for Pickup':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
         date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

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
          <select 
            className="bg-white border rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Delivered">Delivered</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Filter size={18} className="mr-2" />
            More Filters
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Table/Pickup</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {order.items[0]}
                    {order.items.length > 1 && ` +${order.items.length - 1} more`}
                  </div>
                </TableCell>
                <TableCell>{order.table}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(order.timestamp)}</TableCell>
                <TableCell>
                  <select 
                    className="bg-white border rounded-md px-2 py-1 text-sm"
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredOrders.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No orders matching your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
