import time
from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from datetime import timedelta
from .models import Canteen, Category, MenuItem, Order, OrderItem
from .serializers import (
    CanteenSerializer, CategorySerializer, MenuItemSerializer, 
    OrderSerializer, OrderWriteSerializer, UserSerializer,
    MenuItemWriteSerializer, UserRegistrationSerializer,
    OrderItemSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.db.models.functions import TruncHour, TruncDay
import razorpay
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt # For webhook, if needed later
from django.utils.decorators import method_decorator

from .models import Order, OrderItem, MenuItem, Canteen # Import necessary models
from .serializers import OrderSerializer # Import necessary serializers

class CanteenViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving Canteens."""
    queryset = Canteen.objects.all()
    serializer_class = CanteenSerializer
    permission_classes = [permissions.AllowAny] # Anyone can view canteens

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving Categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] # Anyone can view categories

class AdminMenuItemViewSet(viewsets.ModelViewSet):
    """ViewSet for ADMIN CRUD operations on Menu Items."""
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # Admins see all items, filterable by canteen
        queryset = MenuItem.objects.all().select_related('canteen', 'category')
        canteen_id = self.request.query_params.get('canteen')
        if canteen_id is not None:
            queryset = queryset.filter(canteen__id=canteen_id)
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MenuItemWriteSerializer
        return MenuItemSerializer

class CustomerCanteenViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for CUSTOMERS listing and retrieving Canteens."""
    queryset = Canteen.objects.all()
    serializer_class = CanteenSerializer
    permission_classes = [permissions.AllowAny] # Customers don't need to be logged in to view canteens

class CustomerCategoryListViewSet(viewsets.ReadOnlyModelViewSet):
    """ 
    Provides a read-only list of categories, filterable by canteen.
    Accessible by any user (authenticated or not).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] # Allow anyone to see categories
    filterset_fields = ['canteen'] # Enable filtering by /categories/?canteen=ID

class CustomerMenuItemListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a read-only list of menu items, filterable by canteen.
    Accessible by any user (authenticated or not).
    """
    queryset = MenuItem.objects.filter(is_available=True) # Only show available items
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny] # Allow anyone to see menu items
    filterset_fields = ['canteen', 'category'] # Ensure filtering by canteen is enabled

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for CUSTOMERS creating, listing, and retrieving their own Orders."""
    permission_classes = [permissions.IsAuthenticated] # Must be logged in to interact with orders

    def get_queryset(self):
        """Users can only see their own orders."""
        user = self.request.user
        if user.is_authenticated:
            # Add prefetching to optimize fetching related items and menu_items
            return Order.objects.filter(customer=user).prefetch_related('items__menu_item')
        return Order.objects.none() # Should not happen due to IsAuthenticated, but safe fallback

    def get_serializer_class(self):
        """Use different serializers for read and write actions."""
        if self.action in ['create', 'update', 'partial_update']:
            return OrderWriteSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        """Automatically set the customer to the logged-in user when creating an order."""
        serializer.save(customer=self.request.user)

# --- User Info View ---
class CurrentUserView(generics.RetrieveAPIView):
    """Gets the details of the currently logged-in user."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# --- Admin Views ---

# --- NEW: Admin Canteen ViewSet ---
class AdminCanteenViewSet(viewsets.ModelViewSet):
    """ViewSet for ADMIN CRUD operations on Canteens."""
    queryset = Canteen.objects.all()
    serializer_class = CanteenSerializer
    permission_classes = [permissions.IsAdminUser]
    # Add parser classes if image uploads are needed later
    # parser_classes = [MultiPartParser, FormParser, JSONParser] 

class AdminOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for ADMINS viewing and updating Orders."""
    queryset = Order.objects.all().select_related('customer', 'canteen').prefetch_related('items__menu_item')
    serializer_class = OrderSerializer # Use the detailed serializer for viewing
    permission_classes = [permissions.IsAdminUser] # Only Admins
    http_method_names = ['get', 'patch', 'head', 'options'] # Allow GET (list/retrieve) and PATCH (update status)

    # Potentially add filtering for status, canteen, date range etc.
    # filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    # filterset_fields = ['status', 'canteen']
    # ordering_fields = ['created_at', 'total_amount']

    # Override get_serializer_class if needed for PATCH operations
    # Currently, OrderSerializer allows status updates as it's not read_only

    # Optional: Add custom actions if needed beyond simple status patch

# --- Admin Category ViewSet (Keep this position) ---
class AdminCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for ADMIN CRUD operations on Categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]

# --- Admin Menu Item ViewSet (Restore full definition) ---
class AdminMenuItemViewSet(viewsets.ModelViewSet):
    """ViewSet for ADMIN CRUD operations on Menu Items."""
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser] # Keep parsers

    def get_queryset(self):
        # Admins see all items, filterable by canteen
        queryset = MenuItem.objects.all().select_related('canteen', 'category')
        canteen_id = self.request.query_params.get('canteen')
        if canteen_id is not None:
            queryset = queryset.filter(canteen__id=canteen_id)
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MenuItemWriteSerializer # Use write serializer for modifications
        return MenuItemSerializer # Use read serializer for list/retrieve

class DashboardStatsView(APIView):
    """Provides aggregated statistics for the admin dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        now = timezone.now()
        today = now.date()
        start_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        end_of_day = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
        start_of_yesterday = start_of_day - timedelta(days=1)
        end_of_yesterday = end_of_day - timedelta(days=1)
        start_of_week = start_of_day - timedelta(days=now.weekday()) # Monday of the current week

        # --- Calculate Stats --- 
        orders_today = Order.objects.filter(created_at__gte=start_of_day, created_at__lte=end_of_day)
        orders_yesterday = Order.objects.filter(created_at__gte=start_of_yesterday, created_at__lte=end_of_yesterday)
        orders_this_week = Order.objects.filter(created_at__gte=start_of_week)
        completed_orders_this_week = orders_this_week.filter(status__in=['COMPLETED', 'READY'])
        
        total_orders_today = orders_today.count()
        revenue_today_agg = orders_today.filter(status__in=['COMPLETED', 'READY']).aggregate(total=Sum('total_price'))
        revenue_today = revenue_today_agg['total'] or 0
        avg_order_today_agg = orders_today.filter(status__in=['COMPLETED', 'READY']).aggregate(avg=Avg('total_price'))
        avg_order_today = avg_order_today_agg['avg'] or 0
        pending_orders = Order.objects.filter(status__in=['PENDING', 'PROCESSING']).count()
        total_customers = User.objects.filter(is_staff=False, is_superuser=False).count()
        total_orders_yesterday = orders_yesterday.count()
        revenue_yesterday_agg = orders_yesterday.filter(status__in=['COMPLETED', 'READY']).aggregate(total=Sum('total_price'))
        revenue_yesterday = revenue_yesterday_agg['total'] or 0
        order_trend = ((total_orders_today - total_orders_yesterday) / total_orders_yesterday * 100) if total_orders_yesterday else (100 if total_orders_today > 0 else 0)
        revenue_trend = ((revenue_today - revenue_yesterday) / revenue_yesterday * 100) if revenue_yesterday else (100 if revenue_today > 0 else 0)
        
        # --- Calculate Chart Data --- 
        # Today's orders by hour
        orders_by_hour = orders_today \
            .annotate(hour=TruncHour('created_at')) \
            .values('hour') \
            .annotate(count=Count('id')) \
            .order_by('hour')
        
        # Format for recharts: [{ name: '9AM', orders: 4 }, ...]
        daily_orders_chart_data = [
            {
                'name': hour_data['hour'].strftime('%I%p').lstrip('0'), # Format hour e.g., 9AM, 12PM
                'orders': hour_data['count']
            }
            for hour_data in orders_by_hour
        ]
        
        # Weekly revenue by day
        revenue_by_day = completed_orders_this_week \
            .annotate(day=TruncDay('created_at')) \
            .values('day') \
            .annotate(total_revenue=Sum('total_price')) \
            .order_by('day')
        
        # Format for recharts: [{ name: 'Mon', revenue: 520 }, ...]
        weekly_revenue_chart_data = [
            {
                'name': day_data['day'].strftime('%a'), # Format day e.g., Mon, Tue
                'revenue': float(day_data['total_revenue'])
            }
            for day_data in revenue_by_day
        ]

        # --- Prepare Response Data --- 
        stats = {
            'total_orders_today': total_orders_today,
            'total_revenue_today': float(revenue_today),
            'average_order_value': float(avg_order_today),
            'pending_orders': pending_orders,
            'total_customers': total_customers,
            'order_trend_percentage': round(order_trend, 1),
            'revenue_trend_percentage': round(revenue_trend, 1),
            # Add chart data
            'daily_orders_chart': daily_orders_chart_data,
            'weekly_revenue_chart': weekly_revenue_chart_data,
        }

        return Response(stats)

# --- Custom Registration View ---
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] # Anyone can register
    serializer_class = UserRegistrationSerializer

# --- Razorpay Views --- 

