
import { MenuItem } from '../context/OrderContext';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 8.99,
    image: '/burgers/classic.jpg',
    category: 'Burgers',
  },
  {
    id: '2',
    name: 'Cheese Burger',
    description: 'Our classic burger topped with melted cheddar cheese',
    price: 9.99,
    image: '/burgers/cheese.jpg',
    category: 'Burgers',
  },
  {
    id: '3',
    name: 'Veggie Burger',
    description: 'Plant-based patty with avocado and sprouts',
    price: 10.99,
    image: '/burgers/veggie.jpg',
    category: 'Burgers',
  },
  {
    id: '4',
    name: 'French Fries',
    description: 'Crispy golden fries served with ketchup',
    price: 3.99,
    image: '/sides/fries.jpg',
    category: 'Sides',
  },
  {
    id: '5',
    name: 'Onion Rings',
    description: 'Crispy battered onion rings with dipping sauce',
    price: 4.99,
    image: '/sides/onion-rings.jpg',
    category: 'Sides',
  },
  {
    id: '6',
    name: 'Cola',
    description: 'Refreshing cola with ice',
    price: 1.99,
    image: '/drinks/cola.jpg',
    category: 'Drinks',
  },
  {
    id: '7',
    name: 'Lemonade',
    description: 'Fresh squeezed lemonade',
    price: 2.49,
    image: '/drinks/lemonade.jpg',
    category: 'Drinks',
  },
  {
    id: '8',
    name: 'Chocolate Shake',
    description: 'Rich and creamy chocolate milkshake',
    price: 4.99,
    image: '/drinks/chocolate-shake.jpg',
    category: 'Drinks',
  },
  {
    id: '9',
    name: 'Caesar Salad',
    description: 'Crisp romaine with parmesan, croutons and Caesar dressing',
    price: 7.99,
    image: '/salads/caesar.jpg',
    category: 'Salads',
  },
  {
    id: '10',
    name: 'Greek Salad',
    description: 'Mixed greens, feta cheese, olives, and vinaigrette',
    price: 8.99,
    image: '/salads/greek.jpg',
    category: 'Salads',
  },
  {
    id: '11',
    name: 'Chicken Wrap',
    description: 'Grilled chicken, lettuce, and sauce in a tortilla wrap',
    price: 7.49,
    image: '/wraps/chicken.jpg',
    category: 'Wraps',
  },
  {
    id: '12',
    name: 'Veggie Wrap',
    description: 'Assorted vegetables and hummus in a tortilla wrap',
    price: 6.99,
    image: '/wraps/veggie.jpg',
    category: 'Wraps',
  }
];

export const categories = [
  { id: 'burgers', name: 'Burgers' },
  { id: 'sides', name: 'Sides' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'salads', name: 'Salads' },
  { id: 'wraps', name: 'Wraps' }
];

export const tables = [
  { id: 1, seats: 2, available: true },
  { id: 2, seats: 2, available: false },
  { id: 3, seats: 4, available: true },
  { id: 4, seats: 4, available: true },
  { id: 5, seats: 4, available: false },
  { id: 6, seats: 6, available: true },
  { id: 7, seats: 6, available: true },
  { id: 8, seats: 8, available: false }
];

// Mock function to simulate fetching menu items by category
export const getMenuItemsByCategory = (category: string) => {
  if (category === 'All') {
    return menuItems;
  }
  return menuItems.filter(item => item.category === category);
};

// Mock function to simulate fetching available tables
export const getAvailableTables = () => {
  return tables;
};

// Mock function to simulate payment processing
export const processPayment = async (amount: number) => {
  return new Promise<{ success: boolean, message: string }>((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // 90% success rate for demo purposes
      const success = Math.random() < 0.9;
      
      if (success) {
        resolve({ 
          success: true, 
          message: 'Payment processed successfully!' 
        });
      } else {
        resolve({ 
          success: false, 
          message: 'Payment failed. Please try again.' 
        });
      }
    }, 1500);
  });
};

// Mock function to get order status updates
export const getOrderStatus = async (orderId: string) => {
  const statuses = ['Preparing', 'Almost Ready', 'Ready for Pickup'];
  
  return new Promise<string>((resolve) => {
    // Simulate status progression based on time
    const now = new Date().getTime();
    const seed = parseInt(orderId, 36);
    const timeOffset = now + seed;
    
    // Determine status based on time
    const statusIndex = Math.floor((timeOffset / 10000) % statuses.length);
    
    setTimeout(() => {
      resolve(statuses[statusIndex]);
    }, 500);
  });
};

// Generate a random order ID
export const generateOrderId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
