from django.db import models
from django.contrib.auth.models import User # Django's built-in User
from decimal import Decimal # Import Decimal
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

# Create your models here.

class Canteen(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    # Add location, opening hours, etc. later if needed
    # Maybe a link to the staff managing it (ForeignKey to User?)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    # Could add description or image later

    class Meta:
        verbose_name_plural = "Categories" # Correct pluralization in admin

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    canteen = models.ForeignKey(Canteen, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='menu_items')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True) # Needs Pillow installed
    is_available = models.BooleanField(default=True)
    # Add allergens, nutritional info later if needed

    def __str__(self):
        return f"{self.name} ({self.canteen.name})"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('READY', 'Ready for Pickup/Delivery'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    canteen = models.ForeignKey(Canteen, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True, null=True)
    table_number = models.CharField(max_length=10, blank=True, null=True) # Add table number field
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Order {self.id} by {self.customer.username} at {self.canteen.name}"

    # We will add logic later (maybe signals) to calculate total_amount

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name} (Order {self.order.id})"
        
    @property
    def total_item_price(self):
        return self.quantity * self.price
