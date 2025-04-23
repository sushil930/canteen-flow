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
import { ThemeProvider } from "@/components/theme-provider";

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
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrderProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Customer routes */}
              <Route path="/" element={<Index />} />
              <Route path="/canteen/:canteenId/table" element={<TableSelection />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/order-summary" element={<OrderSummary />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/order-status" element={<OrderStatus />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Routes (Customer) */}
              <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                <Route path="/menu" element={<Menu />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                <Route path="/order-status/:orderId" element={<OrderStatus />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="menu" element={<MenuManagement />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
