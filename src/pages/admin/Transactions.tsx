import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Search, Loader2, ArrowUpDown, Banknote, Info } from 'lucide-react';
import { Infinity } from 'ldrs/react';
import 'ldrs/react/Infinity.css';

// Interfaces (assuming structure based on potential needs)
interface ApiOrderBrief {
  id: number;
  // Maybe add customer username if needed
}

type TransactionStatusType = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
type PaymentMethodType = 'CARD' | 'UPI' | 'WALLET' | 'CASH' | 'OTHER';

interface ApiTransaction {
  id: number;
  order: ApiOrderBrief;
  transaction_id: string; // e.g., Razorpay ID
  payment_method: PaymentMethodType;
  amount: string;
  status: TransactionStatusType;
  created_at: string;
  updated_at: string;
}

// Helper for status badges
const getTransactionStatusBadgeVariant = (status: TransactionStatusType): "default" | "secondary" | "outline" | "destructive" | "success" => {
  switch (status) {
    case 'PENDING': return 'outline';
    case 'SUCCESS': return 'success';
    case 'FAILED': return 'destructive';
    case 'REFUNDED': return 'secondary';
    default: return 'default';
  }
};

const getTransactionStatusColorClasses = (status: TransactionStatusType): string => {
  switch (status) {
    case 'PENDING': return 'border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'SUCCESS': return 'border-green-600/30 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'FAILED': return 'border-red-600/30 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'REFUNDED': return 'border-gray-600/30 bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    default: return 'border-gray-600/30 bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const TRANSACTION_STATUSES: TransactionStatusType[] = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
const PAYMENT_METHODS: PaymentMethodType[] = ['CARD', 'UPI', 'WALLET', 'CASH', 'OTHER'];

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatusType | null>(null);
  const [methodFilter, setMethodFilter] = useState<PaymentMethodType | null>(null);
  const [sortField, setSortField] = useState<string>('-created_at'); // Default sort by newest

  // --- Data Fetching ---
  const ADMIN_TRANSACTIONS_URL = '/admin/transactions/';

  const { data: transactionsData, isLoading, error } = useQuery<ApiTransaction[]>({
    queryKey: ['adminTransactions', statusFilter, methodFilter, searchTerm, sortField],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (methodFilter) params.append('payment_method', methodFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (sortField) params.append('ordering', sortField);
      
      const url = `${ADMIN_TRANSACTIONS_URL}?${params.toString()}`;
      return apiClient<ApiTransaction[]>(url);
    },
    placeholderData: (prev) => prev,
  });

  // --- Event Handlers ---
  const handleSort = (field: string) => {
    const newSortField = sortField === field ? `-${field}` : field;
    setSortField(newSortField);
  };

  // --- Render ---
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Infinity size="55" stroke="4" strokeLength="0.15" bgOpacity="0.1" speed="1.3" color="hsl(var(--primary))" />
        <p className="text-muted-foreground font-medium mt-4">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4 bg-destructive/10 rounded-md">Error loading transactions: {(error as Error).message}</div>;
  }

  const transactions = transactionsData || [];

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all payment transactions.</p>
        </div>
      </div>

      {/* Filters and Table Card */}
      <Card className="rounded-xl shadow-md border border-border/50">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-lg">All Transactions</CardTitle>
          {/* Filter Row */}
           <div className="flex flex-col md:flex-row flex-wrap gap-3 mt-3">
            <div className="relative w-full sm:w-auto md:flex-1 md:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search by Transaction ID, Order ID..."
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={(value) => setStatusFilter(value === 'all' ? null : value as TransactionStatusType)} value={statusFilter ?? 'all'}>
              <SelectTrigger className="w-full sm:w-auto h-9 md:w-[160px]">
                  <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {TRANSACTION_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setMethodFilter(value === 'all' ? null : value as PaymentMethodType)} value={methodFilter ?? 'all'}>
              <SelectTrigger className="w-full sm:w-auto h-9 md:w-[160px]">
                  <SelectValue placeholder="Filter by Method" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {PAYMENT_METHODS.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
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
                  <TableHead>
                     <Button variant="ghost" size="sm" onClick={() => handleSort('transaction_id')} className="px-1">
                      Transaction ID
                      {sortField.includes('transaction_id') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[90px]">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('order__id')} className="px-1">
                      Order ID
                      {sortField.includes('order__id') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" size="sm" onClick={() => handleSort('payment_method')} className="px-1">
                      Method
                      {sortField.includes('payment_method') && <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('amount')} className="px-1">
                      Amount
                       {sortField.includes('amount') && <ArrowUpDown className="ml-1 h-3 w-3" />}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs py-2 px-4 text-muted-foreground truncate max-w-[150px]" title={tx.transaction_id}>{tx.transaction_id}</TableCell>
                      <TableCell className="font-medium py-2 px-4">#{tx.order.id}</TableCell>
                      <TableCell className="py-2 px-4 text-muted-foreground">{tx.payment_method}</TableCell>
                      <TableCell className="py-2 px-4">${parseFloat(tx.amount).toFixed(2)}</TableCell>
                      <TableCell className="py-2 px-4">
                         <Badge 
                           variant={getTransactionStatusBadgeVariant(tx.status)} 
                           className={`text-xs ${getTransactionStatusColorClasses(tx.status)}`}
                         >
                          {tx.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right py-2 px-4 text-muted-foreground text-xs">
                        {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No transactions found matching your criteria.
                      {(searchTerm || statusFilter || methodFilter) && (
                         <Button variant="link" className="ml-2 text-sm" onClick={() => {setSearchTerm(''); setStatusFilter(null); setMethodFilter(null);}}>Clear filters</Button>
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
    </div>
  );
};

export default Transactions;
