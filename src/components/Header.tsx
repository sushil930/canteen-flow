import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, User, LogOut, Settings, UtensilsCrossed,
  Menu, X, Home, CreditCard, History, ChevronDown
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
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { OrderContext } from '@/contexts/OrderContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { items } = useContext(OrderContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
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

  // Main navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'Menu', path: '/menu', icon: <UtensilsCrossed className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 transition-transform hover:scale-105"
        >
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-primary to-primary-foreground text-white">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg sm:inline-block bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Canteen Flow
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hover:bg-primary/10 relative group",
                  location.pathname === item.path && "text-primary font-medium"
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Actions and Cart */}
        <div className="flex items-center justify-end space-x-2">
          {/* Cart Button */}
          {!isAuthPage && (
            <Link to="/payment">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 group"
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
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {cartItemCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </Link>
          )}

          {/* Auth Buttons / User Info */}
          {isAuthLoading ? (
            <Button variant="ghost" size="sm" disabled className="gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
              Loading
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                  <Avatar className="h-6 w-6 border border-primary/20">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
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
                  <Link to="/order-status" className="flex items-center cursor-pointer">
                    <History className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </Link>
                </DropdownMenuItem>
                {user.is_staff && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !isAuthPage ? (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button size="sm" variant="outline" className="gap-2 hover:border-primary hover:text-primary transition-colors">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="default" className="gap-2 hidden sm:flex">
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          ) : null}

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="border-b pb-4 mb-4">
                <SheetTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/10">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                    </div>
                    <span>Canteen Flow</span>
                  </div>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <SheetClose key={item.path} asChild>
                    <Link to={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          location.pathname === item.path && "bg-primary/10 text-primary"
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </Button>
                    </Link>
                  </SheetClose>
                ))}

                {!isAuthPage && (
                  <SheetClose asChild>
                    <Link to="/payment">
                      <Button variant="ghost" className="w-full justify-start">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                        {cartItemCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </SheetClose>
                )}

                {/* Mobile Auth */}
                {user ? (
                  <>
                    <div className="py-2 px-3 flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">{user.first_name || user.username}</div>
                    </div>
                    <SheetClose asChild>
                      <Link to="/order-status">
                        <Button variant="ghost" className="w-full justify-start">
                          <History className="h-4 w-4 mr-2" />
                          Order History
                        </Button>
                      </Link>
                    </SheetClose>
                    {user.is_staff && (
                      <SheetClose asChild>
                        <Link to="/admin/dashboard">
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : !isAuthPage ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <SheetClose asChild>
                      <Link to="/login">
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/register">
                        <Button className="w-full">
                          Register
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

