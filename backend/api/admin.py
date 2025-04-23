from django.contrib import admin
from .models import Canteen, Category, MenuItem, Order, OrderItem

# Register your models here.

# Basic registration
admin.site.register(Canteen)
admin.site.register(Category)
admin.site.register(MenuItem)
admin.site.register(Order)
admin.site.register(OrderItem)

# We can customize the admin display later if needed, for example:
# class OrderItemInline(admin.TabularInline):
#     model = OrderItem
#     extra = 0 # Don't show extra blank forms
#     readonly_fields = ('price_at_time_of_order',)

# class OrderAdmin(admin.ModelAdmin):
#     list_display = ('id', 'customer', 'canteen', 'status', 'total_amount', 'created_at')
#     list_filter = ('status', 'canteen', 'created_at')
#     search_fields = ('id', 'customer__username')
#     inlines = [OrderItemInline]

# admin.site.register(Order, OrderAdmin)

# class MenuItemAdmin(admin.ModelAdmin):
#     list_display = ('name', 'canteen', 'category', 'price', 'is_available')
#     list_filter = ('canteen', 'category', 'is_available')
#     search_fields = ('name', 'description')

# admin.site.register(MenuItem, MenuItemAdmin)
