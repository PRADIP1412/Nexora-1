from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from config.dependencies import get_db, get_current_user, is_admin, is_delivery_person, get_delivery_person_or_none
from controllers.delivery_controller import DeliveryController
from schemas.delivery_schema import (
    DeliveryWrapper, DeliveryListWrapper, DeliveryPersonListWrapper,
    DeliveryEarningsWrapper, MessageWrapper, DeliveryStatusUpdate
)
from models.user import User
from models.delivery.delivery_person import DeliveryPerson
from models.delivery.delivery import Delivery
from models.order.order import Order
from typing import Optional

router = APIRouter(prefix="/api/v1/delivery", tags=["Delivery"])

# Admin endpoints
@router.post("/assign/{order_id}", response_model=DeliveryWrapper)
def assign_delivery(
    order_id: int,
    delivery_person_id: int = Query(..., description="Delivery Person ID"),
    db: Session = Depends(get_db),
    admin = Depends(is_admin)
):
    """Admin: Assign delivery person to order"""
    controller = DeliveryController(db)
    delivery = controller.assign_delivery_person(order_id, delivery_person_id)
    return {
        "success": True,
        "message": "Delivery person assigned successfully",
        "data": delivery
    }

@router.get("/all", response_model=DeliveryListWrapper)
def get_all_deliveries_admin(
    db: Session = Depends(get_db),
    admin = Depends(is_admin),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None)
):
    """Admin: Get all deliveries"""
    controller = DeliveryController(db)
    deliveries = controller.get_all_deliveries(page, per_page, status)
    return {
        "success": True,
        "message": "Deliveries retrieved successfully",
        "data": deliveries["deliveries"]
    }

@router.get("/persons", response_model=DeliveryPersonListWrapper)
def get_all_delivery_persons_admin(
    db: Session = Depends(get_db),
    admin = Depends(is_admin),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """Admin: Get all delivery persons"""
    from controllers.delivery_person_controller import DeliveryPersonController
    controller = DeliveryPersonController(db)
    delivery_persons = controller.get_all_delivery_persons(page, per_page)
    return {
        "success": True,
        "message": "Delivery persons retrieved successfully",
        "data": delivery_persons["delivery_persons"]
    }

# Delivery person endpoints
@router.get("/my-orders", response_model=DeliveryListWrapper)
def get_my_assigned_orders(
    delivery_person: DeliveryPerson = Depends(get_delivery_person_or_none),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """Delivery: Get assigned orders for delivery person"""
    try:
        if not delivery_person:
            # Return empty list if user is not a delivery person
            return {
                "success": True,
                "message": "No assigned orders found",
                "data": []
            }
        
        if delivery_person.status != "ACTIVE":
            raise HTTPException(
                status_code=403, 
                detail="Your delivery account is not active. Please contact admin."
            )
        
        controller = DeliveryController(db)
        orders = controller.get_delivery_person_orders(delivery_person.delivery_person_id, page, per_page)
        return {
            "success": True,
            "message": "Assigned orders retrieved successfully",
            "data": orders["deliveries"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-earnings", response_model=DeliveryEarningsWrapper)
def get_my_earnings(
    delivery_person: DeliveryPerson = Depends(get_delivery_person_or_none),
    db: Session = Depends(get_db)
):
    """Delivery: Get earnings summary"""
    try:
        if not delivery_person:
            # Return zero earnings if user is not a delivery person
            return {
                "success": True,
                "message": "Earnings retrieved successfully",
                "data": {
                    "total_earnings": 0.0,
                    "completed_deliveries": 0,
                    "pending_earnings": 0.0,
                    "current_month_earnings": 0.0
                }
            }
        
        controller = DeliveryController(db)
        earnings = controller.get_delivery_person_earnings(delivery_person.delivery_person_id)
        return {
            "success": True,
            "message": "Earnings retrieved successfully",
            "data": earnings
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{delivery_id}/status", response_model=DeliveryWrapper)
def update_delivery_status_route(
    delivery_id: int,
    status_update: DeliveryStatusUpdate,
    delivery_person: DeliveryPerson = Depends(is_delivery_person),
    db: Session = Depends(get_db)
):
    """Delivery: Update delivery status"""
    controller = DeliveryController(db)
    delivery = controller.update_delivery_status(
        delivery_id, 
        status_update.status, 
        delivery_person.delivery_person_id
    )
    return {
        "success": True,
        "message": "Delivery status updated successfully",
        "data": delivery
    }

# Customer endpoints (through orders)
@router.get("/track/{order_id}", response_model=DeliveryWrapper)
def track_delivery(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Customer: Track delivery status"""
    try:
        # Get delivery for order
        delivery = db.query(Delivery).filter(Delivery.order_id == order_id).first()
        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found for this order")
        
        # Verify order belongs to user
        order = db.query(Order).filter(
            Order.order_id == order_id,
            Order.user_id == current_user.user_id
        ).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        controller = DeliveryController(db)
        delivery_data = controller.serialize_delivery(delivery, db)
        return {
            "success": True,
            "message": "Delivery tracking retrieved successfully",
            "data": delivery_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))