import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import { BarChart3, Home, Menu as MenuIcon, Receipt, Package, LogOut, User, Settings, ChevronDown, Bell, Search, Users, ShoppingBag, Tag, Coffee, ChevronRight, HelpCircle, Info, Layers, LayoutGrid } from 'lucide-react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiClient, removeAuthToken } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setSidebarOpen(true);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout/', {
        method: 'POST',
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      removeAuthToken();
      navigate('/admin/login');
    }
  };

  // Get initials from user's name or username
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || 'A';
  };

  // Determine active route
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar className="border-r flex flex-col bg-gradient-to-b from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 shadow-sm">
          {/* Sidebar Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                <Coffee size={20} />
              </div>
              {sidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Canteen Admin
                  </span>
                  <span className="text-xs text-gray-500">Management Portal</span>
                </div>
              )}
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          <SidebarContent className="flex-1 overflow-y-auto">
            {/* Search */}
            {sidebarOpen && (
              <div className="px-3 pt-4 pb-2">
                <div className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none w-full focus:outline-none text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Overview Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Overview
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            className={isActive('/admin') && !isActive('/admin/orders') && !isActive('/admin/transactions') && !isActive('/admin/menu') 
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400 border-l-2 border-indigo-500' 
                              : ''}
                          >
                            <Link to="/admin" className="flex items-center">
                              <LayoutGrid size={19} className="mr-2" />
                              <span>Dashboard</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Dashboard
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            className={isActive('/admin/analytics') 
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400 border-l-2 border-indigo-500' 
                              : ''}
                          >
                            <Link to="/admin/analytics" className="flex items-center">
                              <BarChart3 size={19} className="mr-2" />
                              <span>Analytics</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Analytics
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Operations Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Operations
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            className={isActive('/admin/orders') 
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400 border-l-2 border-indigo-500' 
                              : ''}
                          >
                            <Link to="/admin/orders" className="flex items-center">
                              <Package size={19} className="mr-2" />
                              <span>Orders</span>
                              <Badge className="ml-auto bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-medium" variant="outline">
                                12
                              </Badge>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Orders
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            className={isActive('/admin/transactions') 
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400 border-l-2 border-indigo-500' 
                              : ''}
                          >
                            <Link to="/admin/transactions" className="flex items-center">
                              <Receipt size={19} className="mr-2" />
                              <span>Transactions</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Transactions
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Catalog Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Catalog
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            asChild 
                            className={isActive('/admin/menu') 
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-400 border-l-2 border-indigo-500' 
                              : ''}
                          >
                            <Link to="/admin/menu" className="flex items-center">
                              <MenuIcon size={19} className="mr-2" />
                              <span>Menu Items</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Menu Items
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link to="/admin/categories" className="flex items-center">
                              <Tag size={19} className="mr-2" />
                              <span>Categories</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Categories
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {/* Users Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Users
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link to="/admin/customers" className="flex items-center">
                              <Users size={19} className="mr-2" />
                              <span>Customers</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Customers
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <SidebarMenuItem>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link to="/admin/staff" className="flex items-center">
                              <User size={19} className="mr-2" />
                              <span>Staff</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                          Staff
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  </TooltipProvider>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          {/* Sidebar Footer */}
          <div className="mt-auto border-t dark:border-gray-700 pt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin/help" className={`flex items-center px-3 py-2 mx-3 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${!sidebarOpen ? 'justify-center' : ''}`}>
                    <HelpCircle size={18} className={!sidebarOpen ? '' : 'mr-2'} />
                    {sidebarOpen && <span>Help & Support</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                  Help & Support
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full justify-${!sidebarOpen ? 'center' : 'start'} gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 mx-3 text-sm my-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md`}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className={!sidebarOpen ? '' : 'mr-2'} />
                    {sidebarOpen && <span>Logout</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className={!sidebarOpen ? "block" : "hidden"}>
                  Logout
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {sidebarOpen && (
              <div className="px-4 py-3 text-xs text-gray-400 border-t dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span>v1.0.0</span>
                  <span>© {new Date().getFullYear()}</span>
                </div>
              </div>
            )}
          </div>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm flex items-center px-6">
            <div className="flex-1 flex justify-between items-center">
              <div>
                {/* Mobile menu button can be added here */}
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full relative">
                  <Bell size={18} className="text-gray-500" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700">{getInitials()}</AvatarFallback>
                      </Avatar>
                      {user?.first_name && (
                        <span className="text-sm font-medium">
                          {user.first_name}
                        </span>
                      )}
                      <ChevronDown size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
