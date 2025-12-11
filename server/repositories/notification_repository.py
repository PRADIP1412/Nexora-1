from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from models.notification import Notification
from schemas.notification import NotificationCreate, NotificationUpdate

class NotificationRepository:
    
    @staticmethod
    def create_notification(db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification"""
        db_notification = Notification(**notification_data.model_dump())
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return db_notification

    @staticmethod
    def create_bulk_notifications(db: Session, notifications_data: list) -> List[Notification]:
        """Create multiple notifications at once"""
        db_notifications = [Notification(**data) for data in notifications_data]
        db.add_all(db_notifications)
        db.commit()
        for notification in db_notifications:
            db.refresh(notification)
        return db_notifications

    @staticmethod
    def get_user_notifications(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 50,
        is_read: Optional[bool] = None
    ) -> List[Notification]:
        """Get notifications for a user with pagination"""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
            
        return query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_notification_by_id(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        """Get a specific notification for a user"""
        return db.query(Notification).filter(
            Notification.notification_id == notification_id,
            Notification.user_id == user_id
        ).first()

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        """Mark a notification as read"""
        notification = db.query(Notification).filter(
            Notification.notification_id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = func.now()
            db.commit()
            db.refresh(notification)
            
        return notification

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Mark all user notifications as read"""
        result = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            'is_read': True,
            'read_at': func.now()
        })
        db.commit()
        return result

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get count of unread notifications for a user"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()

    @staticmethod
    def get_total_count(db: Session, user_id: int) -> int:
        """Get total notification count for a user"""
        return db.query(Notification).filter(Notification.user_id == user_id).count()

    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Delete a specific notification"""
        notification = db.query(Notification).filter(
            Notification.notification_id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        return False

    @staticmethod
    def delete_all_notifications(db: Session, user_id: int) -> int:
        """Delete all notifications for a user"""
        result = db.query(Notification).filter(Notification.user_id == user_id).delete()
        db.commit()
        return result