from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.order_repository import OrderRepository
from repositories.user_repository import UserRepository
from repositories.address_repository import AddressRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.order_schema import OrderCreate
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional

class OrderService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = OrderRepository()
        self.user_repo = UserRepository()
        self.address_repo = AddressRepository()
        self.variant_repo = VariantRepository()
    
    def create_order(self, order_data: OrderCreate, user_id: int) -> Dict[str, Any]:
        try:
            # Validate address
            address = self.address_repo.get_address_by_id(self.db, order_data.address_id)
            if not address or address.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Address not found"
                )

            # Validate items and calculate totals
            subtotal = Decimal('0')
            validated_items = []  # list of tuples (variant_obj, quantity)
            
            for item in order_data.items:
                variant = self.variant_repo.get_variant_by_id(self.db, item['variant_id'])
                if not variant:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Variant {item['variant_id']} not found"
                    )
                if variant.stock_quantity < item['quantity']:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for variant {item['variant_id']}"
                    )

                item_total = Decimal(str(variant.price)) * Decimal(int(item['quantity']))
                subtotal += item_total
                validated_items.append((variant, int(item['quantity'])))

            # IMPORTANT: Use the calculated subtotal, not from order_data
            # Use order_data for other amounts but calculate total based on our calculations
            discount_amount = order_data.discount_amount or Decimal('0.00')
            delivery_fee = order_data.delivery_fee or Decimal('0.00')
            tax_amount = order_data.tax_amount or Decimal('0.00')
            
            # Calculate total from our calculated subtotal
            calculated_total = subtotal + tax_amount + delivery_fee - discount_amount
            
            # Create Order model instance
            from models.order.order import Order as OrderModel
            new_order_model = OrderModel(
                user_id=user_id,
                address_id=order_data.address_id,
                subtotal=subtotal,  # Use our calculated subtotal
                discount_amount=discount_amount,
                delivery_fee=delivery_fee,
                tax_amount=tax_amount,
                total_amount=calculated_total,  # Use calculated total
                coupon_code=order_data.coupon_code,
                order_status="PLACED",
                payment_status="PENDING"
            )

            # Persist order - pass model instance
            self.db.add(new_order_model)
            self.db.flush()  # Get order_id

            # Create order items and decrement stock
            from models.order.order_item import OrderItem as OrderItemModel
            for variant_obj, qty in validated_items:
                oi = OrderItemModel(
                    order_id=new_order_model.order_id,
                    variant_id=variant_obj.variant_id,
                    quantity=qty,
                    price=variant_obj.price,
                    total=variant_obj.price * qty
                )
                self.db.add(oi)

                # Update stock
                variant_obj.stock_quantity -= qty
                self.db.add(variant_obj)

            # Create initial history
            from models.order.order_history import OrderHistory as OrderHistoryModel
            history = OrderHistoryModel(
                order_id=new_order_model.order_id,
                status="PLACED",
                updated_by=user_id
            )
            self.db.add(history)

            # Commit everything
            self.db.commit()
            self.db.refresh(new_order_model)

            return self._serialize_order(new_order_model)

        except HTTPException:
            self.db.rollback()
            raise
        except Exception as e:
            print("🔥 ORDER CREATION ERROR:", str(e))
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Order creation failed")

    def get_user_orders(self, user_id: int, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Get all orders for a user"""
        try:
            # Call repository method
            result = self.repository.get_orders_by_user_id(self.db, user_id, page, per_page)
            
            if not result:
                return {
                    "orders": [],
                    "total_orders": 0,
                    "total_pages": 0
                }
            
            # Serialize each order
            orders_data = []
            for order in result["orders"]:
                try:
                    serialized_order = self._serialize_order(order)
                    orders_data.append(serialized_order)
                except Exception as e:
                    print(f"⚠️ Error serializing order {order.order_id}: {e}")
                    # Add minimal order data even if serialization fails
                    orders_data.append({
                        "order_id": order.order_id,
                        "order_status": order.order_status,
                        "payment_status": order.payment_status,
                        "total_amount": float(order.total_amount),
                        "subtotal": float(order.subtotal),
                        "discount_amount": float(order.discount_amount),
                        "delivery_fee": float(order.delivery_fee),
                        "tax_amount": float(order.tax_amount),
                        "placed_at": order.placed_at,
                        "items": [],
                        "histories": [],
                        "address": None
                    })
            
            return {
                "orders": orders_data,
                "total_orders": result["total_orders"],
                "total_pages": result["total_pages"]
            }
        except Exception as e:
            print(f"🔥 Error in get_user_orders: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch orders: {str(e)}"
            )
    
    def get_order_by_id(self, order_id: int, user_id: int, is_admin: bool = False) -> Dict[str, Any]:
        """Get order details by ID"""
        order = self.repository.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if not is_admin and order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return self._serialize_order(order)
    
    def cancel_order(self, order_id: int, user_id: int) -> Dict[str, str]:
        """Cancel an order"""
        order = self.repository.get_order_by_id(self.db, order_id)
        if not order or order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if order.order_status in ["SHIPPED", "DELIVERED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel shipped or delivered order"
            )
        
        # Update order status
        order.order_status = "CANCELLED"
        
        # Restore stock
        items = order.items
        for item in items:
            variant = self.variant_repo.get_variant_by_id(self.db, item.variant_id)
            if variant:
                variant.stock_quantity += item.quantity
        
        # Add history
        history_data = {
            "order_id": order_id,
            "status": "CANCELLED",
            "updated_by": user_id
        }
        self.repository.create_order_history(self.db, history_data)
        
        self.db.commit()
        return {"message": "Order cancelled successfully"}
    
    def create_return_request(self, order_id: int, user_id: int, return_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a return request for an order"""
        # Verify order exists and belongs to user
        order = self.repository.get_order_by_id(self.db, order_id)
        if not order or order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if order can be returned
        if order.order_status not in ["DELIVERED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be returned"
            )
        
        # Validate items and calculate refund amount
        total_refund = Decimal('0.00')
        return_items = []
        
        for item in return_data["items"]:
            # Validate variant_id is provided and valid
            if not item.get("variant_id") or item["variant_id"] <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Invalid variant ID: {item.get('variant_id')}. Variant ID must be a positive integer."
                )
            
            # Validate quantity is provided and valid
            if not item.get("quantity") or item["quantity"] <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid quantity for variant {item['variant_id']}. Quantity must be greater than 0."
                )
            
            # Verify variant exists in database
            variant = self.variant_repo.get_variant_by_id(self.db, item["variant_id"])
            if not variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail=f"Product variant with ID {item['variant_id']} not found"
                )
            
            # Check if variant is in the order
            order_item = next((oi for oi in order.items if oi.variant_id == item["variant_id"]), None)
            if not order_item:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Variant {item['variant_id']} not found in order {order_id}"
                )
            
            # Check return quantity doesn't exceed ordered quantity
            if item["quantity"] > order_item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail=f"Return quantity ({item['quantity']}) exceeds ordered quantity ({order_item.quantity}) for variant {item['variant_id']}"
                )
            
            # Calculate refund for this item
            item_refund = order_item.price * item["quantity"]
            total_refund += item_refund
            
            return_items.append({
                "variant_id": item["variant_id"],
                "quantity": item["quantity"],
                "unit_price": float(order_item.price),
                "refund_amount": float(item_refund),
                "variant_name": variant.variant_name,
                "product_name": variant.product.product_name if variant.product else "Unknown"
            })
        
        # Create return request
        return_request_data = {
            "order_id": order_id,
            "reason": return_data["reason"],
            "status": "REQUESTED"
        }
        
        return_request = self.repository.create_return_request(self.db, return_request_data)
        
        # Create return items with validated data
        for item in return_items:
            return_product_data = {
                "return_id": return_request.return_id,
                "variant_id": item["variant_id"],
                "quantity": item["quantity"]
            }
            self.repository.create_return_product(self.db, return_product_data)
        
        self.db.commit()
        
        return {
            "return_id": return_request.return_id,
            "order_id": return_request.order_id,
            "reason": return_request.reason,
            "status": return_request.status,
            "requested_at": return_request.requested_at,
            "total_refund_amount": float(total_refund),
            "items": return_items
        }
    
    def get_all_orders(self, page: int = 1, per_page: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        """Get all orders"""
        result = self.repository.get_all_orders(self.db, page, per_page, status)
        
        orders_data = [
            self._serialize_order(order) for order in result["orders"]
        ]
        
        return {
            "orders": orders_data,
            "total_orders": result["total_orders"],
            "total_pages": result["total_pages"]
        }
    
    def update_order_status(self, order_id: int, status: str, admin_id: int) -> Dict[str, Any]:
        """Update order status"""
        order = self.repository.update_order_status(self.db, order_id, status)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Add history
        history_data = {
            "order_id": order_id,
            "status": status,
            "updated_by": admin_id
        }
        self.repository.create_order_history(self.db, history_data)
        
        self.db.commit()
        self.db.refresh(order)
        
        return self._serialize_order(order)
    
    def _serialize_order_item(self, item: OrderItem) -> Dict[str, Any]:
        """Serialize order item with product details"""
        variant = self.variant_repo.get_variant_by_id(self.db, item.variant_id)
        
        # Handle case where variant might not exist
        product_name = "Unknown Product"
        variant_name = None
        
        if variant:
            variant_name = variant.variant_name
            if variant.product:
                product_name = variant.product.product_name
        
        return {
            "variant_id": item.variant_id,
            "product_name": product_name,
            "variant_name": variant_name,
            "price": float(item.price),
            "quantity": item.quantity,
            "total": float(item.total)
        }

    
    def _serialize_order_history(self, history: OrderHistory) -> Dict[str, Any]:
        """Serialize order history"""
        user = self.user_repo.get_user_by_id(self.db, history.updated_by)
        return {
            "history_id": history.history_id,
            "status": history.status,
            "updated_at": history.updated_at,
            "updated_by_name": f"{user.first_name} {user.last_name}" if user else "System"
        }
    
    def _serialize_order(self, order: Order) -> Dict[str, Any]:
        """Serialize order with all related data"""
        address = self.address_repo.get_address_by_id(self.db, order.address_id)
        
        items = order.items
        histories = order.histories
        
        return {
            "order_id": order.order_id,
            "order_status": order.order_status,
            "payment_status": order.payment_status,
            "total_amount": float(order.total_amount),
            "subtotal": float(order.subtotal),
            "discount_amount": float(order.discount_amount),
            "delivery_fee": float(order.delivery_fee),
            "tax_amount": float(order.tax_amount),
            "placed_at": order.placed_at,
            "items": [self._serialize_order_item(item) for item in items],
            "histories": [self._serialize_order_history(history) for history in histories],
            "address": {
                "address_id": address.address_id,
                "line1": address.line1,
                "line2": address.line2,
                "area_name": address.area.area_name if address.area else None,
                "city_name": address.area.city.city_name if address.area and address.area.city else None,
                "state_name": address.area.city.state.state_name if address.area and address.area.city and address.area.city.state else None,
                "pincode": address.area.pincode if address.area else None
            } if address else None
        }