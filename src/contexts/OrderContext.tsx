import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';

interface OrderItem {
    menuItemId: number;
    quantity: number;
    name: string;
    price: number;
}

interface OrderContextProps {
    selectedCanteenId: number | null;
    setSelectedCanteenId: (id: number | null) => void;
    tableNumber: string | null;
    setTableNumber: (table: string | null) => void;
    items: OrderItem[];
    addItem: (item: OrderItem) => void;
    removeItem: (menuItemId: number) => void;
    updateQuantity: (menuItemId: number, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
}

export const OrderContext = createContext<OrderContextProps | undefined>(undefined);

interface OrderProviderProps {
    children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [selectedCanteenId, setSelectedCanteenIdState] = useState<number | null>(() => {
        const storedCanteenId = sessionStorage.getItem('selectedCanteenId');
        return storedCanteenId ? parseInt(storedCanteenId, 10) : null;
    });
    const [tableNumber, setTableNumberState] = useState<string | null>(() => {
        return sessionStorage.getItem('tableNumber');
    });
    const [items, setItems] = useState<OrderItem[]>(() => {
        const storedItems = sessionStorage.getItem('cartItems');
        return storedItems ? JSON.parse(storedItems) : [];
    });

    useEffect(() => {
        if (selectedCanteenId !== null) {
            sessionStorage.setItem('selectedCanteenId', selectedCanteenId.toString());
        } else {
            sessionStorage.removeItem('selectedCanteenId');
        }
    }, [selectedCanteenId]);

    useEffect(() => {
        if (tableNumber !== null) {
            sessionStorage.setItem('tableNumber', tableNumber);
        } else {
            sessionStorage.removeItem('tableNumber');
        }
    }, [tableNumber]);

    useEffect(() => {
        sessionStorage.setItem('cartItems', JSON.stringify(items));
    }, [items]);

    const setSelectedCanteenId = (id: number | null) => {
        setSelectedCanteenIdState(id);
    };

    const setTableNumber = (table: string | null) => {
        setTableNumberState(table);
    };

    const addItem = (newItem: OrderItem) => {
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(
                item => item.menuItemId === newItem.menuItemId
            );

            if (existingItemIndex > -1) {
                // Item exists, update quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + newItem.quantity, // Add new quantity (usually 1)
                };
                return updatedItems;
            } else {
                // Item does not exist, add it
                return [...prevItems, newItem];
            }
        });
    };

    const removeItem = (menuItemId: number) => {
        setItems(prevItems => prevItems.filter(item => item.menuItemId !== menuItemId));
        console.log(`Placeholder: Remove item ${menuItemId}`);
        // We'll need a more complete implementation later if needed
    };

    const updateQuantity = (menuItemId: number, quantity: number) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.menuItemId === menuItemId
                    ? { ...item, quantity: Math.max(0, quantity) } // Ensure quantity doesn't go below 0
                    : item
            ).filter(item => item.quantity > 0) // Remove item if quantity is 0
        );
        console.log(`Placeholder: Update item ${menuItemId} to quantity ${quantity}`);
        // We'll need a more complete implementation later
    };

    const clearCart = () => {
        setItems([]);
        // Optionally clear table number too?
        // setTableNumberState(null);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    };

    const value = {
        selectedCanteenId,
        setSelectedCanteenId,
        tableNumber,
        setTableNumber,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}; 