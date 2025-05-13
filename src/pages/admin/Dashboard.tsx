import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from 'recharts';
import { Clock, DollarSign, Package, Wallet, Users, Activity, TrendingUp, Calendar, ChevronUp, ChevronDown, Search, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiAdminOrder, getStatusBadgeVariant } from './Orders';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

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

const Plus = ({ size = 14, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Enhanced StatCard component with improved design to match other admin pages
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trendValue, 
  trendUnit = '%', 
  trendLabel = "from yesterday", 
  variant = "default"
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  icon: React.ElementType;
  trendValue?: number | null;
  trendUnit?: string;
  trendLabel?: string;
  variant?: "default" | "green" | "blue" | "amber" | "purple"
}) => {
  // Define variant-based styling
  const variants = {
    default: {
      icon: "text-canteen-primary bg-canteen-primary/10",
      border: "border-l-canteen-primary",
    },
    green: {
      icon: "text-emerald-600 bg-emerald-50",
      border: "border-l-emerald-500",
    },
    blue: {
      icon: "text-blue-600 bg-blue-50",
      border: "border-l-blue-500",
    },
    amber: {
      icon: "text-amber-600 bg-amber-50",
      border: "border-l-amber-500",
    },
    purple: {
      icon: "text-purple-600 bg-purple-50",
      border: "border-l-purple-500",
    }
  };
  
  const style = variants[variant];

  return (
    <Card className={`border border-l-[3px] ${style.border} shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            {trendValue !== undefined && trendValue !== null && (
              <div className="flex mt-3 items-center">
                {trendValue >= 0 ? (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <ChevronUp size={12} className="mr-1" />
                    {trendValue}{trendUnit}
                  </span>
                ) : (
                  <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <ChevronDown size={12} className="mr-1" />
                    {Math.abs(trendValue)}{trendUnit}
                  </span>
                )}
                <span className="ml-2 text-xs text-muted-foreground">{trendLabel}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${style.icon}`}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-canteen-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }
  
  const combinedError = statsError || ordersError;
  if (combinedError) {
    return (
      <div className="mx-auto max-w-2xl mt-16 p-6 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
        <div className="text-destructive mb-2 text-lg font-semibold">Error loading dashboard data</div>
        <p className="text-destructive/90">{(combinedError as Error).message}</p>
        <Button variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="mx-auto max-w-xl mt-16 p-6 bg-muted rounded-lg border text-center">
        <p className="text-muted-foreground">Could not load dashboard stats.</p>
      </div>
    );
  }

  // Formatters
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-canteen-primary">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Welcome back! Here's a quick overview of your canteen's performance.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 h-9 rounded-full bg-background" />
          </div>
          <Button size="sm" className="h-9 bg-canteen-primary hover:bg-canteen-primary/90 rounded-full whitespace-nowrap">
            <Plus size={14} className="mr-1.5" />
            New Order
          </Button>
        </div>
      </div>
      
      {/* Date Info - moved slightly */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 border-t pt-4">
        <Calendar size={14} />
        <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Today's Orders"
          value={stats.total_orders_today}
          icon={Package}
          trendValue={stats.order_trend_percentage}
          variant="default"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.total_revenue_today)}
          icon={DollarSign}
          trendValue={stats.revenue_trend_percentage}
          variant="green"
        />
        <StatCard
          title="Average Order"
          value={formatCurrency(stats.average_order_value)}
          icon={Wallet}
          variant="blue"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending_orders}
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Total Customers"
          value={stats.total_customers}
          icon={Users}
          variant="purple"
        />
      </div>

      {/* Charts and Recent Orders Section */}      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts Section */}      
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="orders">Today's Orders</TabsTrigger>
              <TabsTrigger value="revenue">Weekly Revenue</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-0">
              <Card className="rounded-xl shadow-md border border-border/50">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Order Activity</CardTitle>
                    <Button variant="outline" size="sm" className="h-8">View Details</Button>
                  </div>
                  <CardDescription className="text-xs">Number of orders received throughout the day</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] p-2">
                  {stats.daily_orders_chart && stats.daily_orders_chart.length > 0 ? (
                    <div className="w-full h-full">
                      <ChartContainer
                        config={{ orders: { label: "Orders", color: "hsl(var(--primary))" } }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.daily_orders_chart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `${value}`} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent
                                indicator="dot"
                                labelClassName="font-medium"
                                className="rounded-lg border bg-background p-2 shadow-sm"
                              />}
                            />
                            <Bar
                              dataKey="orders"
                              name="orders"
                              fill="hsl(var(--primary))"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                      <Package size={32} className="text-muted-foreground/70 mb-2" />
                      <p className="text-sm font-medium">No order data for today yet</p>
                      <p className="text-xs mt-1">Orders will appear here as they come in</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="revenue" className="mt-0">
              <Card className="rounded-xl shadow-md border border-border/50">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
                    <Button variant="outline" size="sm" className="h-8">Export</Button>
                  </div>
                  <CardDescription className="text-xs">Weekly revenue performance</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] p-2">
                  {stats.weekly_revenue_chart && stats.weekly_revenue_chart.length > 0 ? (
                    <div className="w-full h-full">
                      <ChartContainer
                        config={{ revenue: { label: "Revenue", color: "hsl(142.1 76.2% 36.3%)" } }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.weekly_revenue_chart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value}`} />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent
                                indicator="line"
                                labelClassName="font-medium"
                                className="rounded-lg border bg-background p-2 shadow-sm"
                                formatter={(value) => formatCurrency(value as number)}
                              />}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              name="revenue"
                              stroke="hsl(142.1 76.2% 36.3%)" /* Tailwind green-600 */
                              strokeWidth={2}
                              dot={{ r: 4, fill: 'hsl(142.1 76.2% 36.3%)', strokeWidth: 1, stroke: 'hsl(var(--background))' }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                      <DollarSign size={32} className="text-muted-foreground/70 mb-2" />
                      <p className="text-sm font-medium">No revenue data for this week yet</p>
                      <p className="text-xs mt-1">Revenue will be tracked as orders are completed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Orders Section */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl shadow-md border border-border/50 h-full">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-canteen-primary hover:text-canteen-primary/90 hover:bg-canteen-primary/10 rounded-md">
                  View All <ArrowRight size={14} />
                </Button>
              </div>
              <CardDescription className="text-xs">Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders && recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="text-sm">
                    <TableHeader>
                      {/* Reduced header padding */}
                      <TableRow>
                        <TableHead className="w-[60px] px-2 py-2">ID</TableHead>
                        <TableHead className="px-2 py-2">Customer</TableHead>
                        <TableHead className="px-2 py-2 text-right">Total</TableHead>
                        <TableHead className="px-2 py-2 text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-canteen-muted/60">
                          {/* Reduced cell padding */}
                          <TableCell className="font-medium px-2 py-2">#{order.id}</TableCell>
                          <TableCell className="px-2 py-2 truncate max-w-[100px]">{order.customer.username}</TableCell>
                          <TableCell className="font-medium px-2 py-2 text-right">{formatCurrency(parseFloat(order.total_price))}</TableCell>
                          <TableCell className="px-2 py-2 text-right">
                            <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                              {order.status}
                            </Badge>
                          </TableCell>
                          {/* Removed Canteen and Time for brevity */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Package size={32} className="text-muted-foreground/70 mx-auto mb-2" />
                  <h3 className="text-sm font-medium">No recent orders</h3>
                  <p className="text-xs text-muted-foreground mt-1">New orders will appear here.</p>
                </div>
              )}
            </CardContent>
            {/* Footer might be redundant if View All exists */}
            {/* <CardFooter className="border-t py-2 px-4 text-xs text-muted-foreground">
              Updated {format(new Date(), 'h:mm a')}
            </CardFooter> */}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
