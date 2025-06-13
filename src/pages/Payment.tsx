import React, { useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay'; 
import { OrderContext, OrderItem as ContextOrderItem } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';

// Define structure for backend verification payload
interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  local_order_details: {
    canteen: number | null;
    table_number: string | null;
    items: { menu_item_id: number; quantity: number }[];
    total_price: number;
    notes: string;
  };
}

// Define structure for backend verification response
interface VerifyPaymentResponse {
  success: boolean;
  orderId?: number;
}

// Define structure for create Razorpay order response
interface CreateRazorpayOrderResponse {
  order_id: string;
}


const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart, selectedCanteenId, tableNumber } = useContext(OrderContext);
  const { user, isGuest } = useAuth();
  const { Razorpay: RazorpayCheckout, isLoading: isRazorpayLoading, error: razorpayHookError } = useRazorpay(); 
  const queryClient = useQueryClient();
  const [orderNotes, setOrderNotes] = useState('');
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // --- Mutations (createRazorpayOrderMutation, verifyPaymentMutation) remain the same --- 
  const createRazorpayOrderMutation = useMutation<CreateRazorpayOrderResponse, Error, { amount: number }>({ 
    mutationFn: async ({ amount }) => {
        if (isGuest) {
            // Mock creating a Razorpay order for guests
            toast({ title: "Guest Mode", description: "Simulating payment initiation..." });
            return Promise.resolve({ order_id: `guest_order_${Date.now()}` });
        }
      return apiClient<CreateRazorpayOrderResponse>('/payment/create-razorpay-order/', {
        method: 'POST',
        body: JSON.stringify({ amount: Math.round(amount * 100) }), 
      });
    },
    onError: (error) => {
      console.error("Error creating Razorpay order:", error);
      toast({ title: "Payment Error", description: `Could not initiate payment: ${error.message}`, variant: "destructive" });
    }
  });

  const verifyPaymentMutation = useMutation<VerifyPaymentResponse, Error, VerifyPaymentPayload>({ 
    mutationFn: async (paymentData) => {
        if (isGuest) {
            // Mock payment verification for guests
            toast({ title: "Guest Mode", description: "Simulating payment verification..." });
            const mockOrderId = Math.floor(Math.random() * 100000);
            return Promise.resolve({ success: true, orderId: mockOrderId });
        }
      return apiClient<VerifyPaymentResponse>('/payment/verify-payment/', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    },
    onSuccess: (data) => {
      if (data.success && data.orderId) {
        toast({ title: "Payment Successful", description: "Your order has been placed." });
        sessionStorage.setItem('currentOrderId', String(data.orderId)); 
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['orders'] }); 
        navigate(`/order-confirmation/${data.orderId}`);
      } else {
        throw new Error('Payment verification failed on backend.');
      }
    },
    onError: (error) => {
      console.error("Error verifying payment:", error);
      toast({ title: "Payment Verification Failed", description: `Your payment could not be verified: ${error.message}. Please contact support.`, variant: "destructive" });
    }
  });

  // --- Payment Success Handler (using useCallback) ---
  const handlePaymentSuccess = useCallback((response: any) => {
    const totalAmount = getTotalPrice(); 
    const localOrderDetails = {
      canteen: selectedCanteenId,
      table_number: tableNumber,
      items: items.map(item => ({ menu_item_id: item.menuItemId, quantity: item.quantity })),
      total_price: totalAmount,
      notes: orderNotes,
    };
    verifyPaymentMutation.mutate({
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
      local_order_details: localOrderDetails
    });
  }, [items, selectedCanteenId, tableNumber, orderNotes, getTotalPrice, verifyPaymentMutation]); 

   const handlePaymentError = useCallback((error: any) => {
    console.error("Razorpay Payment Failed:", error);
    // Check if error.error exists (Razorpay's detailed error structure)
    const description = error.error && error.error.description 
        ? error.error.description 
        : (error.reason || 'An error occurred during payment.');
    const code = error.error && error.error.code ? error.error.code : 'N/A';
    
    toast({ 
      title: "Payment Failed", 
      description: `${description} (Code: ${code})`, 
      variant: "destructive",
      duration: 7000
    });
  }, [toast]); 

  // --- MODIFIED: Handle Initiate Payment function ---
  const handlePayment = async () => {
    if (isGuest) {
        // Simulate the entire payment flow for guests
        const totalAmount = getTotalPrice();
        const mockPaymentData: VerifyPaymentPayload = {
            razorpay_payment_id: `guest_payment_${Date.now()}`,
            razorpay_order_id: `guest_order_${Date.now()}`,
            razorpay_signature: 'guest_signature',
            local_order_details: {
                canteen: selectedCanteenId,
                table_number: tableNumber,
                items: items.map(item => ({ menu_item_id: item.menuItemId, quantity: item.quantity })),
                total_price: totalAmount,
                notes: orderNotes,
            }
        };
        verifyPaymentMutation.mutate(mockPaymentData);
        return;
    }
    if (isRazorpayLoading) {
      toast({ title: "Payment Gateway Loading", description: "Please wait for the payment gateway to finish loading.", variant: "default" });
      return;
    }
    if (razorpayHookError) {
      toast({ title: "Payment Gateway Error", description: `Could not load payment gateway: ${razorpayHookError}`, variant: "destructive" });
      return;
    }
    if (!RazorpayCheckout) {
      toast({ title: "Payment Gateway Unavailable", description: "The payment gateway is currently not available. Please try again later.", variant: "destructive" });
      return;
    }
    if (!razorpayKeyId) {
      toast({ title: "Configuration Error", description: "Payment gateway is not configured.", variant: "destructive" });
      return;
    }
    if (!selectedCanteenId) {
        toast({ title: "Error", description: "No canteen selected.", variant: "destructive" });
        navigate('/'); 
        return;
    }
    if (items.length === 0) {
        toast({ title: "Error", description: "Your cart is empty.", variant: "destructive" });
        navigate('/menu'); 
        return;
    }

    const totalAmount = getTotalPrice();

    try {
      const razorpayOrder = await createRazorpayOrderMutation.mutateAsync({ amount: totalAmount });
      const razorpayOrderId = razorpayOrder.order_id;

      const options: RazorpayOrderOptions = {
        key: razorpayKeyId,
        amount: (totalAmount * 100),
        currency: "INR",
        name: "Canteen Order Flow",
        description: `Order for Table ${tableNumber || 'N/A'}`, 
        order_id: razorpayOrderId,
        handler: handlePaymentSuccess,
        modal: {
           ondismiss: () => {
             console.log('Checkout form closed');
           }
        },
        prefill: user ? {
          name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username,
          email: user.email,
        } : {
          name: 'Guest User',
          email: 'guest@example.com'
        },
        notes: { 
          canteenId: selectedCanteenId?.toString(),
          tableNumber: tableNumber?.toString(),
        } as any,
        theme: {
          color: "#ff6433"
        }
      };
      
      try {
        const rzpInstance = new RazorpayCheckout(options);
        rzpInstance.on('payment.failed', handlePaymentError);
        rzpInstance.open();
      } catch (hookError) {
          console.error("Error opening Razorpay checkout:", hookError);
          toast({ title: "Payment Error", description: "Could not open payment window.", variant: "destructive" });
      }

    } catch (error) {
      console.error("Payment initiation failed:", error);
      if (!createRazorpayOrderMutation.isError) { 
         toast({ title: "Error", description: "Could not start payment process.", variant: "destructive" });
      }
    }
  };

  // Calculate processing state for backend calls
  const isProcessingBackend = createRazorpayOrderMutation.isPending || verifyPaymentMutation.isPending;

  if (items.length === 0 && !isProcessingBackend) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Header />
        <p className="p-4 text-lg">Your cart is empty.</p>
        <Button onClick={() => navigate('/menu')}>Go to Menu</Button>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  // Determine button content and disabled state
  let paymentButtonContent: React.ReactNode;
  const isButtonDisabled = 
    isProcessingBackend || 
    !razorpayKeyId || 
    isRazorpayLoading || 
    !!razorpayHookError || 
    !RazorpayCheckout;

  if (isRazorpayLoading) {
    paymentButtonContent = <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Payment Gateway...</>;
  } else if (razorpayHookError) {
    paymentButtonContent = <>Gateway Error</>; 
  } else if (!RazorpayCheckout) {
    paymentButtonContent = <>Gateway Not Ready</>;
  } else if (isProcessingBackend) {
    paymentButtonContent = <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Payment...</>;
  } else {
    paymentButtonContent = <><CreditCard className="mr-2 h-4 w-4" /> Pay {formatCurrency(totalPrice)} with Razorpay</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Confirm & Pay</CardTitle>
            <CardDescription>Review your order and proceed to payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary Section */}
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

            {/* Order Notes Section */}
            <div className="space-y-2">
              <label htmlFor="orderNotes" className="font-semibold">Order Notes (Optional)</label>
              <Textarea
                id="orderNotes"
                placeholder="Any special requests? E.g., less spicy, extra sauce..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                disabled={isProcessingBackend}
              />
            </div>
          </CardContent>
          {/* Updated CardFooter */}
          <CardFooter className="flex flex-col gap-4">
             {/* Back Button */} 
            <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate('/menu')} // Navigate to menu instead
                disabled={isProcessingBackend || isRazorpayLoading} // Also disable back if gateway is loading
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Menu
            </Button>
            {/* Payment Button */}
            <Button
              className="w-full flex items-center justify-center gap-2"
              size="lg"
              onClick={handlePayment}
              disabled={isButtonDisabled}
            >
              {paymentButtonContent}
            </Button>
            {!razorpayKeyId && (
                <p className="text-xs text-red-500 text-center mt-2">Payment gateway not configured.</p>
            )}
            {razorpayHookError && !isRazorpayLoading && (
                 <p className="text-xs text-red-500 text-center mt-2">Could not load payment gateway: {razorpayHookError}. Please try refreshing.</p>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Payment;
