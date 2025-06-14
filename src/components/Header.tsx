import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, LogOut, Settings, UtensilsCrossed,
  Menu, X, Home, CreditCard, History, ChevronDown,
  Clock, Bell, Search, MapPin 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Header: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { items, selectedCanteenId } = useOrder(); 
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isLandingPage = location.pathname === '/';

  // Track scroll position to add background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate cart count safely using 'items'
  const cartItemCount = Array.isArray(items) 
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0; 

  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Don't render header on admin pages
  if (isAdminPage) {
    return null;
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'G';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.username?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-200",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-sm" 
          : "bg-background/70 backdrop-blur-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 transition-all duration-200 hover:scale-105"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#ff6433] to-[#ff8c64] text-white">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg sm:inline-block bg-gradient-to-r from-[#ff6433] to-[#ff8c64] bg-clip-text text-transparent">
            Canteen Flow
          </span>
        </Link>

        {/* User Actions and Cart */}
        <div className="flex items-center justify-end space-x-1 md:space-x-2">
          {/* Cart Button */}
          {!isAuthPage && !isLandingPage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/payment">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-[#ff6433]/10 group rounded-full w-9 h-9"
                    >
                      <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <AnimatePresence>
                        {cartItemCount > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <Badge
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#ff6433] hover:bg-[#e55a2e]"
                            >
                              {cartItemCount}
                            </Badge>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Cart</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Auth Buttons / User Info */}
          {isAuthLoading ? (
            <Button variant="ghost" size="sm" disabled className="gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#ff6433] border-r-transparent"></span>
              Loading
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-[#ff6433]/10 transition-colors">
                  <Avatar className="h-7 w-7 border border-[#ff6433]/20">
                    <AvatarFallback className="bg-[#ff6433]/10 text-[#ff6433] text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.first_name || user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/order-status" className="w-full cursor-pointer">
                    <Clock className="mr-2 h-4 w-4 text-[#ff6433]" />
                    Current Orders
                  </Link>
                </DropdownMenuItem>
                {user.is_staff && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 text-[#ff6433]" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isAuthPage ? (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button size="sm" variant="outline" className="gap-2 hover:border-[#ff6433] hover:text-[#ff6433] transition-colors">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              {!isLandingPage && (
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="gap-2 hidden sm:flex bg-[#ff6433] hover:bg-[#e55a2e] transition-colors"
                  >
                    <span>Register</span>
                  </Button>
                </Link>
              )}
            </div>
          ) : null}

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden rounded-full w-9 h-9 hover:bg-[#ff6433]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b pb-4 px-4 pt-4">
                <SheetTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#ff6433]/10">
                      <UtensilsCrossed className="h-5 w-5 text-[#ff6433]" />
                    </div>
                    <span className="font-bold">Canteen Flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </SheetClose>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="px-2 py-4">
                {user && (
                  <div className="mb-4 pb-4 border-b flex items-center px-2">
                    <Avatar className="h-10 w-10 mr-3 border border-[#ff6433]/20">
                      <AvatarFallback className="bg-[#ff6433]/10 text-[#ff6433]">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {/* Only show cart in mobile menu if it has items */}
                  {cartItemCount > 0 && (
                    <SheetClose asChild>
                      <Link to="/payment">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-base py-6"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Cart
                          <Badge className="ml-auto bg-[#ff6433]">{cartItemCount}</Badge>
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                  
                  {user && user.is_staff && (
                    <SheetClose asChild>
                      <Link to="/admin/dashboard">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-base py-6"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </div>

              <SheetFooter className="px-4 pb-6 absolute bottom-0 w-full border-t pt-4">
                {user ? (
                  <Button onClick={handleLogout} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Link to="/login" className="w-full">
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/register" className="w-full">
                      <Button className="w-full bg-[#ff6433] hover:bg-[#e55a2e]">Register</Button>
                    </Link>
                  </div>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

