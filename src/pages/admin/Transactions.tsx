
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar } from 'lucide-react';

// Mock data for transactions
const mockTransactions = [
  { 
    id: 'TXN-001', 
    orderId: 'ORD-001', 
    amount: 24.97, 
    status: 'Successful', 
    method: 'Credit Card',
    timestamp: '2025-04-11T12:31:00Z'
  },
  { 
    id: 'TXN-002', 
    orderId: 'ORD-002', 
    amount: 19.47, 
    status: 'Successful', 
    method: 'Debit Card',
    timestamp: '2025-04-11T12:16:00Z'
  },
  { 
    id: 'TXN-003', 
    orderId: 'ORD-003', 
    amount: 22.97, 
    status: 'Successful', 
    method: 'Mobile Payment',
    timestamp: '2025-04-11T12:11:00Z'
  },
  { 
    id: 'TXN-004', 
    orderId: 'ORD-004', 
    amount: 25.97, 
    status: 'Pending', 
    method: 'Credit Card',
    timestamp: '2025-04-11T12:41:00Z'
  },
  { 
    id: 'TXN-005', 
    orderId: 'ORD-005', 
    amount: 18.96, 
    status: 'Failed', 
    method: 'Credit Card',
    timestamp: '2025-04-11T12:36:00Z'
  },
  { 
    id: 'TXN-006', 
    orderId: 'ORD-005', 
    amount: 18.96, 
    status: 'Successful', 
    method: 'Mobile Payment',
    timestamp: '2025-04-11T12:39:00Z'
  }
];

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Successful':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-amber-100 text-amber-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    case 'Refunded':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
         date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate total revenue from successful transactions
  const totalRevenue = mockTransactions
    .filter(t => t.status === 'Successful')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">Monitor payment transactions and process refunds</p>
      </div>
      
      <div className="bg-canteen-primary/10 p-5 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-canteen-primary">Total Revenue</p>
            <h3 className="text-2xl font-bold text-canteen-primary mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Calendar size={16} />
            Today
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search transactions..." 
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
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
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
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{transaction.orderId}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell>{formatDateTime(transaction.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredTransactions.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No transactions matching your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
