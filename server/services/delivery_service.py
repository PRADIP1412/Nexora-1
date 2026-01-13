from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.delivery_repository import DeliveryRepository
from repositories.delivery_person_repository import DeliveryPersonRepository
from repositories.order_repository import OrderRepository
from repositories.user_repository import UserRepository
from repositories.address_repository import AddressRepository
from typing import Dict, Any, Optional

class DeliveryService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DeliveryRepository()
        self.delivery_person_repo = DeliveryPersonRepository()
        self.order_repo = OrderRepository()
        self.user_repo = UserRepository()
        self.address_repo = AddressRepository()
    
    def assign_delivery_person(self, order_id: int, delivery_person_id: int) -> Dict[str, Any]:
        """Assign a delivery person to an order"""
        order = self.order_repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        delivery_person = self.delivery_person_repo.get_delivery_person_by_id(self.db, delivery_person_id)
        if not delivery_person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery person not found"
            )
        
        # Check if delivery already exists
        existing_delivery = self.repository.get_delivery_by_order_id(self.db, order_id)
        if existing_delivery:
            existing_delivery.delivery_person_id = delivery_person_id
            delivery = existing_delivery
            self.db.commit()
            self.db.refresh(delivery)
        else:
            # Create new delivery
            delivery_data = {
                "order_id": order_id,
                "delivery_person_id": delivery_person_id,
                "status": "ASSIGNED"
            }
            delivery = self.repository.create_delivery(self.db, delivery_data)
        
        return self._serialize_delivery(delivery)
    
    def get_delivery_person_orders(self, delivery_person_id: int, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Get all orders assigned to a delivery person"""
        result = self.repository.get_deliveries_by_delivery_person(self.db, delivery_person_id, page, per_page)
        
        deliveries_data = [
            self._serialize_delivery(delivery) for delivery in result["deliveries"]
        ]
        
        return {
            "deliveries": deliveries_data,
            "total_deliveries": result["total_deliveries"]
        }
    
    def update_delivery_status(self, delivery_id: int, status: str, delivery_person_id: int) -> Dict[str, Any]:
        """Update delivery status"""
        delivery = self.repository.get_delivery_by_id(self.db, delivery_id)
        if not delivery or delivery.delivery_person_id != delivery_person_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery not found"
            )
        
        updated_delivery = self.repository.update_delivery_status(self.db, delivery_id, status)
        if not updated_delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery not found"
            )
        
        if status == "DELIVERED":
            # Update order status
            order = self.order_repo.get_order_by_id(self.db, delivery.order_id)
            if order:
                order.order_status = "DELIVERED"
            
            # Create earnings record
            earnings_data = {
                "delivery_person_id": delivery_person_id,
                "delivery_id": delivery_id,
                "amount": 50.00  # Fixed delivery fee
            }
            self.repository.create_delivery_earnings(self.db, earnings_data)
            
            self.db.commit()
        
        return self._serialize_delivery(updated_delivery)
    
    def get_delivery_person_earnings(self, delivery_person_id: int) -> Dict[str, Any]:
        """Get earnings summary for delivery person"""
        return self.repository.get_delivery_person_earnings(self.db, delivery_person_id)
    
    def get_all_deliveries(self, page: int = 1, per_page: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        """Get all deliveries"""
        result = self.repository.get_all_deliveries(self.db, page, per_page, status)
        
        deliveries_data = [
            self._serialize_delivery(delivery) for delivery in result["deliveries"]
        ]
        
        return {
            "deliveries": deliveries_data,
            "total_deliveries": result["total_deliveries"]
        }
    
    def get_delivery_by_order_id(self, order_id: int) -> Dict[str, Any]:
        """Get delivery by order ID"""
        delivery = self.repository.get_delivery_by_order_id(self.db, order_id)
        if not delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery not found for this order"
            )
        
        return self._serialize_delivery(delivery)
    
    def _serialize_delivery(self, delivery: Delivery) -> Dict[str, Any]:
        """Serialize delivery with related data"""
        order = self.order_repo.get_order_by_id(self.db, delivery.order_id)
        delivery_person = self.delivery_person_repo.get_delivery_person_by_id(self.db, delivery.delivery_person_id)
        user = self.user_repo.get_user_by_id(self.db, delivery_person.user_id) if delivery_person else None
        address = self.address_repo.get_address_by_id(self.db, order.address_id) if order else None
        customer = self.user_repo.get_user_by_id(self.db, order.user_id) if order else None
        
        return {
            "delivery_id": delivery.delivery_id,
            "order_id": delivery.order_id,
            "delivery_person_name": f"{user.first_name} {user.last_name}" if user else None,
            "status": delivery.status,
            "assigned_at": delivery.assigned_at,
            "delivered_at": delivery.delivered_at,
            "order_status": order.order_status if order else "UNKNOWN",
            "customer_name": f"{customer.first_name} {customer.last_name}" if customer else "Unknown",
            "customer_address": f"{address.line1}, {address.area.area_name}" if address and address.area else "Address not available"
        }