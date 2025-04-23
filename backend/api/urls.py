from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomerCanteenViewSet,
    AdminCanteenViewSet,
    AdminCategoryViewSet,
    AdminMenuItemViewSet,
    OrderViewSet,
    AdminOrderViewSet,
    CurrentUserView,
    DashboardStatsView,
    UserRegistrationView,
    CustomerCategoryListViewSet,
    CustomerMenuItemListViewSet
)

# Router for customer-facing, generally accessible endpoints
router = DefaultRouter()
router.register(r'canteens', CustomerCanteenViewSet, basename='customer-canteen')
router.register(r'categories', CustomerCategoryListViewSet, basename='customer-category')
router.register(r'menu-items', CustomerMenuItemListViewSet, basename='customer-menuitem')
router.register(r'orders', OrderViewSet, basename='order')

# Router for admin-only endpoints
admin_router = DefaultRouter()
admin_router.register(r'canteens', AdminCanteenViewSet, basename='admin-canteen')
admin_router.register(r'categories', AdminCategoryViewSet, basename='admin-category')
admin_router.register(r'menu-items', AdminMenuItemViewSet, basename='admin-menuitem')
admin_router.register(r'orders', AdminOrderViewSet, basename='admin-order')

# The API URLs are now determined automatically by the router.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),
    path('user/', CurrentUserView.as_view(), name='current-user'),
    
    # Admin API routes (prefixed with /api/admin/)
    path('admin/', include(admin_router.urls)),
    
    # Add the dashboard stats route explicitly
    path('admin/dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Add custom registration route 
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    
    # Auth routes (used by both customer and admin)
    path('auth/', include('dj_rest_auth.urls')),
    
    # We will add our custom registration URL below
] 