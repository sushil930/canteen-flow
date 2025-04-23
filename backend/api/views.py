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

# Create your views here.

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
        revenue_today_agg = orders_today.filter(status__in=['COMPLETED', 'READY']).aggregate(total=Sum('total_amount'))
        revenue_today = revenue_today_agg['total'] or 0
        avg_order_today_agg = orders_today.filter(status__in=['COMPLETED', 'READY']).aggregate(avg=Avg('total_amount'))
        avg_order_today = avg_order_today_agg['avg'] or 0
        pending_orders = Order.objects.filter(status__in=['PENDING', 'PROCESSING']).count()
        total_customers = User.objects.filter(is_staff=False, is_superuser=False).count()
        total_orders_yesterday = orders_yesterday.count()
        revenue_yesterday_agg = orders_yesterday.filter(status__in=['COMPLETED', 'READY']).aggregate(total=Sum('total_amount'))
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
            .annotate(total_revenue=Sum('total_amount')) \
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
