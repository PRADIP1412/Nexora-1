# delivery_panel_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, case, text, extract
from sqlalchemy.sql import exists
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
from decimal import Decimal

from models.delivery.delivery import Delivery
from models.delivery.delivery_person import DeliveryPerson
from models.delivery.delivery_earnings import DeliveryEarnings
from models.order.order import Order
from models.order.order_item import OrderItem
from models.order.order_return import OrderReturn
from models.order.order_refund import OrderRefund
from models.user import User
from models.product_catalog.product_variant import ProductVariant
from models.product_catalog.product import Product
from models.address import Address, Area, City
from models.payment import Payment
from models.feedback.feedback import Feedback
from models.feedback.user_issue import UserIssue
from models.analytics.recently_viewed import RecentlyViewed
from models.analytics.product_analytics import ProductAnalytics
from models.notification import Notification
from models.cart import Cart
from models.wishlist import Wishlist


class DeliveryPanelRepository:
    
    # ===== DASHBOARD =====
    
    @staticmethod
    def get_dashboard_stats(db: Session, delivery_person_id: int) -> Dict[str, Any]:
        """Get dashboard statistics for delivery person"""
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # Today's deliveries count
        today_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) == today
        ).count()
        
        # Completed today
        completed_today = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) == today,
            Delivery.status == "DELIVERED"
        ).count()
        
        # In progress
        in_progress = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status.in_(["ASSIGNED", "PICKED_UP", "IN_TRANSIT"])
        ).count()
        
        # Today's earnings
        today_earnings = db.query(
            func.coalesce(func.sum(DeliveryEarnings.amount), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(DeliveryEarnings.earned_at) == today
        ).scalar() or Decimal('0')
        
        # Yesterday's deliveries for comparison
        yesterday_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) == yesterday
        ).count()
        
        # Percentage change
        yesterday_comparison = 0
        if yesterday_deliveries > 0:
            yesterday_comparison = ((today_deliveries - yesterday_deliveries) / yesterday_deliveries * 100)
        
        # Average per delivery
        avg_per_delivery = 0
        if completed_today > 0:
            avg_per_delivery = float(today_earnings) / completed_today
        
        # Rating
        delivery_person = db.query(DeliveryPerson).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        rating = float(delivery_person.rating) if delivery_person and delivery_person.rating else 0.0
        
        # Total reviews (delivery feedback)
        total_reviews = db.query(Feedback).join(Order).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Feedback.feedback_type == "DELIVERY_FEEDBACK"
        ).count()
        
        # Online status
        online_status = delivery_person.is_online if delivery_person else False
        
        return {
            "today_deliveries": today_deliveries,
            "completed_today": completed_today,
            "in_progress": in_progress,
            "today_earnings": float(today_earnings),
            "rating": rating,
            "yesterday_comparison": yesterday_comparison,
            "average_per_delivery": avg_per_delivery,
            "total_reviews": total_reviews,
            "online_status": online_status
        }
    
    @staticmethod
    def get_active_deliveries_preview(db: Session, delivery_person_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Get preview of active deliveries for dashboard"""
        deliveries = db.query(
            Delivery,
            Order,
            User,
            Address,
            Area,
            City
        ).join(
            Order, Order.order_id == Delivery.order_id
        ).join(
            User, User.user_id == Order.user_id
        ).join(
            Address, Address.address_id == Order.address_id
        ).join(
            Area, Area.area_id == Address.area_id
        ).join(
            City, City.city_id == Area.city_id
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status.in_(["ASSIGNED", "PICKED_UP", "IN_TRANSIT"])
        ).order_by(
            case(
                (Delivery.status == "ASSIGNED", 1),
                (Delivery.status == "PICKED_UP", 2),
                (Delivery.status == "IN_TRANSIT", 3)
            ),
            Delivery.expected_delivery_time
        ).limit(limit).all()
        
        result = []
        for delivery, order, user, address, area, city in deliveries:
            # Get items count
            items_count = db.query(func.sum(OrderItem.quantity)).filter(
                OrderItem.order_id == order.order_id
            ).scalar() or 0
            
            # Get payment info
            payment = db.query(Payment).filter(
                Payment.order_id == order.order_id
            ).first()
            
            # Format address
            delivery_address = f"{address.line1}, {area.area_name}, {city.city_name}"
            
            # Calculate progress based on status
            progress = 0
            if delivery.status == "ASSIGNED":
                progress = 0
            elif delivery.status == "PICKED_UP":
                progress = 50
            elif delivery.status == "IN_TRANSIT":
                progress = 75
            
            # Payment type
            payment_type = "prepaid"
            amount = None
            if payment:
                payment_type = "prepaid" if payment.payment_status == "COMPLETED" else "cod"
                if payment_type == "cod":
                    amount = float(order.total_amount)
            
            # Expected time
            expected_time = None
            if delivery.expected_delivery_time:
                expected_time = delivery.expected_delivery_time.strftime("%I:%M %p")
            
            result.append({
                "order_id": order.order_id,
                "order_number": f"ORD-{order.order_id:05d}",
                "customer_name": f"{user.first_name} {user.last_name}",
                "delivery_address": delivery_address,
                "status": delivery.status,
                "expected_time": expected_time,
                "items_count": int(items_count),
                "payment_type": payment_type,
                "amount": amount,
                "progress": progress
            })
        
        return result
    
    # ===== ACTIVE DELIVERIES =====
    
    @staticmethod
    def get_active_deliveries(db: Session, delivery_person_id: int, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all active deliveries with details"""
        query = db.query(
            Delivery,
            Order,
            User,
            Address,
            Area,
            City,
            Payment
        ).join(
            Order, Order.order_id == Delivery.order_id
        ).join(
            User, User.user_id == Order.user_id
        ).join(
            Address, Address.address_id == Order.address_id
        ).join(
            Area, Area.area_id == Address.area_id
        ).join(
            City, City.city_id == Area.city_id
        ).outerjoin(
            Payment, Payment.order_id == Order.order_id
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status.in_(["ASSIGNED", "PICKED_UP", "IN_TRANSIT"])
        )
        
        # Apply filters
        if filters:
            if filters.get('status'):
                query = query.filter(Delivery.status == filters['status'])
            if filters.get('priority'):
                # Note: No priority field in Delivery model - using mock logic
                pass
        
        deliveries = query.order_by(
            Delivery.expected_delivery_time
        ).all()
        
        result = []
        for delivery, order, user, address, area, city, payment in deliveries:
            # Get items count
            items_count = db.query(func.sum(OrderItem.quantity)).filter(
                OrderItem.order_id == order.order_id
            ).scalar() or 0
            
            # Format address
            delivery_address = f"{address.line1}"
            if address.line2:
                delivery_address += f", {address.line2}"
            delivery_address += f", {area.area_name}, {city.city_name}"
            
            # Pickup location (mock - using store address from first delivery)
            pickup_location = "Nexora Store"
            
            # Status text mapping
            status_text = delivery.status
            if delivery.status == "ASSIGNED":
                status_text = "Pending Pickup"
            elif delivery.status == "PICKED_UP":
                status_text = "Picked Up"
            elif delivery.status == "IN_TRANSIT":
                status_text = "In Transit"
            
            # Progress calculation
            progress = 0
            if delivery.status == "ASSIGNED":
                progress = 0
            elif delivery.status == "PICKED_UP":
                progress = 50
            elif delivery.status == "IN_TRANSIT":
                progress = 75
            
            # ETA calculation (mock)
            eta = None
            if progress > 0:
                eta = "15 mins away"
            
            # Payment type and amount
            payment_type = "prepaid"
            amount = None
            if payment:
                payment_type = "prepaid" if payment.payment_status == "COMPLETED" else "cod"
                if payment_type == "cod":
                    amount = float(order.total_amount)
            
            # Expected time
            expected_time = None
            if delivery.expected_delivery_time:
                expected_time = delivery.expected_delivery_time.strftime("%I:%M %p")
            
            # Distance
            distance_km = float(delivery.distance_km) if delivery.distance_km else 0.0
            
            # Determine available actions
            actions = []
            if delivery.status == "ASSIGNED":
                actions = ["call", "navigate", "mark-picked"]
            elif delivery.status == "PICKED_UP":
                actions = ["call", "navigate", "mark-delivered"]
            elif delivery.status == "IN_TRANSIT":
                actions = ["call", "navigate", "mark-delivered"]
            
            result.append({
                "order_id": order.order_id,
                "order_number": f"ORD-{order.order_id:05d}",
                "priority": None,  # No priority field in model
                "status": delivery.status,
                "status_text": status_text,
                "customer_name": f"{user.first_name} {user.last_name}",
                "customer_phone": user.phone or "",
                "customer_avatar": user.profile_img_url,
                "pickup_location": pickup_location,
                "delivery_address": delivery_address,
                "distance_km": distance_km,
                "expected_time": expected_time,
                "items_count": int(items_count),
                "payment_type": payment_type,
                "amount": amount,
                "progress": progress,
                "eta": eta,
                "actions": actions
            })
        
        return result
    
    @staticmethod
    def update_delivery_status(
        db: Session, 
        delivery_id: int, 
        status: str,
        delivery_person_id: int,
        notes: Optional[str] = None
    ) -> bool:
        """Update delivery status"""
        delivery = db.query(Delivery).filter(
            Delivery.delivery_id == delivery_id,
            Delivery.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery:
            return False
        
        delivery.status = status
        
        # Update timestamps based on status
        if status == "DELIVERED":
            delivery.delivered_at = datetime.now()
            delivery.actual_delivery_time = datetime.now()
            
            # Check if earnings record already exists
            existing_earning = db.query(DeliveryEarnings).filter(
                DeliveryEarnings.delivery_id == delivery_id
            ).first()
            
            if not existing_earning:
                # Get order to calculate earnings
                order = db.query(Order).filter(Order.order_id == delivery.order_id).first()
                if order and order.delivery_fee:
                    earnings = DeliveryEarnings(
                        delivery_person_id=delivery_person_id,
                        delivery_id=delivery_id,
                        amount=order.delivery_fee,
                        earned_at=datetime.now()
                    )
                    db.add(earnings)
        
        if notes:
            delivery.delivery_notes = notes
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating delivery status: {e}")
            return False
    
    @staticmethod
    def update_delivery_person_location(
        db: Session,
        delivery_person_id: int,
        latitude: float,
        longitude: float
    ) -> bool:
        """Update delivery person's current location"""
        delivery_person = db.query(DeliveryPerson).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery_person:
            return False
        
        delivery_person.current_location = {
            "lat": latitude,
            "lng": longitude,
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating location: {e}")
            return False
    
    # ===== PENDING PICKUPS =====
    
    @staticmethod
    def get_pending_pickups(db: Session, delivery_person_id: int) -> List[Dict[str, Any]]:
        """Get pending pickups for delivery person"""
        # Get deliveries that are assigned but not picked up yet
        deliveries = db.query(
            Delivery,
            Order,
            User,
            Address,
            Area,
            City
        ).join(
            Order, Order.order_id == Delivery.order_id
        ).join(
            User, User.user_id == Order.user_id
        ).join(
            Address, Address.address_id == Order.address_id
        ).join(
            Area, Area.area_id == Address.area_id
        ).join(
            City, City.city_id == Area.city_id
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "ASSIGNED"
        ).order_by(
            Delivery.expected_delivery_time
        ).all()
        
        result = []
        for delivery, order, user, address, area, city in deliveries:
            # Get items count
            items_count = db.query(func.sum(OrderItem.quantity)).filter(
                OrderItem.order_id == order.order_id
            ).scalar() or 0
            
            # Format pickup location (mock - using store location)
            pickup_location = "Nexora Store"
            pickup_address = "Sector 16, Gandhinagar"  # Mock address
            
            # Expected pickup time (using delivery expected time)
            expected_pickup_time = None
            if delivery.expected_delivery_time:
                expected_pickup_time = delivery.expected_delivery_time.strftime("%I:%M %p")
            
            # Distance (mock - using delivery distance)
            distance_km = float(delivery.distance_km) if delivery.distance_km else 0.0
            
            result.append({
                "pickup_id": f"PK-{delivery.delivery_id:05d}",
                "order_id": order.order_id,
                "order_number": f"ORD-{order.order_id:05d}",
                "customer_name": f"{user.first_name} {user.last_name}",
                "pickup_location": pickup_location,
                "pickup_address": pickup_address,
                "items_count": int(items_count),
                "expected_pickup_time": expected_pickup_time,
                "distance_km": distance_km,
                "actions": ["view-details", "confirm-pickup"]
            })
        
        return result
    
    @staticmethod
    def verify_pickup_qr(db: Session, qr_data: str, delivery_person_id: int) -> Dict[str, Any]:
        """Verify QR code for pickup"""
        try:
            # Parse QR data - assuming format: ORD-{order_id}-PICKUP
            if not qr_data.startswith("ORD-"):
                return {"valid": False, "message": "Invalid QR code format"}
            
            try:
                order_id = int(qr_data.split('-')[1])
            except (IndexError, ValueError):
                return {"valid": False, "message": "Invalid order ID in QR code"}
            
            # Check if delivery exists and assigned to this delivery person
            delivery = db.query(Delivery).filter(
                Delivery.order_id == order_id,
                Delivery.delivery_person_id == delivery_person_id,
                Delivery.status == "ASSIGNED"
            ).first()
            
            if not delivery:
                return {"valid": False, "message": "Delivery not found or not ready for pickup"}
            
            return {
                "valid": True,
                "order_id": order_id,
                "delivery_id": delivery.delivery_id,
                "action": "pickup",
                "message": f"QR verified for order {order_id}"
            }
            
        except Exception as e:
            return {"valid": False, "message": f"QR verification failed: {str(e)}"}
    
    @staticmethod
    def confirm_pickup(
        db: Session,
        delivery_id: int,
        delivery_person_id: int,
        confirmation_code: Optional[str] = None,
        notes: Optional[str] = None
    ) -> bool:
        """Confirm pickup and update delivery status"""
        return DeliveryPanelRepository.update_delivery_status(
            db, delivery_id, "PICKED_UP", delivery_person_id, notes
        )
    
    # ===== COMPLETED DELIVERIES =====
    
    @staticmethod
    def get_completed_deliveries(
        db: Session, 
        delivery_person_id: int,
        filters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """Get completed deliveries with filters"""
        query = db.query(
            Delivery,
            Order,
            User,
            Address,
            Area,
            City,
            DeliveryEarnings
        ).join(
            Order, Order.order_id == Delivery.order_id
        ).join(
            User, User.user_id == Order.user_id
        ).join(
            Address, Address.address_id == Order.address_id
        ).join(
            Area, Area.area_id == Address.area_id
        ).join(
            City, City.city_id == Area.city_id
        ).outerjoin(
            DeliveryEarnings, DeliveryEarnings.delivery_id == Delivery.delivery_id
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED"
        )
        
        # Apply filters
        if filters:
            if filters.get('date_from'):
                query = query.filter(func.date(Delivery.delivered_at) >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(func.date(Delivery.delivered_at) <= filters['date_to'])
        
        deliveries = query.order_by(
            desc(Delivery.delivered_at)
        ).all()
        
        result = []
        for delivery, order, user, address, area, city, earnings in deliveries:
            # Format address
            delivery_address = f"{address.line1}, {area.area_name}"
            
            # Get rating from feedback
            rating_query = db.query(Feedback.rating).filter(
                Feedback.order_id == order.order_id,
                Feedback.feedback_type == "DELIVERY_FEEDBACK"
            ).first()
            rating = float(rating_query[0]) if rating_query and rating_query[0] else None
            
            # Earnings
            delivery_earnings = float(earnings.amount) if earnings else 0.0
            
            # Distance
            distance_km = float(delivery.distance_km) if delivery.distance_km else 0.0
            
            result.append({
                "order_id": order.order_id,
                "order_number": f"ORD-{order.order_id:05d}",
                "customer_name": f"{user.first_name} {user.last_name}",
                "customer_avatar": user.profile_img_url,
                "delivery_address": delivery_address,
                "delivered_at": delivery.delivered_at,
                "amount": float(order.total_amount),
                "earnings": delivery_earnings,
                "rating": rating,
                "distance_km": distance_km,
                "status": delivery.status
            })
        
        return result
    
    @staticmethod
    def get_completed_deliveries_summary(db: Session, delivery_person_id: int, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get summary statistics for completed deliveries"""
        query = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED"
        )
        
        if filters:
            if filters.get('date_from'):
                query = query.filter(func.date(Delivery.delivered_at) >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(func.date(Delivery.delivered_at) <= filters['date_to'])
        
        total_completed = query.count()
        
        # On-time deliveries (within 30 minutes of expected time)
        on_time_query = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED",
            Delivery.actual_delivery_time.isnot(None),
            Delivery.expected_delivery_time.isnot(None),
            func.extract('epoch', Delivery.actual_delivery_time - Delivery.expected_delivery_time) <= 1800  # 30 minutes
        )
        
        if filters:
            if filters.get('date_from'):
                on_time_query = on_time_query.filter(func.date(Delivery.delivered_at) >= filters['date_from'])
            if filters.get('date_to'):
                on_time_query = on_time_query.filter(func.date(Delivery.delivered_at) <= filters['date_to'])
        
        on_time_count = on_time_query.count()
        
        # Average rating
        avg_rating = db.query(
            func.avg(Feedback.rating)
        ).join(Order).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Feedback.feedback_type == "DELIVERY_FEEDBACK"
        ).scalar() or 0.0
        
        return {
            "total_completed": total_completed,
            "on_time_count": on_time_count,
            "on_time_rate": (on_time_count / total_completed * 100) if total_completed > 0 else 0,
            "average_rating": float(avg_rating) if avg_rating else 0.0
        }
    
    @staticmethod
    def get_pod_details(db: Session, delivery_id: int, delivery_person_id: int) -> Optional[Dict[str, Any]]:
        """Get Proof of Delivery details"""
        delivery = db.query(Delivery).filter(
            Delivery.delivery_id == delivery_id,
            Delivery.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery:
            return None
        
        return {
            "image_url": delivery.pod_image_url,
            "signature_url": delivery.signature_url,
            "delivery_notes": delivery.delivery_notes,
            "delivered_at": delivery.delivered_at
        }
    
    # ===== EARNINGS =====
    
    @staticmethod
    def get_earnings_overview(db: Session, delivery_person_id: int) -> Dict[str, Any]:
        """Get earnings overview for different periods"""
        today = date.today()
        
        # Today's earnings
        today_earnings = db.query(
            func.coalesce(func.sum(DeliveryEarnings.amount), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(DeliveryEarnings.earned_at) == today
        ).scalar() or Decimal('0')
        
        today_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) == today,
            Delivery.status == "DELIVERED"
        ).count()
        
        # This week (Monday to Sunday)
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        week_earnings = db.query(
            func.coalesce(func.sum(DeliveryEarnings.amount), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(DeliveryEarnings.earned_at) >= week_start,
            func.date(DeliveryEarnings.earned_at) <= week_end
        ).scalar() or Decimal('0')
        
        week_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) >= week_start,
            func.date(Delivery.assigned_at) <= week_end,
            Delivery.status == "DELIVERED"
        ).count()
        
        # This month
        month_start = today.replace(day=1)
        next_month = month_start.replace(month=month_start.month % 12 + 1, year=month_start.year + (month_start.month // 12))
        month_end = next_month - timedelta(days=1)
        
        month_earnings = db.query(
            func.coalesce(func.sum(DeliveryEarnings.amount), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(DeliveryEarnings.earned_at) >= month_start,
            func.date(DeliveryEarnings.earned_at) <= month_end
        ).scalar() or Decimal('0')
        
        month_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) >= month_start,
            func.date(Delivery.assigned_at) <= month_end,
            Delivery.status == "DELIVERED"
        ).count()
        
        # Total earnings
        total_earnings = db.query(
            func.coalesce(func.sum(DeliveryEarnings.amount), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id
        ).scalar() or Decimal('0')
        
        # Pending settlement
        pending_earnings_query = db.query(
            func.coalesce(func.sum(Order.delivery_fee), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED",
            ~Delivery.earnings.any()
        )
        pending_earnings = float(pending_earnings_query.scalar() or Decimal('0'))
        
        # Settled amount (total - pending)
        settled_amount = float(total_earnings) - pending_earnings
        
        return {
            "today": {
                "period": "Today",
                "amount": float(today_earnings),
                "deliveries": today_deliveries,
                "average_per_delivery": float(today_earnings) / today_deliveries if today_deliveries > 0 else 0
            },
            "this_week": {
                "period": "This Week",
                "amount": float(week_earnings),
                "deliveries": week_deliveries,
                "average_per_delivery": float(week_earnings) / week_deliveries if week_deliveries > 0 else 0
            },
            "this_month": {
                "period": "This Month",
                "amount": float(month_earnings),
                "deliveries": month_deliveries,
                "average_per_delivery": float(month_earnings) / month_deliveries if month_deliveries > 0 else 0
            },
            "total": float(total_earnings),
            "pending_settlement": pending_earnings,
            "settled_amount": settled_amount
        }
    
    @staticmethod
    def get_earnings_breakdown(db: Session, delivery_person_id: int) -> Dict[str, float]:
        """Get earnings breakdown by category"""
        # Note: This is mock data since we don't have category breakdown in models
        # In production, this would come from a separate earnings_breakdown table
        
        return {
            "base_delivery_fee": 14240.0,
            "peak_hour_bonus": 1850.0,
            "distance_bonus": 980.0,
            "rating_bonus": 650.0,
            "incentives_rewards": 780.0
        }
    
    @staticmethod
    def get_transaction_history(db: Session, delivery_person_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Get transaction history"""
        # Note: We don't have a transaction table, so using DeliveryEarnings as proxy
        earnings = db.query(DeliveryEarnings).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id
        ).order_by(
            desc(DeliveryEarnings.earned_at)
        ).limit(limit).all()
        
        result = []
        for idx, earning in enumerate(earnings):
            # Get order count for that day
            same_day_earnings = db.query(DeliveryEarnings).filter(
                DeliveryEarnings.delivery_person_id == delivery_person_id,
                func.date(DeliveryEarnings.earned_at) == func.date(earning.earned_at)
            ).count()
            
            result.append({
                "transaction_id": f"TXN-{earning.earning_id:06d}",
                "date": earning.earned_at.date(),
                "description": "Delivery Earnings",
                "order_count": same_day_earnings,
                "amount": float(earning.amount),
                "status": "SETTLED",
                "reference": f"BATCH-{earning.earned_at.strftime('%Y%m%d')}"
            })
        
        return result
    
    @staticmethod
    def get_bank_details(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
        """Get bank details for delivery person"""
        # Note: We don't have a bank_details table in models
        # This would need to be added in future implementation
        return {
            "account_holder": "Rajesh Kumar",
            "bank_name": "HDFC Bank",
            "account_number": "••••••••5678",
            "ifsc_code": "HDFC0001234",
            "is_verified": True
        }
    
    # ===== ROUTE MAP =====
    
    @staticmethod
    def get_route_data(db: Session, delivery_person_id: int) -> Dict[str, Any]:
        """Get route data for today's deliveries"""
        today = date.today()
        
        # Get today's deliveries
        deliveries = db.query(
            Delivery,
            Order,
            User,
            Address,
            Area,
            City
        ).join(
            Order, Order.order_id == Delivery.order_id
        ).join(
            User, User.user_id == Order.user_id
        ).join(
            Address, Address.address_id == Order.address_id
        ).join(
            Area, Area.area_id == Address.area_id
        ).join(
            City, City.city_id == Area.city_id
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(Delivery.assigned_at) == today,
            Delivery.status.in_(["ASSIGNED", "PICKED_UP", "IN_TRANSIT"])
        ).order_by(
            Delivery.expected_delivery_time
        ).all()
        
        if not deliveries:
            return {
                "route_id": f"ROUTE-{today.strftime('%Y%m%d')}",
                "total_distance_km": 0,
                "estimated_duration_minutes": 0,
                "total_stops": 0,
                "current_stop": 0,
                "stops": [],
                "optimized_path": [],
                "map_url": None
            }
        
        # Mock pickup location
        pickup_location = {
            "address": "Nexora Store, Sector 16, Gandhinagar",
            "latitude": 23.2156,
            "longitude": 72.6369
        }
        
        stops = []
        total_distance = 0
        current_stop = 1  # Starting from pickup
        
        # Add pickup as first stop
        stops.append({
            "stop_number": 1,
            "type": "pickup",
            "order_id": None,
            "customer_name": None,
            "address": pickup_location["address"],
            "latitude": pickup_location["latitude"],
            "longitude": pickup_location["longitude"],
            "distance_from_previous": 0,
            "estimated_time": "0 min",
            "status": "pending"
        })
        
        # Add delivery stops
        for idx, (delivery, order, user, address, area, city) in enumerate(deliveries, 2):
            delivery_address = f"{address.line1}, {area.area_name}, {city.city_name}"
            
            # Mock distance calculation (in production, use distance matrix API)
            distance = float(delivery.distance_km) if delivery.distance_km else (idx * 2.5)
            total_distance += distance
            
            # Estimated time based on distance
            estimated_minutes = int(distance * 3)  # 3 minutes per km
            
            # Status based on delivery status
            stop_status = "pending"
            if delivery.status == "PICKED_UP":
                stop_status = "completed"
                current_stop = idx
            elif delivery.status == "IN_TRANSIT":
                stop_status = "current"
                current_stop = idx
            
            stops.append({
                "stop_number": idx,
                "type": "delivery",
                "order_id": order.order_id,
                "customer_name": f"{user.first_name} {user.last_name}",
                "address": delivery_address,
                "latitude": 23.0 + (idx * 0.1),  # Mock coordinates
                "longitude": 72.5 + (idx * 0.1),
                "distance_from_previous": distance,
                "estimated_time": f"{estimated_minutes} min",
                "status": stop_status
            })
        
        # Mock optimized path (in production, use route optimization algorithm)
        optimized_path = [
            {"lat": pickup_location["latitude"], "lng": pickup_location["longitude"]}
        ]
        for stop in stops[1:]:
            if stop.get("latitude") and stop.get("longitude"):
                optimized_path.append({"lat": stop["latitude"], "lng": stop["longitude"]})
        
        return {
            "route_id": f"ROUTE-{today.strftime('%Y%m%d')}",
            "total_distance_km": total_distance,
            "estimated_duration_minutes": int(total_distance * 3) + 30,  # 3 min/km + 30 min buffer
            "total_stops": len(stops),
            "current_stop": current_stop,
            "stops": stops,
            "optimized_path": optimized_path,
            "map_url": f"https://maps.google.com/?q={pickup_location['latitude']},{pickup_location['longitude']}"
        }
    
    # ===== PERFORMANCE =====
    
    @staticmethod
    def get_performance_metrics(db: Session, delivery_person_id: int, period: str = "month") -> Dict[str, Any]:
        """Get performance metrics"""
        today = date.today()
        
        if period == "week":
            start_date = today - timedelta(days=7)
        else:  # month
            start_date = today.replace(day=1)
        
        # Total deliveries in period
        total_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED",
            func.date(Delivery.delivered_at) >= start_date
        ).count()
        
        # On-time deliveries
        on_time_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED",
            func.date(Delivery.delivered_at) >= start_date,
            Delivery.actual_delivery_time.isnot(None),
            Delivery.expected_delivery_time.isnot(None),
            func.extract('epoch', Delivery.actual_delivery_time - Delivery.expected_delivery_time) <= 1800
        ).count()
        
        # Average rating
        avg_rating = db.query(
            func.avg(Feedback.rating)
        ).join(Order).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Feedback.feedback_type == "DELIVERY_FEEDBACK",
            func.date(Feedback.created_at) >= start_date
        ).scalar() or 0.0
        
        # Total earnings
        total_earnings = db.query(
            func.coalesce(func.sum(DeliveryEarnings.amount), 0)
        ).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            func.date(DeliveryEarnings.earned_at) >= start_date
        ).scalar() or Decimal('0')
        
        # Average delivery time
        avg_delivery_time = db.query(
            func.avg(
                func.extract('epoch', Delivery.actual_delivery_time - Delivery.assigned_at) / 60
            )
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED",
            func.date(Delivery.delivered_at) >= start_date,
            Delivery.actual_delivery_time.isnot(None),
            Delivery.assigned_at.isnot(None)
        ).scalar() or 0.0
        
        # Cancellation rate
        cancelled_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "CANCELLED",
            func.date(Delivery.assigned_at) >= start_date
        ).count()
        
        total_assignments = total_deliveries + cancelled_deliveries
        cancellation_rate = (cancelled_deliveries / total_assignments * 100) if total_assignments > 0 else 0
        
        # Customer satisfaction score (based on ratings >= 4)
        high_ratings = db.query(Feedback).join(Order).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Feedback.feedback_type == "DELIVERY_FEEDBACK",
            Feedback.rating >= 4,
            func.date(Feedback.created_at) >= start_date
        ).count()
        
        total_feedback = db.query(Feedback).join(Order).join(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Feedback.feedback_type == "DELIVERY_FEEDBACK",
            func.date(Feedback.created_at) >= start_date
        ).count()
        
        customer_satisfaction = (high_ratings / total_feedback * 100) if total_feedback > 0 else 0
        
        return {
            "total_deliveries": total_deliveries,
            "on_time_deliveries": on_time_deliveries,
            "on_time_rate": (on_time_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0,
            "average_rating": float(avg_rating) if avg_rating else 0.0,
            "total_earnings": float(total_earnings),
            "average_delivery_time_minutes": float(avg_delivery_time) if avg_delivery_time else 0.0,
            "cancellation_rate": cancellation_rate,
            "customer_satisfaction_score": customer_satisfaction
        }
    
    @staticmethod
    def get_rating_history(db: Session, delivery_person_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get rating history"""
        feedbacks = db.query(
            Feedback,
            Order,
            User
        ).join(
            Order, Order.order_id == Feedback.order_id
        ).join(
            User, User.user_id == Feedback.user_id
        ).join(
            Delivery, Delivery.order_id == Order.order_id
        ).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Feedback.feedback_type == "DELIVERY_FEEDBACK",
            Feedback.rating.isnot(None)
        ).order_by(
            desc(Feedback.created_at)
        ).limit(limit).all()
        
        result = []
        for feedback, order, user in feedbacks:
            result.append({
                "date": feedback.created_at.date(),
                "rating": float(feedback.rating) if feedback.rating else 0.0,
                "feedback": feedback.message,
                "order_id": order.order_id
            })
        
        return result
    
    # ===== SCHEDULE =====
    
    @staticmethod
    def get_schedule(db: Session, delivery_person_id: int, start_date: date = None, end_date: date = None) -> List[Dict[str, Any]]:
        """Get schedule for delivery person"""
        # Note: We don't have a schedule table in models
        # This is mock data - in production, create a delivery_schedule table
        
        # Mock schedule data
        mock_schedule = [
            {
                "shift_id": 1,
                "date": date.today(),
                "start_time": "09:00",
                "end_time": "18:00",
                "location": "Gandhinagar Zone",
                "zone": "Zone A",
                "status": "ONGOING",
                "scheduled_deliveries": 12,
                "completed_deliveries": 8
            },
            {
                "shift_id": 2,
                "date": date.today() + timedelta(days=1),
                "start_time": "10:00",
                "end_time": "19:00",
                "location": "Ahmedabad Central",
                "zone": "Zone B",
                "status": "SCHEDULED",
                "scheduled_deliveries": 10,
                "completed_deliveries": 0
            }
        ]
        
        # Filter by date if provided
        if start_date:
            mock_schedule = [s for s in mock_schedule if s["date"] >= start_date]
        if end_date:
            mock_schedule = [s for s in mock_schedule if s["date"] <= end_date]
        
        return mock_schedule
    
    @staticmethod
    def create_shift(db: Session, delivery_person_id: int, shift_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new shift"""
        # Note: This is mock implementation
        # In production, insert into delivery_schedule table
        
        new_shift = {
            "shift_id": 1000,  # Mock ID
            "delivery_person_id": delivery_person_id,
            **shift_data,
            "status": "SCHEDULED",
            "scheduled_deliveries": 0,
            "completed_deliveries": 0
        }
        
        return new_shift
    
    @staticmethod
    def update_shift(db: Session, shift_id: int, delivery_person_id: int, update_data: Dict[str, Any]) -> bool:
        """Update shift details"""
        # Note: This is mock implementation
        # In production, update delivery_schedule table
        
        return True  # Mock success
    
    # ===== VEHICLE =====
    
    @staticmethod
    def get_vehicle_info(db: Session, delivery_person_id: int) -> Optional[Dict[str, Any]]:
        """Get vehicle information"""
        delivery_person = db.query(DeliveryPerson).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery_person or not delivery_person.vehicle_info:
            return None
        
        vehicle_info = delivery_person.vehicle_info
        
        # Mock health status calculation
        health_status = "good"
        if "insurance" in vehicle_info:
            insurance_date = datetime.strptime(vehicle_info["insurance"], "%Y-%m-%d").date()
            if insurance_date < date.today():
                health_status = "critical"
            elif insurance_date < date.today() + timedelta(days=30):
                health_status = "warning"
        
        return {
            "vehicle_type": vehicle_info.get("type"),
            "registration_number": vehicle_info.get("number"),
            "color": "Red",  # Mock - not in current model
            "year": 2023,  # Mock - not in current model
            "insurance_valid_until": datetime.strptime(vehicle_info.get("insurance", "2025-12-31"), "%Y-%m-%d").date(),
            "last_service_date": date.today() - timedelta(days=60),  # Mock
            "next_service_due_km": 500.0,  # Mock
            "fuel_efficiency": 45.0,  # Mock
            "health_status": health_status
        }
    
    @staticmethod
    def update_vehicle_info(db: Session, delivery_person_id: int, update_data: Dict[str, Any]) -> bool:
        """Update vehicle information"""
        delivery_person = db.query(DeliveryPerson).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery_person:
            return False
        
        current_info = delivery_person.vehicle_info or {}
        
        # Update specific fields
        if update_data.get("registration_number"):
            current_info["number"] = update_data["registration_number"]
        
        if update_data.get("insurance_valid_until"):
            current_info["insurance"] = update_data["insurance_valid_until"].strftime("%Y-%m-%d")
        
        delivery_person.vehicle_info = current_info
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating vehicle info: {e}")
            return False
    
    @staticmethod
    def get_vehicle_documents(db: Session, delivery_person_id: int) -> List[Dict[str, Any]]:
        """Get vehicle documents"""
        delivery_person = db.query(DeliveryPerson).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery_person or not delivery_person.documents:
            return []
        
        documents = delivery_person.documents
        
        result = []
        for doc_type, doc_url in documents.items():
            result.append({
                "document_type": doc_type.upper(),
                "document_name": f"{doc_type.capitalize()} Document",
                "upload_date": date.today() - timedelta(days=30),  # Mock
                "valid_until": date.today() + timedelta(days=365),  # Mock
                "download_url": doc_url,
                "is_verified": True  # Mock
            })
        
        return result
    
    # ===== SUPPORT =====
    
    @staticmethod
    def create_support_ticket(
        db: Session,
        user_id: int,
        issue_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a support ticket"""
        # Using UserIssue model for support tickets
        issue = UserIssue(
            raised_by_id=user_id,
            raised_by_role="delivery",
            order_id=issue_data.get("order_id"),
            issue_type=issue_data["issue_type"],
            title=issue_data["title"],
            description=issue_data["description"],
            priority=issue_data.get("priority", "MEDIUM"),
            status="OPEN"
        )
        
        try:
            db.add(issue)
            db.commit()
            db.refresh(issue)
            
            return {
                "ticket_id": issue.issue_id,
                "issue_type": issue.issue_type,
                "title": issue.title,
                "status": issue.status,
                "created_at": issue.created_at,
                "priority": issue.priority,
                "order_id": issue.order_id,
                "ticket_number": f"TICKET-{issue.issue_id:06d}"
            }
        except Exception as e:
            db.rollback()
            print(f"Error creating support ticket: {e}")
            return {}
    
    # ===== PROFILE =====
    
    @staticmethod
    def get_delivery_profile(db: Session, delivery_person_id: int) -> Optional[Dict[str, Any]]:
        """Get delivery person profile"""
        delivery_person = db.query(
            DeliveryPerson,
            User
        ).join(
            User, User.user_id == DeliveryPerson.user_id
        ).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery_person:
            return None
        
        dp, user = delivery_person
        
        # Get performance metrics
        total_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED"
        ).count()
        
        on_time_deliveries = db.query(Delivery).filter(
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "DELIVERED",
            Delivery.actual_delivery_time.isnot(None),
            Delivery.expected_delivery_time.isnot(None),
            func.extract('epoch', Delivery.actual_delivery_time - Delivery.expected_delivery_time) <= 1800
        ).count()
        
        on_time_rate = (on_time_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0
        
        # Get vehicle info
        vehicle_info = DeliveryPanelRepository.get_vehicle_info(db, delivery_person_id)
        
        return {
            "user_id": user.user_id,
            "full_name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "phone": user.phone or "",
            "profile_image_url": user.profile_img_url,
            "date_of_birth": user.dob,
            "address": "Sector 7, Gandhinagar",  # Mock - not stored in User model
            "joining_date": dp.joined_at.date() if dp.joined_at else date.today(),
            "rating": float(dp.rating) if dp.rating else 0.0,
            "total_deliveries": total_deliveries,
            "on_time_rate": on_time_rate,
            "online_status": dp.is_online,
            "current_location": dp.current_location,
            "vehicle_info": vehicle_info
        }
    
    @staticmethod
    def update_profile(db: Session, user_id: int, update_data: Dict[str, Any]) -> bool:
        """Update user profile"""
        user = db.query(User).filter(User.user_id == user_id).first()
        
        if not user:
            return False
        
        if update_data.get("full_name"):
            # Split name into first and last
            name_parts = update_data["full_name"].split()
            if len(name_parts) >= 2:
                user.first_name = name_parts[0]
                user.last_name = " ".join(name_parts[1:])
            else:
                user.first_name = update_data["full_name"]
                user.last_name = ""
        
        if update_data.get("phone"):
            user.phone = update_data["phone"]
        
        if update_data.get("profile_image_url"):
            user.profile_img_url = update_data["profile_image_url"]
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating profile: {e}")
            return False
    
    @staticmethod
    def update_online_status(
        db: Session,
        delivery_person_id: int,
        online_status: bool,
        current_location: Optional[Dict[str, float]] = None
    ) -> bool:
        """Update delivery person online status"""
        delivery_person = db.query(DeliveryPerson).filter(
            DeliveryPerson.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery_person:
            return False
        
        delivery_person.is_online = online_status
        
        if current_location:
            delivery_person.current_location = current_location
        
        try:
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error updating online status: {e}")
            return False