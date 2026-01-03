from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.delivery_admin_repository import DeliveryAdminRepository
from models.delivery.delivery import Delivery
from models.delivery.delivery_person import DeliveryPerson
from models.order.order import Order
from models.user import User
from models.notification import Notification
from datetime import datetime, timedelta
from sqlalchemy import func, text
import json


class DeliveryAdminService:

    def __init__(self, db: Session):
        self.db = db
        self.repo = DeliveryAdminRepository()

    # EXISTING METHODS (Preserved exactly as they were)
    def assignDeliveryPerson(self, order_id, delivery_person_id):
        return self.repo.create_delivery(self.db, order_id, delivery_person_id)

    def getAllDeliveries(self):
        return self.repo.get_all_deliveries(self.db)

    def getDeliveryStats(self):
        return self.repo.get_delivery_stats(self.db)

    def updateDeliveryStatus(self, delivery_id, status):
        delivery = self.db.query(Delivery).get(delivery_id)
        if not delivery:
            raise HTTPException(404, "Delivery not found")
        return self.repo.update_status(self.db, delivery, status)

    def reassignDeliveryPerson(self, delivery_id, new_person_id):
        delivery = self.db.query(Delivery).get(delivery_id)
        if not delivery:
            raise HTTPException(404, "Delivery not found")
        return self.repo.reassign_delivery(self.db, delivery, new_person_id)

    def getDeliveryEarnings(self):
        return self.repo.get_earnings(self.db)

    def getDeliveryPersonPerformance(self):
        return self.repo.get_performance(self.db)

    def searchDeliveries(self, filters):
        return self.repo.search_deliveries(self.db, filters)

    def getDeliveryTimeline(self, delivery_id):
        delivery = self.db.query(Delivery).get(delivery_id)
        if not delivery:
            raise HTTPException(404, "Delivery not found")
        return self.repo.get_timeline(delivery)

    def cancelDelivery(self, delivery_id):
        delivery = self.db.query(Delivery).get(delivery_id)
        if not delivery:
            raise HTTPException(404, "Delivery not found")
        return self.repo.cancel_delivery(self.db, delivery)

    def validateDeliveryCompletion(self, delivery_id):
        delivery = self.db.query(Delivery).get(delivery_id)
        if not delivery:
            raise HTTPException(404, "Delivery not found")
        return self.repo.validate_completion(self.db, delivery)

    def getDeliveryIssues(self):
        return self.repo.get_issues(self.db)

    # NEW METHODS for ADMIN ONLY (4 essential ones)
    def handleOrderCreatedWebhook(self, order_data):
        """Webhook for order creation - create delivery in pool & auto-send notifications"""
        try:
            order_id = order_data['order_id']
            
            # Check if order already has delivery
            existing_delivery = self.db.query(Delivery).filter(
                Delivery.order_id == order_id
            ).first()
            
            if existing_delivery:
                return {
                    "success": False,
                    "message": "Order already has delivery assignment",
                    "delivery_id": existing_delivery.delivery_id
                }
            
            # Create delivery in pool
            delivery = Delivery(
                order_id=order_id,
                status="AVAILABLE",
                assigned_at=datetime.utcnow(),
                is_available=True,
                available_since=datetime.utcnow()
            )
            self.db.add(delivery)
            self.db.commit()
            self.db.refresh(delivery)
            
            # Get order details for notification
            order = self.db.query(Order).filter(Order.order_id == order_id).first()
            customer_name = "Customer"
            delivery_address = ""
            
            if order and hasattr(order, 'customer'):
                customer_name = f"{order.customer.first_name} {order.customer.last_name}"
                delivery_address = order.shipping_address or ""
            
            # Auto-send notifications to all available delivery persons
            available_persons = self.getAvailableDeliveryPersons()
            notifications_sent = []
            
            for person in available_persons:
                try:
                    # Send notification to each delivery person
                    notification = self._sendDeliveryNotification(
                        delivery_person_id=person['delivery_person_id'],
                        delivery_id=delivery.delivery_id,
                        order_id=order_id,
                        customer_name=customer_name,
                        delivery_address=delivery_address
                    )
                    if notification:
                        notifications_sent.append(notification['notification_id'])
                except Exception as e:
                    print(f"Failed to send notification to {person['delivery_person_id']}: {e}")
                    continue
            
            return {
                "success": True,
                "message": "Delivery created and notifications sent",
                "delivery_id": delivery.delivery_id,
                "notifications_sent": len(notifications_sent),
                "delivery_persons_notified": len(available_persons)
            }
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(500, f"Failed to create delivery: {str(e)}")

    def _sendDeliveryNotification(self, delivery_person_id, delivery_id, order_id, customer_name, delivery_address):
        """Helper to send delivery notification"""
        # Get delivery person user_id
        result = self.db.execute(
            text("""
            SELECT user_id FROM delivery_person 
            WHERE delivery_person_id = :dp_id
            """),
            {"dp_id": delivery_person_id}
        ).fetchone()
        
        if not result:
            return None
        
        user_id = result[0]
        
        # Create notification
        notification = Notification(
            user_id=user_id,
            title="New Delivery Available",
            message=f"Order #{order_id} for {customer_name} at {delivery_address}",
            type="DELIVERY",
            reference_id=delivery_id,
            created_at=datetime.utcnow()
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return {
            "notification_id": notification.notification_id,
            "delivery_person_id": delivery_person_id
        }

    def getAvailableDeliveryPersons(self):
        """Get available delivery persons (admin view)"""
        try:
            results = self.db.execute(
                text("""
                SELECT 
                    delivery_person_id,
                    user_id,
                    rating,
                    is_online,
                    status
                FROM delivery_person
                WHERE is_online = true 
                AND status = 'ACTIVE'
                """)
            ).fetchall()
            
            return [
                {
                    "delivery_person_id": row[0],
                    "user_id": row[1],
                    "rating": float(row[2]) if row[2] else 0.0,
                    "is_online": row[3],
                    "status": row[4]
                }
                for row in results
            ]
        except Exception as e:
            print(f"Error in getAvailableDeliveryPersons: {e}")
            return []

    def getDeliveryPool(self):
        """Get available deliveries in pool (admin view)"""
        try:
            results = self.db.execute(
                text("""
                SELECT 
                    delivery_id,
                    order_id,
                    status,
                    assigned_at,
                    delivery_person_id
                FROM delivery
                WHERE is_available = true 
                AND status = 'AVAILABLE'
                ORDER BY assigned_at ASC
                """)
            ).fetchall()
            
            return [
                {
                    "delivery_id": row[0],
                    "order_id": row[1],
                    "status": row[2],
                    "created_at": row[3],
                    "delivery_person_id": row[4],
                    "waiting_time_minutes": (
                        (datetime.utcnow() - row[3]).total_seconds() / 60
                        if row[3] else 0
                    )
                }
                for row in results
            ]
        except Exception as e:
            print(f"Error in getDeliveryPool: {e}")
            return []

    def notifyDeliveryPerson(self, notification_data):
        """Admin manually sends notification to specific delivery person"""
        try:
            # Get delivery person user_id
            result = self.db.execute(
                text("""
                SELECT user_id FROM delivery_person 
                WHERE delivery_person_id = :dp_id
                """),
                {"dp_id": notification_data['delivery_person_id']}
            ).fetchone()
            
            if not result:
                raise HTTPException(404, "Delivery person not found")
            
            user_id = result[0]
            
            # Create notification
            notification = Notification(
                user_id=user_id,
                title=notification_data['title'],
                message=notification_data['message'],
                type="DELIVERY",
                reference_id=notification_data.get('delivery_id') or notification_data.get('order_id'),
                created_at=datetime.utcnow()
            )
            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)
            
            return {
                "notification_id": notification.notification_id,
                "message": "Notification sent successfully",
                "delivery_person_id": notification_data['delivery_person_id']
            }
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(500, f"Failed to send notification: {str(e)}")
    
    def cancelDeliveryAdmin(self, delivery_id):
        """Admin cancels delivery (makes it available again)"""
        try:
            # Check if delivery exists
            delivery = self.db.query(Delivery).filter(
                Delivery.delivery_id == delivery_id
            ).first()
            
            if not delivery:
                raise HTTPException(404, "Delivery not found")
            
            # Make delivery available again
            delivery.status = "AVAILABLE"
            delivery.is_available = True
            delivery.delivery_person_id = None
            delivery.available_since = datetime.utcnow()
            
            self.db.commit()
            
            return {
                "success": True,
                "message": "Delivery cancelled and made available again",
                "delivery_id": delivery_id
            }
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(500, f"Failed to cancel delivery: {str(e)}")