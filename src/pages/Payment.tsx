import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { OrderContext } from '@/contexts/OrderContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';

// Type for the order created response (matches OrderSerializer)
interface ApiOrder {
  id: number;
  // Add other fields from OrderSerializer if needed
}

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart, selectedCanteenId, tableNumber } = useContext(OrderContext);

  const placeOrderMutation = useMutation<ApiOrder, Error, { notes: string }>({
    mutationFn: async ({ notes }) => {
      if (!selectedCanteenId) {
        toast({ title: "Error", description: "No canteen selected.", variant: "destructive" });
        navigate('/');
        throw new Error("Canteen ID is missing");
      }
      if (items.length === 0) {
        toast({ title: "Error", description: "Your cart is empty.", variant: "destructive" });
        navigate('/menu');
        throw new Error("Cart is empty");
      }

      const orderPayload = {
        canteen: selectedCanteenId,
        table_number: tableNumber,
        notes: notes,
        items: items.map(item => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
        })),
      };

      return apiClient<ApiOrder>('/orders/', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });
    },
    onSuccess: (data) => {
      toast({ title: "Order Placed Successfully!", description: `Your order ID is ${data.id}` });
      const orderId = data.id;
      clearCart();
      sessionStorage.setItem('lastOrderId', orderId.toString());
      navigate(`/order-confirmation/${orderId}`);
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Could not place order.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    const notes = (document.getElementById('orderNotes') as HTMLTextAreaElement)?.value || '';
    placeOrderMutation.mutate({ notes });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Header />
        <p className="p-4 text-lg">Your cart is empty. Please add items from the menu.</p>
        <Button onClick={() => navigate('/menu')}>Go to Menu</Button>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Confirm Your Order</CardTitle>
            <CardDescription>Review your items and provide any special instructions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              {tableNumber && (
                <div className="flex justify-between font-medium">
                  <span>Table Number:</span>
                  <span>{tableNumber}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label htmlFor="orderNotes" className="font-semibold">Order Notes</label>
              <Textarea
                id="orderNotes"
                placeholder="Any special requests? E.g., less spicy, extra sauce..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Payment;
