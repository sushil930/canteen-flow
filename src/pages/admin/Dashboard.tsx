import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from 'recharts';
import { Clock, DollarSign, Package, Wallet, Users, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiAdminOrder, getStatusBadgeVariant } from './Orders';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Type for chart data points
interface OrdersByHourDataPoint {
  name: string; // e.g., "9AM"
  orders: number;
}
interface RevenueByDayDataPoint {
  name: string; // e.g., "Mon"
  revenue: number;
}

// Update DashboardStats type
interface DashboardStats {
  total_orders_today: number;
  total_revenue_today: number;
  average_order_value: number;
  pending_orders: number;
  total_customers: number;
  order_trend_percentage: number;
  revenue_trend_percentage: number;
  daily_orders_chart: OrdersByHourDataPoint[];
  weekly_revenue_chart: RevenueByDayDataPoint[];
}

// StatCard component (modified slightly for trends)
const StatCard = ({ title, value, icon: Icon, trendValue, trendUnit = '%', trendLabel = "from yesterday", color = "bg-canteen-primary/10 text-canteen-primary" }: {
  title: React.ReactNode;
  value: React.ReactNode;
  icon: React.ElementType;
  trendValue?: number | null; // Make trendValue optional
  trendUnit?: string;
  trendLabel?: string;
  color?: string;
}) => (
  <div className={`p-6 rounded-xl ${color} shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
        {trendValue !== undefined && trendValue !== null && (
          <p className="text-xs mt-2 font-medium flex items-center">
            <Activity size={12} className={`mr-1 ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`${trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue >= 0 ? '+' : ''}{trendValue}{trendUnit}
            </span>
            <span className="ml-1 opacity-70">{trendLabel}</span>
          </p>
        )}
      </div>
      <div className="bg-white p-3 rounded-full shadow-sm">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Fetch Dashboard Stats (no changes to hook itself)
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => apiClient<DashboardStats>('/admin/dashboard-stats/')
  });

  // --- Fetch Recent Orders ---
  const { data: recentOrders, isLoading: isLoadingOrders, error: ordersError } = useQuery<ApiAdminOrder[]>({
    queryKey: ['recentAdminOrders'],
    // Fetch latest 5 orders
    queryFn: () => apiClient<ApiAdminOrder[]>('/admin/orders/?limit=5&ordering=-created_at')
  });

  // Combined Loading/Error States
  if (isLoadingStats || isLoadingOrders) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-canteen-primary" /></div>;
  }
  const combinedError = statsError || ordersError;
  if (combinedError) {
    return <div className="text-red-600 p-4 bg-red-50 rounded-md">Error loading dashboard data: {(combinedError as Error).message}</div>;
  }
  if (!stats) {
    return <div className="p-4 text-gray-600">Could not load dashboard stats.</div>;
  }

  // Formatters
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the Canteen Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Today's Orders"
          value={stats.total_orders_today}
          icon={Package}
          trendValue={stats.order_trend_percentage}
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.total_revenue_today)}
          icon={DollarSign}
          trendValue={stats.revenue_trend_percentage}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="Average Order"
          value={formatCurrency(stats.average_order_value)}
          icon={Wallet}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending_orders}
          icon={Clock}
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Total Customers"
          value={stats.total_customers}
          icon={Users}
          color="bg-indigo-100 text-indigo-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-heading font-bold mb-4">Today's Orders by Hour</h2>
          <div className="h-80">
            {/* Check if data exists before rendering chart */}
            {stats.daily_orders_chart && stats.daily_orders_chart.length > 0 ? (
              <ChartContainer
                config={{ orders: { label: "Orders", color: "#FF6B35" } }}
              >
                <BarChart data={stats.daily_orders_chart}> {/* Use fetched data */}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" name="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No order data for today yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-heading font-bold mb-4">Weekly Revenue</h2>
          <div className="h-80">
            {/* Check if data exists before rendering chart */}
            {stats.weekly_revenue_chart && stats.weekly_revenue_chart.length > 0 ? (
              <ChartContainer
                config={{ revenue: { label: "Revenue", color: "#4CAF50" } }}
              >
                <LineChart data={stats.weekly_revenue_chart}> {/* Use fetched data */}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} /> {/* Format Y-axis ticks */}
                  <ChartTooltip
                    content={<ChartTooltipContent
                      formatter={(value) => formatCurrency(value as number)}
                    />}
                  />
                  <Line type="monotone" dataKey="revenue" name="revenue" stroke="var(--color-revenue)" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No revenue data for this week yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* --- Recent Orders Table --- */}
      <div>
        <h2 className="text-xl font-heading font-bold mb-4">Recent Orders</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {recentOrders && recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Canteen</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customer.username}</TableCell>
                    <TableCell>{order.canteen.name}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(order.total_amount))}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), 'Pp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center text-gray-500">No recent orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
