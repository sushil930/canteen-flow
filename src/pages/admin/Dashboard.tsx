
import React from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from 'recharts';
import { Clock, DollarSign, Package, Wallet } from 'lucide-react';

// Mock data for charts
const dailyOrdersData = [
  { name: '9AM', orders: 4 },
  { name: '10AM', orders: 7 },
  { name: '11AM', orders: 13 },
  { name: '12PM', orders: 25 },
  { name: '1PM', orders: 20 },
  { name: '2PM', orders: 14 },
  { name: '3PM', orders: 8 },
  { name: '4PM', orders: 6 },
];

const revenueData = [
  { name: 'Mon', revenue: 520 },
  { name: 'Tue', revenue: 480 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 670 },
  { name: 'Fri', revenue: 820 },
  { name: 'Sat', revenue: 750 },
  { name: 'Sun', revenue: 600 },
];

const StatCard = ({ title, value, icon: Icon, trend, color = "bg-canteen-primary/10 text-canteen-primary" }) => (
  <div className={`p-6 rounded-xl ${color} shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
        {trend && (
          <p className="text-xs mt-2 font-medium">
            {trend}
          </p>
        )}
      </div>
      <div className="bg-white p-3 rounded-full">
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to the Canteen Admin Dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Orders"
          value="97"
          icon={Package}
          trend="+12% from yesterday"
        />
        <StatCard 
          title="Total Revenue"
          value="$1,270"
          icon={DollarSign}
          trend="+8% from yesterday"
          color="bg-green-100 text-green-700"
        />
        <StatCard 
          title="Average Order"
          value="$13.09"
          icon={Wallet}
          trend="-2% from yesterday"
          color="bg-blue-100 text-blue-700"
        />
        <StatCard 
          title="Peak Time"
          value="12:30 PM"
          icon={Clock}
          trend="30 orders in peak hour"
          color="bg-amber-100 text-amber-700"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-heading font-bold mb-4">Today's Orders by Hour</h2>
          <div className="h-80">
            <ChartContainer 
              config={{
                orders: { label: "Orders", color: "#FF6B35" }
              }}
            >
              <BarChart data={dailyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" name="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-heading font-bold mb-4">Weekly Revenue</h2>
          <div className="h-80">
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "#4CAF50" }
              }}
            >
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" name="revenue" stroke="var(--color-revenue)" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
