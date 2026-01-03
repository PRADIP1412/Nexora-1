from sqlalchemy.orm import Session
from sqlalchemy import func
from models.delivery.delivery import Delivery
from models.delivery.delivery_person import DeliveryPerson
from models.delivery.delivery_earnings import DeliveryEarnings
from models.feedback.user_issue import UserIssue
from models.order.order import Order
from datetime import datetime


class DeliveryAdminRepository:

    # 1️⃣ Assign delivery
    def create_delivery(self, db: Session, order_id: int, delivery_person_id: int):
        delivery = Delivery(
            order_id=order_id,
            delivery_person_id=delivery_person_id,
            status="ASSIGNED"
        )
        db.add(delivery)
        db.commit()
        db.refresh(delivery)
        return delivery

    # 2️⃣ Get all deliveries
    def get_all_deliveries(self, db: Session):
        return db.query(Delivery).all()

    # 4️⃣ Stats
    def get_delivery_stats(self, db: Session):
        return {
            "active": db.query(Delivery).filter(Delivery.status == "OUT_FOR_DELIVERY").count(),
            "completed": db.query(Delivery).filter(Delivery.status == "DELIVERED").count(),
            "pending": db.query(Delivery).filter(Delivery.status == "ASSIGNED").count(),
            "cancelled": db.query(Delivery).filter(Delivery.status == "CANCELLED").count(),
        }

    # 5️⃣ Update status
    def update_status(self, db: Session, delivery: Delivery, status: str):
        delivery.status = status
        if status == "DELIVERED":
            delivery.delivered_at = datetime.utcnow()
        db.commit()
        db.refresh(delivery)
        return delivery

    # 6️⃣ Reassign
    def reassign_delivery(self, db: Session, delivery: Delivery, new_person_id: int):
        delivery.delivery_person_id = new_person_id
        db.commit()
        db.refresh(delivery)
        return delivery

    # 7️⃣ Earnings
    def get_earnings(self, db: Session):
        # Get raw earnings data
        earnings_data = db.query(
            DeliveryEarnings.delivery_person_id,
            func.sum(DeliveryEarnings.amount).label("total"),
            func.count(DeliveryEarnings.delivery_id).label("count")
        ).group_by(DeliveryEarnings.delivery_person_id).all()
        
        # Convert to list of dictionaries for proper JSON serialization
        earnings_list = []
        for earning in earnings_data:
            # Get delivery person info
            delivery_person = db.query(DeliveryPerson).filter(
                DeliveryPerson.delivery_person_id == earning.delivery_person_id
            ).first()
            
            earnings_list.append({
                "delivery_person_id": earning.delivery_person_id,
                "delivery_person_name": delivery_person.user.username if delivery_person and delivery_person.user else "Unknown",
                "total_earnings": float(earning.total) if earning.total else 0.0,
                "total_deliveries": earning.count or 0
            })
        
        return {
            "success": True,
            "message": "Delivery earnings fetched successfully",
            "data": earnings_list
        }

    # 8️⃣ Performance - FIXED VERSION
    def get_performance(self, db: Session):
        # Get raw performance data
        performance_data = db.query(
            Delivery.delivery_person_id,
            func.count(Delivery.delivery_id).label("completed")
        ).filter(Delivery.status == "DELIVERED") \
         .group_by(Delivery.delivery_person_id).all()
        
        # Convert to list of dictionaries for proper JSON serialization
        performance_list = []
        for perf in performance_data:
            # Get delivery person info
            delivery_person = db.query(DeliveryPerson).filter(
                DeliveryPerson.delivery_person_id == perf.delivery_person_id
            ).first()
            
            # Get total deliveries for this person
            total_deliveries = db.query(Delivery).filter(
                Delivery.delivery_person_id == perf.delivery_person_id
            ).count()
            
            # Calculate rating (simplified - you can adjust this)
            rating = 4.5  # Default rating
            if delivery_person:
                rating = float(delivery_person.rating) if delivery_person.rating else 4.0
            
            performance_list.append({
                "delivery_person_id": perf.delivery_person_id,
                "delivery_person_name": delivery_person.user.username if delivery_person and delivery_person.user else "Unknown",
                "completed_deliveries": perf.completed or 0,
                "total_deliveries": total_deliveries or 0,
                "completion_rate": round((perf.completed / total_deliveries * 100) if total_deliveries > 0 else 0, 1),
                "rating": rating
            })
        
        return {
            "success": True,
            "message": "Delivery person performance fetched successfully",
            "data": performance_list
        }

    # 9️⃣ Search
    def search_deliveries(self, db: Session, filters: dict):
        query = db.query(Delivery)
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(Delivery, key) == value)
        return query.all()


    # 1️⃣1️⃣ Timeline
    def get_timeline(self, delivery: Delivery):
        return [
            {"status": delivery.status, "timestamp": delivery.assigned_at},
            {"status": "DELIVERED", "timestamp": delivery.delivered_at}
        ]

    # 1️⃣2️⃣ Cancel
    def cancel_delivery(self, db: Session, delivery: Delivery):
        delivery.status = "CANCELLED"
        db.commit()
        return delivery

    # 1️⃣4️⃣ Validate completion
    def validate_completion(self, db: Session, delivery: Delivery):
        delivery.status = "DELIVERED"
        delivery.delivered_at = datetime.utcnow()
        db.commit()
        return delivery

    # 1️⃣5️⃣ Issues
    def get_issues(self, db: Session):
        return db.query(UserIssue).filter(UserIssue.delivery_id.isnot(None)).all()