# Initialize Razorpay client
# Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in settings.py
razorpay_client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )
else:
    print("WARNING: Razorpay client not initialized. Keys missing in settings.")

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not razorpay_client:
            return Response({"error": "Razorpay client not initialized"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        amount = request.data.get('amount') # Amount should be in paise from frontend
        if not amount or not isinstance(amount, int) or amount <= 0:
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order_currency = 'INR'
            order_receipt = f'order_rcptid_{request.user.id}_{int(time.time())}' # Example receipt ID

            notes = { 
                'user_id': request.user.id,
                # Add any other notes you want to pass to Razorpay
            }

            razorpay_order = razorpay_client.order.create(dict(
                amount=amount,
                currency=order_currency,
                receipt=order_receipt,
                notes=notes,
                payment_capture='1' # Auto capture payment
            ))

            print(f"Razorpay Order Created: {razorpay_order['id']}")
            return Response({"order_id": razorpay_order['id']}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Error creating Razorpay order: {e}")
            return Response({"error": "Could not create Razorpay order"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not razorpay_client:
            return Response({"error": "Razorpay client not initialized"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        payment_data = request.data
        razorpay_payment_id = payment_data.get('razorpay_payment_id')
        razorpay_order_id = payment_data.get('razorpay_order_id')
        razorpay_signature = payment_data.get('razorpay_signature')
        local_order_details = payment_data.get('local_order_details')

        if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature, local_order_details]):
            return Response({"error": "Missing payment verification data"}, status=status.HTTP_400_BAD_REQUEST)

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            razorpay_client.utility.verify_payment_signature(params_dict)
            print(f"Razorpay Signature Verified for Order: {razorpay_order_id}")

            try:
                canteen_id = local_order_details.get('canteen')
                table_number = local_order_details.get('table_number')
                items_data = local_order_details.get('items')
                total_price = local_order_details.get('total_price')

                if not canteen_id or not items_data:
                     raise ValueError("Missing canteen or items in local order details")

                canteen = Canteen.objects.get(id=canteen_id)
                
                order = Order.objects.create(
                    customer=request.user,
                    canteen=canteen,
                    table_number=table_number,
                    total_price=total_price,
                    status='PENDING',
                    razorpay_order_id=razorpay_order_id,
                    razorpay_payment_id=razorpay_payment_id
                )

                order_items_to_create = []
                for item_data in items_data:
                    menu_item_id = item_data.get('menu_item_id')
                    if not menu_item_id:
                        raise ValueError(f"Missing menu_item_id in item data: {item_data}")
                    menu_item = MenuItem.objects.get(id=menu_item_id)
                    order_items_to_create.append(
                        OrderItem(
                            order=order,
                            menu_item=menu_item,
                            quantity=item_data['quantity'],
                            price=menu_item.price
                        )
                    )
                OrderItem.objects.bulk_create(order_items_to_create)
                
                print(f"Database Order Created: {order.id}")
                return Response({"success": True, "orderId": order.id}, status=status.HTTP_201_CREATED)

            except Canteen.DoesNotExist:
                 print("Error creating DB order: Canteen not found")
                 return Response({"error": "Invalid canteen specified"}, status=status.HTTP_400_BAD_REQUEST)
            except MenuItem.DoesNotExist:
                 print("Error creating DB order: Menu item not found")
                 return Response({"error": "Invalid menu item specified"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError as ve:
                 print(f"ValueError creating DB order: {ve}")
                 return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as db_error:
                 print(f"Error creating database order after payment verification: {db_error}")
                 return Response({"error": "Order creation failed after payment verification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except razorpay.errors.SignatureVerificationError as e:
            print(f"Razorpay Signature Verification Failed: {e}")
            return Response({"error": "Payment signature verification failed"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error during payment verification process: {e}")
            return Response({"error": "An unexpected error occurred during payment verification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Optional: Razorpay Webhook View --- 
# Use @method_decorator(csrf_exempt, name='dispatch') if using CSRF
# @method_decorator(csrf_exempt, name='dispatch') 
# class RazorpayWebhookView(APIView):
#     permission_classes = [] # No auth needed for webhook
# 
#     def post(self, request, *args, **kwargs):
#         if not razorpay_client:
#             return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# 
#         payload = request.body
#         sig_header = request.META.get('HTTP_X_RAZORPAY_SIGNATURE')
#         webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET # Add this to your .env and settings.py
# 
#         if not sig_header or not webhook_secret:
#             return Response(status=status.HTTP_400_BAD_REQUEST)
# 
#         try:
#             razorpay_client.utility.verify_webhook_signature(payload, sig_header, webhook_secret)
#             # Process the event (e.g., payment.captured, order.paid)
#             event_data = json.loads(payload)
#             event_type = event_data.get('event')
#             print(f"Received Razorpay webhook event: {event_type}")
# 
#             if event_type == 'payment.captured' or event_type == 'order.paid':
#                 # Find the corresponding order in your DB using razorpay_order_id
#                 # Update its status if necessary (e.g., if verification view failed earlier)
#                 pass
# 
#             return Response(status=status.HTTP_200_OK)
#         except razorpay.errors.SignatureVerificationError as e:
#             print(f"Webhook Signature Verification Failed: {e}")
#             return Response(status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             print(f"Error processing webhook: {e}")
#             return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
