import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Building, ArrowRight, Coffee, ShoppingBag, ChevronRight, ArrowDown, Users, CalendarClock, Star, Bell, Heart, ThumbsUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { OrderContext } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

interface ApiCanteen {
  id: number;
  name: string;
  description: string;
}

// Landing page component for visitors
const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Track scroll position for floating navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      
      {/* Floating Navbar - appears when scrolling down */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200/20 shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: scrollPosition > 200 ? 0 : -100,
          opacity: scrollPosition > 200 ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-gradient-to-tr from-[#ff6433] to-[#ff8c64] text-white">
              <Utensils className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-[#ff6433] to-[#ff8c64] bg-clip-text text-transparent">
              Canteen Flow
            </span>
          </div>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {['How It Works', 'Benefits', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm text-gray-600 hover:text-[#ff6433] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-[#ff6433] hover:bg-[#fff3ee] hidden sm:flex"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              size="sm"
              className="bg-[#ff6433] hover:bg-[#e55a2e] text-white px-3 py-1 h-8 rounded-lg text-sm"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf7] via-[#fff8f5] to-[#ffefea] py-20 md:py-28 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-[30%] h-[40%] rounded-full bg-gradient-to-br from-[#ff6433]/20 to-[#ff8c64]/10 blur-3xl"></div>
          <div className="absolute top-[60%] -left-[5%] w-[25%] h-[30%] rounded-full bg-gradient-to-tl from-[#ff6433]/10 to-[#ff9f7f]/5 blur-3xl"></div>
          <motion.div 
            initial={{ opacity: 0.5 }}
            animate={{ 
              opacity: [0.5, 0.7, 0.5],
              y: [0, 15, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut" 
            }}
            className="absolute bottom-[10%] right-[15%] w-[20%] h-[25%] rounded-full bg-gradient-to-r from-[#ff8c64]/30 to-[#ffba8c]/20 blur-3xl"
          />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff6433' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '20px 20px'
            }}>
          </div>
          
          {/* Food-themed decorative icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute top-[20%] left-[10%] text-[#ff6433]/30 transform rotate-12"
          >
            <Coffee className="h-12 w-12" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ delay: 1.3, duration: 1 }}
            className="absolute bottom-[20%] left-[25%] text-[#ff6433]/20 transform -rotate-12"
          >
            <Utensils className="h-10 w-10" />
          </motion.div>
        </div>

        <div className="container px-4 mx-auto max-w-7xl z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-8 lg:gap-16">
            <div className="md:w-1/2 mb-0">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="mb-6"
                >
                  <span className="bg-gradient-to-r from-[#fff3ee] to-[#ffeadf] text-[#ff6433] rounded-full py-2.5 px-5 text-sm font-semibold inline-block mb-5 shadow-sm border border-[#ff6433]/10">
                    A tastier way to order campus food
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <span className="bg-gradient-to-r from-[#ff6433] to-[#ff8c64] bg-clip-text text-transparent">
                    Streamlined
                  </span>
                  <span className="block mt-1 text-gray-800">food ordering for your campus</span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg text-gray-600 mb-8 max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  Skip the long queues and order your favorite meal in advance. 
                  Our canteen ordering system makes campus life 
                  <span className="text-[#ff6433] font-medium"> easier and more delicious</span>.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-[#ff6433] to-[#ff7e56] hover:from-[#e55a2e] hover:to-[#e76e4b] text-white px-6 py-3 h-auto text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => navigate('/login')}
                  >
                    Get Started <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[#ff6433] text-[#ff6433] hover:bg-[#fff3ee] px-6 py-3 h-auto text-base rounded-xl transition-all duration-300 hover:border-[#ff7e56] hover:-translate-y-1"
                    onClick={() => navigate('/register')}
                  >
                    Create Account
                  </Button>
                </motion.div>
                
                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="mt-12 flex items-center gap-3 text-gray-500"
                >
                  <div className="flex -space-x-2">
                    {[
                      'https://randomuser.me/api/portraits/women/44.jpg',
                      'https://randomuser.me/api/portraits/men/32.jpg',
                      'https://randomuser.me/api/portraits/women/53.jpg',
                      'https://randomuser.me/api/portraits/men/81.jpg',
                    ].map((src, i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden">
                        <img src={src} alt="User" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-[#ff6433] text-white flex items-center justify-center text-xs font-medium border-2 border-white">
                      +2K
                    </div>
                  </div>
                  <p className="text-sm">
                    Joined by <span className="font-medium text-gray-700">2,000+ students</span> on campus
                  </p>
                </motion.div>
              </motion.div>
            </div>
            
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.5,
                  ease: "easeOut" 
                }}
                className="relative"
              >
                {/* Main image with elevated design */}
                <div className="bg-white p-3 rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Delicious Food" 
                    className="w-full h-auto rounded-xl shadow-sm"
                  />
                  
                  {/* Interactive order overlay */}
                  <motion.div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 w-48 md:w-56 hover:scale-105 transition-transform duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[#fff3ee] rounded-full flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 text-[#ff6433]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Your Order</h4>
                        <p className="text-xs text-gray-500">Ready in 15 mins</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Floating rating badge */}
                <motion.div 
                  className="absolute -bottom-5 -right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.6 }}
                  whileHover={{ 
                    y: -5, 
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="relative">
                      <Star className="h-5 w-5 fill-green-500 text-green-500" />
                      <motion.div 
                        className="absolute inset-0 opacity-50"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Star className="h-5 w-5 fill-green-500 text-green-500" />
                      </motion.div>
                    </div>
                    <span className="font-bold">4.9</span>
                    <span className="text-gray-500 text-sm">Average Rating</span>
                  </div>
                </motion.div>
                
                {/* Floating notification badge */}
                <motion.div 
                  className="absolute -top-2 -left-6 bg-white p-2 rounded-lg shadow-lg border border-gray-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  whileHover={{ 
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-blue-50 rounded-full flex items-center justify-center">
                      <Bell className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Order Alert</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features/How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <svg 
            className="absolute right-0 top-0 h-[150%] w-[150%] text-[#fff8f5] transform translate-x-1/2 -translate-y-1/4 opacity-70"
            xmlns="http://www.w3.org/2000/svg" 
            fill="currentColor"
            viewBox="0 0 200 200"
          >
            <path d="M141.9,106.9c16.7,23.8,27.1,54.4,11.8,71.2C137.4,194.8,96.3,197.9,63,186.7C29.7,175.5,4.2,150-10.5,120.4c-14.7-29.6-18.6-63.2-3-83.8C2.2,15.9,37.4,9.4,70.9,9.4c33.6,0,65.5,6.5,81.5,26.4C168.3,55.7,125.2,83.2,141.9,106.9z" />
          </svg>
          <svg 
            className="absolute left-0 bottom-0 h-[150%] w-[150%] text-[#fff8f5] transform -translate-x-1/2 translate-y-1/4 opacity-70"
            xmlns="http://www.w3.org/2000/svg" 
            fill="currentColor"
            viewBox="0 0 200 200"
          >
            <path d="M38.8,75.4c11.2-26.8,39.2-46,67.3-44.7c28.1,1.3,56.3,23.2,69.8,55.4c13.5,32.2,12.4,74.6-9.1,96.6c-21.4,22-63.2,23.5-96.9,7.4c-33.7-16.1-59.5-49.8-52.7-76C23,88.9,27.7,102.1,38.8,75.4z" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <span className="inline-block px-4 py-1.5 bg-[#fff3ee] text-[#ff6433] rounded-full text-sm font-medium">
                Easy as 1-2-3
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Our platform makes ordering food from your campus canteens quick and easy, saving you time and hassle.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-16 relative">
            {/* Connecting line */}
            <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ff6433]/20 to-transparent hidden md:block"></div>
            
            {[
              { 
                icon: <Coffee className="h-8 w-8 text-white" />, 
                title: "Browse Menu",
                description: "Explore food options from all campus canteens in one place, filter by preferences, and find exactly what you crave.",
                color: "from-[#ff6433] to-[#ff8c64]",
                delay: 0
              },
              { 
                icon: <ShoppingBag className="h-8 w-8 text-white" />, 
                title: "Place Order",
                description: "Select your items, customize as needed, and place your order in seconds with our streamlined checkout process.",
                color: "from-[#2563eb] to-[#4f86ff]",
                delay: 0.15
              },
              { 
                icon: <Utensils className="h-8 w-8 text-white" />, 
                title: "Pick Up Ready",
                description: "Skip the line and collect your order when it's ready. Get notifications when your food is being prepared and completed.",
                color: "from-[#16a34a] to-[#4ade80]",
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-white p-8 md:p-10 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 h-full flex flex-col transition-all duration-300"
                >
                  <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg transform transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <div className="relative mb-4">
                    <span className="absolute -left-4 -top-4 text-6xl font-bold text-gray-100 select-none">
                      {index + 1}
                    </span>
                    <h3 className="text-xl lg:text-2xl font-bold mb-3 relative">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
          
          {/* Call to action button */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-sm"
              onClick={() => navigate('/register')}
            >
              Start your journey <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gradient-to-b from-white to-[#fff8f5] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#ff6433]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-500/5 rounded-full blur-3xl"></div>
          
          {/* Floating icons for visual interest */}
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, 5, 0],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
            className="absolute top-[20%] right-[15%] text-[#ff6433]/10"
          >
            <Star className="h-24 w-24" />
          </motion.div>
          
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -5, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 10,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-[20%] left-[10%] text-blue-500/10"
          >
            <Users className="h-16 w-16" />
          </motion.div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-4"
            >
              <span className="inline-block px-4 py-1.5 bg-[#ff6433]/10 text-[#ff6433] rounded-full text-sm font-medium">
                Why Choose Us
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 relative inline-block">
              Elevate Your Campus <span className="text-[#ff6433]">Dining Experience</span>
              <motion.div 
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-1 w-24 bg-[#ff6433]/20 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: 100 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Our platform offers numerous benefits designed to enhance your campus dining experience and make your day more delicious.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <CalendarClock className="h-10 w-10 text-[#ff6433]" />, 
                title: "Save Time",
                description: "No more waiting in long queues during busy hours. Order ahead and pick up when it's ready.",
                color: "bg-[#fff3ee]",
                borderColor: "border-[#ff6433]/20",
                hoverColor: "group-hover:text-[#ff6433]",
                delay: 0
              },
              { 
                icon: <Users className="h-10 w-10 text-blue-500" />, 
                title: "Group Orders",
                description: "Easily coordinate orders with friends for pickup. Split the bill directly through the app.",
                color: "bg-blue-50",
                borderColor: "border-blue-200/20",
                hoverColor: "group-hover:text-blue-500",
                delay: 0.1
              },
              { 
                icon: <Star className="h-10 w-10 text-amber-500" />, 
                title: "Rate & Review",
                description: "Provide feedback to help improve canteen services and find the highest-rated dishes.",
                color: "bg-amber-50",
                borderColor: "border-amber-200/20", 
                hoverColor: "group-hover:text-amber-500",
                delay: 0.2
              },
              { 
                icon: <ArrowDown className="h-10 w-10 text-green-500" />, 
                title: "Special Discounts",
                description: "Access to exclusive deals and campus promotions, with loyalty rewards for regular orders.",
                color: "bg-green-50",
                borderColor: "border-green-200/20",
                hoverColor: "group-hover:text-green-500",
                delay: 0.3
              }
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: benefit.delay }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className={`bg-white p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl border ${benefit.borderColor} h-full transition-all duration-300 flex flex-col`}>
                  <div className={`h-16 w-16 md:h-20 md:w-20 rounded-xl ${benefit.color} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    {benefit.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${benefit.hoverColor}`}>{benefit.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  
                  {/* Animated indicator on hover */}
                  <div className="mt-auto pt-4 overflow-hidden h-6">
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 flex items-center text-sm font-medium">
                      <span className={benefit.hoverColor}>Learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Statistics section */}
          <motion.div 
            className="mt-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "15+", label: "Campus Canteens", color: "text-[#ff6433]" },
                { value: "2.5k+", label: "Happy Students", color: "text-blue-500" },
                { value: "98%", label: "Satisfaction Rate", color: "text-green-500" },
                { value: "10k+", label: "Monthly Orders", color: "text-amber-500" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center"
                >
                  <motion.p 
                    className={`text-3xl md:text-4xl font-bold ${stat.color}`}
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 10,
                      delay: 0.1 + index * 0.1
                    }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-gray-500 text-sm md:text-base">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section id="contact" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff6433] to-[#ff8c64]">
          {/* Animated wave pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute w-full h-full">
              <motion.path 
                fill="#ffffff" 
                fillOpacity="1" 
                d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,181.3C672,171,768,181,864,186.7C960,192,1056,192,1152,186.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                animate={{
                  d: [
                    "M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,181.3C672,171,768,181,864,186.7C960,192,1056,192,1152,186.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                    "M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,170.7C672,160,768,192,864,197.3C960,203,1056,181,1152,176C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 20,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute right-10 bottom-10 w-24 h-24 rounded-full bg-white opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute left-1/4 top-10 w-16 h-16 rounded-full bg-white opacity-10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white/10 backdrop-blur-sm w-max mx-auto rounded-full px-5 py-1.5 text-white/80 text-sm font-medium mb-6">
              Ready to transform your campus dining?
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white drop-shadow-sm">
              Start ordering smarter today
            </h2>
            <p className="text-white/90 mb-10 max-w-2xl mx-auto text-lg">
              Join thousands of students and staff who are already enjoying the convenience of our canteen ordering system. No more waiting in long lines!
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button 
                className="bg-white text-[#ff6433] hover:bg-gray-100 px-6 py-3 h-auto text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 backdrop-blur-sm"
                onClick={() => navigate('/register')}
              >
                Create Free Account
              </Button>
              <Button 
                variant="outline" 
                className="border-white/60 text-white hover:bg-white/20 px-6 py-3 h-auto text-base rounded-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </motion.div>
            
            {/* Trust badges */}
            <motion.div 
              className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6 text-white/80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Quick Ordering</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>2,000+ Active Users</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Highly Rated</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-16 bg-gray-50 border-t border-gray-100 relative overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff6433' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '16px 16px'
          }}>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="flex justify-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-tr from-[#ff6433] to-[#ff8c64] text-white shadow-lg">
                <Utensils className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-[#ff6433] to-[#ff8c64] bg-clip-text text-transparent">
                Canteen Flow
              </span>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Product</h3>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Testimonials', 'Use Cases'].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1 }}
                      className="text-gray-600 hover:text-[#ff6433] transition-colors"
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Resources</h3>
              <ul className="space-y-2">
                {['Help Center', 'API Documentation', 'Blog', 'Careers'].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                  >
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1 }}
                      className="text-gray-600 hover:text-[#ff6433] transition-colors"
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Company</h3>
              <ul className="space-y-2">
                {['About Us', 'Contact', 'Partners', 'News'].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  >
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1 }}
                      className="text-gray-600 hover:text-[#ff6433] transition-colors"
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Legal</h3>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  >
                    <motion.a 
                      href="#" 
                      whileHover={{ scale: 1.1 }}
                      className="text-gray-600 hover:text-[#ff6433] transition-colors"
                    >
                      {item}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Feedback Section Integrated into Footer */}
          <div className="my-6">
            <FeedbackSection />
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 Canteen Flow. All rights reserved.</p>
            <div className="flex space-x-6">
              {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((platform, i) => (
                <motion.a 
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="text-gray-400 hover:text-[#ff6433] text-sm transition-colors"
                >
                  {platform}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// NEW FeedbackSection Component
const FeedbackSection = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSetRating = (rate: number) => {
    setRating(rate);
    if (!submitted) setSubmitted(true);
  };

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto px-4 max-w-md text-center">
        {!submitted ? (
          <>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="text-xl font-semibold text-gray-700 mb-3"
            >
              Rate Your Experience
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-7 w-7 cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-110 ${ 
                      (hoverRating || rating) >= star
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleSetRating(star)}
                  />
                ))}
              </div>
              {rating > 0 && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-500 mt-1"
                >
                  You rated: {rating} out of 5
                </motion.p>
              )}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="py-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200, damping: 10 }}
            >
              <ThumbsUp className="h-12 w-12 text-[#ff6433] mx-auto mb-4" />
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-2xl font-semibold text-gray-700 mb-2"
            >
              Thank You!
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-gray-500 text-sm max-w-xs mx-auto"
            >
              Your feedback is appreciated!
            </motion.p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Main canteen selection screen (existing functionality)
const CanteenSelectionPage = () => {
  const navigate = useNavigate();
  const { setSelectedCanteenId } = useContext(OrderContext);

  const canteensQuery = useQuery<ApiCanteen[], Error>({
    queryKey: ['canteens'],
    queryFn: () => apiClient<ApiCanteen[]>('/canteens/'),
  });

  const handleSelectCanteen = (canteenId: number) => {
    setSelectedCanteenId(canteenId);
    navigate(`/canteen/${canteenId}/table`);
  };

  if (canteensQuery.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">Loading canteens...</p>
      </div>
    );
  }

  if (canteensQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="bg-red-50 rounded-xl p-6 shadow-sm max-w-md w-full text-center mb-4">
          <p className="text-red-600 font-medium mb-4">Something went wrong while loading canteens.</p>
          <button
            onClick={() => canteensQuery.refetch()}
            className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!canteensQuery.data || canteensQuery.data.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="bg-gray-50 rounded-xl p-8 shadow-sm max-w-md w-full text-center">
          <p className="text-gray-700 font-medium">No canteens available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 text-gray-800">
      <Header />

      <main className="flex-grow flex flex-col items-center px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12 max-w-2xl"
        >
          <div className="mb-4 flex justify-center">
            <span className="inline-block px-4 py-1.5 bg-[#fff3ee] text-[#ff6433] rounded-full text-sm font-medium">
              Hungry? We've got you covered
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#ff6433]">
            Welcome to <span className="text-gray-800">Canteen</span>
          </h1>
          <p className="text-lg text-gray-600 mx-auto max-w-xl">
            Fast, fresh and delicious food at your fingertips. 
            Select a canteen to begin your culinary journey.
          </p>
        </motion.div>

        <div className="w-full max-w-xl space-y-5 mb-10">
          {canteensQuery.data.map((canteen, index) => (
            <motion.div
              key={canteen.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 * index }}
            >
              <button
                onClick={() => handleSelectCanteen(canteen.id)}
                className="w-full bg-white rounded-xl p-6 shadow hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center group hover:border-[#ff6433]/20"
              >
                <div className="h-14 w-14 rounded-xl bg-[#fff3ee] flex items-center justify-center mr-5 group-hover:bg-[#ffebe3] transition-colors">
                  <Building className="h-7 w-7 text-[#ff6433]" />
                </div>

                <div className="flex-grow text-left">
                  <h2 className="text-xl font-semibold">{canteen.name}</h2>
                  <p className="text-gray-500 text-sm line-clamp-1 mt-1">{canteen.description || 'No description available'}</p>
                </div>

                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-[#ff6433] transition-colors">
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
        >
          {[
            { 
              icon: <Coffee className="h-6 w-6 text-[#ff6433]" />, 
              title: "Quality Food",
              description: "Enjoy fresh and delicious meals prepared with the finest ingredients."
            },
            { 
              icon: <ShoppingBag className="h-6 w-6 text-[#ff6433]" />, 
              title: "Easy Ordering",
              description: "Our streamlined process makes ordering your favorite meals quick and simple."
            },
            { 
              icon: <Utensils className="h-6 w-6 text-[#ff6433]" />, 
              title: "Fast Service",
              description: "Skip the line and have your order ready when you arrive."
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="h-12 w-12 rounded-full bg-[#fff3ee] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-100 mt-10">
        <div className="max-w-5xl mx-auto px-4">
          <p className="mb-2">© 2025 Canteen. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-xs">
            <a href="#" className="hover:text-[#ff6433]">Privacy Policy</a>
            <a href="#" className="hover:text-[#ff6433]">Terms of Service</a>
            <a href="#" className="hover:text-[#ff6433]">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index = () => {
  const { user } = useAuth();
  
  // Show landing page for non-logged-in users, and canteen selection for logged-in users
  return user ? <CanteenSelectionPage /> : <LandingPage />;
};

export default Index;
