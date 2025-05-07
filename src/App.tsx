import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrderProvider } from "./contexts/OrderContext";
import Index from "./pages/Index";
import TableSelection from "./pages/TableSelection";
import Menu from "./pages/Menu";
import OrderSummary from "./pages/OrderSummary";
import Payment from "./pages/Payment";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderStatus from "./pages/OrderStatus";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Transactions from "./pages/admin/Transactions";
import MenuManagement from "./pages/admin/MenuManagement";
import Login from "./pages/admin/Login";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { getAuthToken } from './lib/api';
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
// Remove theme provider import
// Remove: import OrderHistory from './pages/OrderHistory';

const queryClient = new QueryClient();

// Admin route guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!getAuthToken();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Customer routes (Public) */}
            <Route path="/" element={<Index />} />
            <Route path="/canteen/:canteenId/table" element={<TableSelection />} />
            {/* Removed /menu from public routes as it should likely be protected */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Routes (Customer) */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="/menu" element={<Menu />} />
              <Route path="/order-summary" element={<OrderSummary />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              {/* OrderStatus now handles history, ensure param is optional or handled */}
              <Route path="/order-status/:orderId?" element={<OrderStatus />} /> 
              {/* Removed: <Route path="/order-history" element={<OrderHistory />} /> */}
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="menu" element={<MenuManagement />} />
              {/* Removed the duplicate OrderHistory route from admin section */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
