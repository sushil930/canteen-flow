import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OrderType = 'dine-in' | 'pickup' | null;

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export interface OrderContextType {
  orderType: OrderType;
  selectedTable: number | null;
  orderItems: OrderItem[];
  orderStatus: string;
  selectedCanteenId: number | null;
  setOrderType: (type: OrderType) => void;
  setSelectedTable: (table: number | null) => void;
  setSelectedCanteenId: (id: number | null) => void;
  addItemToOrder: (item: MenuItem) => void;
  removeItemFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearOrder: () => void;
  setOrderStatus: (status: string) => void;
  totalPrice: number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orderType, setOrderType] = useState<OrderType>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<string>('Not Started');
  const [selectedCanteenId, setSelectedCanteenId] = useState<number | null>(null);

  const addItemToOrder = (item: MenuItem) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderStatus('Not Started');
    setSelectedTable(null);
    setSelectedCanteenId(null);
    setOrderType(null);
  };

  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <OrderContext.Provider
      value={{
        orderType,
        selectedTable,
        orderItems,
        orderStatus,
        selectedCanteenId,
        setOrderType,
        setSelectedTable,
        setSelectedCanteenId,
        addItemToOrder,
        removeItemFromOrder,
        updateItemQuantity,
        clearOrder,
        setOrderStatus,
        totalPrice
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
