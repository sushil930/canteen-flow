from rest_framework import serializers
from .models import Canteen, Category, MenuItem, Order, OrderItem
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

# --- Read/List Serializers (Potentially nested for easier frontend consumption) ---

class CanteenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Canteen
        fields = ['id', 'name', 'description'] # Add more fields as needed

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class MenuItemSerializer(serializers.ModelSerializer):
    # Display canteen and category names instead of just IDs for read operations
    canteen = serializers.StringRelatedField() 
    category = serializers.StringRelatedField()
    # Image field automatically handles URL representation when serialized
    image = serializers.ImageField(use_url=True, required=False, allow_null=True) 
    
    class Meta:
        model = MenuItem
        fields = [
            'id', 'canteen', 'category', 'name', 'description', 
            'price', 
            'image', # Only include the model's field name ('image')
            'is_available'
        ]

# Add a separate serializer for Write operations
class MenuItemWriteSerializer(serializers.ModelSerializer):
    # Accept IDs for foreign keys on write
    canteen = serializers.PrimaryKeyRelatedField(queryset=Canteen.objects.all())
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True, required=False)
    # Handle image upload (read_only=True here, handled separately in view if needed or use different field)
    image = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'canteen', 'category', 'name', 'description', 
            'price', 'image', 'is_available'
        ]

# --- User Serializer (define before usage in OrderSerializer) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        # Add other fields as needed, but be careful about exposing sensitive info

# --- Read/List Serializers continued ---

class OrderItemSerializer(serializers.ModelSerializer):
    # Show menu item details within the order item
    menu_item = MenuItemSerializer(read_only=True) 
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'quantity', 'price_at_time_of_order']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = UserSerializer(read_only=True)
    canteen = CanteenSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ('id', 'customer', 'canteen', 'created_at', 'updated_at', 'status', 'total_price', 'notes', 'table_number', 'items')
        read_only_fields = ['total_amount', 'created_at', 'updated_at'] # Usually calculated/set by backend

# --- Write/Create Serializers (Simpler, often using IDs for relationships) ---

class OrderItemWriteSerializer(serializers.ModelSerializer):
    # Expect menu_item ID when creating/updating order items within an order
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ['menu_item_id', 'quantity']

class OrderWriteSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True)
    canteen = serializers.PrimaryKeyRelatedField(queryset=Canteen.objects.all())

    class Meta:
        model = Order
        fields = ('id', 'canteen', 'notes', 'table_number', 'items') 
        read_only_fields = ('id',)

    def validate(self, attrs):
        # Log the structure of attrs *before* create is called
        logger.debug(f"OrderWriteSerializer validated data structure: {attrs}")
        # Perform any additional top-level validation if needed
        # Example: Ensure notes are not excessively long
        # if len(attrs.get('notes', '')) > 500:
        #     raise serializers.ValidationError("Notes cannot exceed 500 characters.")
        return super().validate(attrs) # Return the validated attributes

    def create(self, validated_data):
        logger.debug(f"Entering OrderWriteSerializer create method with data: {validated_data}") # Add log here too
        # items_data is now a list of dicts like: [{'menu_item': <MenuItem obj>, 'quantity': int}, ...]
        try:
            items_data = validated_data.pop('items') 
        except KeyError:
            logger.error(f"KeyError popping 'items' from validated_data: {validated_data}")
            raise # Re-raise the error after logging
            
        canteen = validated_data.get('canteen') 
        if not canteen:
            logger.error(f"Canteen missing in validated_data: {validated_data}")
            raise serializers.ValidationError("Canteen is required.")
            
        # No need to fetch menu_items again, they are already objects in items_data
        
        # Calculate total price
        total_price = Decimal('0.00')
        for item_data in items_data:
            try:
                # Access the MenuItem object directly from the validated data
                menu_item = item_data['menu_item'] 
                quantity = item_data['quantity']
            except KeyError as e:
                logger.error(f"KeyError accessing item_data keys ('{e}') in item: {item_data}, all items: {items_data}")
                raise
            
            if not isinstance(menu_item, MenuItem):
                 logger.error(f"Invalid menu_item type encountered: {type(menu_item)} in item: {item_data}")
                 raise serializers.ValidationError(f"Invalid menu item data encountered.")
                 
            # Check if item belongs to the specified canteen
            if menu_item.canteen != canteen:
                 logger.error(f"Menu item {menu_item.id} canteen ({menu_item.canteen}) mismatch with order canteen ({canteen})")
                 raise serializers.ValidationError(f"Menu item '{menu_item.name}' (ID: {menu_item.id}) does not belong to canteen '{canteen.name}'.")
            
            total_price += Decimal(menu_item.price) * Decimal(quantity)

        validated_data['total_price'] = total_price
        # Customer is added in perform_create by the view (using self.request.user)
        
        logger.debug(f"Creating Order object with data: {validated_data}")
        try:
            order = Order.objects.create(**validated_data)
        except Exception as e:
            logger.error(f"Error during Order.objects.create: {e} with data: {validated_data}", exc_info=True)
            raise
        
        # Create OrderItem instances using the already validated data
        order_items_to_create = []
        for item_data in items_data:
            try:
                menu_item = item_data['menu_item'] # Get object directly
                quantity = item_data['quantity']
            except KeyError as e:
                # This shouldn't happen if the first loop succeeded, but log just in case
                logger.error(f"KeyError accessing item_data keys ('{e}') in item during OrderItem creation: {item_data}")
                raise
                
            order_items_to_create.append(
                OrderItem(
                    order=order, 
                    menu_item=menu_item, 
                    quantity=quantity, 
                    price=menu_item.price # Use current price from the validated MenuItem object
                )
            )
            
        logger.debug(f"Bulk creating {len(order_items_to_create)} OrderItems")
        try:
            OrderItem.objects.bulk_create(order_items_to_create)
        except Exception as e:
            logger.error(f"Error during OrderItem.objects.bulk_create: {e}", exc_info=True)
            # Consider rolling back the Order creation or handling cleanup
            raise
            
        logger.debug(f"Order {order.id} created successfully.")
        return order

# --- Custom User Registration Serializer ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."}) 
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists."})       
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password']) # Hash the password
        user.save()
        return user

# We might need more specific serializers later, e.g., for Admin Menu Management
# For now, Admins can potentially use the same MenuItemSerializer but with write permissions handled by the view. 