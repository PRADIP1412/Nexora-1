from sqlalchemy.orm import Session
from typing import List, Optional
from repositories.notification_repository import NotificationRepository
from schemas.notification import (
    NotificationCreate, 
    NotificationOut, 
    BulkNotificationCreate,
    NotificationList
)
from models.notification import Notification as NotificationModel

class NotificationService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = NotificationRepository()

    def send_notification(
        self, 
        user_id: int, 
        title: str, 
        message: str, 
        type: str,
        reference_id: Optional[int] = None
    ) -> NotificationOut:
        """Send a single notification to a user"""
        notification_data = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            reference_id=reference_id
        )
        
        db_notification = self.repository.create_notification(self.db, notification_data)
        
        # TODO: Integrate with email service here
        # self._send_email_notification(db_notification)
        
        return NotificationOut.model_validate(db_notification)

    def send_bulk_notifications(self, bulk_data: BulkNotificationCreate) -> List[NotificationOut]:
        """Send notifications to multiple users"""
        notifications_data = []
        for user_id in bulk_data.user_ids:
            notification_dict = {
                'user_id': user_id,
                'title': bulk_data.title,
                'message': bulk_data.message,
                'type': bulk_data.type,
                'reference_id': bulk_data.reference_id
            }
            notifications_data.append(notification_dict)
        
        db_notifications = self.repository.create_bulk_notifications(self.db, notifications_data)
        
        # TODO: Integrate with email service for bulk notifications
        # for notification in db_notifications:
        #     self._send_email_notification(notification)
        
        return [NotificationOut.model_validate(notification) for notification in db_notifications]

    def get_user_notifications(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 50,
        is_read: Optional[bool] = None
    ) -> NotificationList:
        """Get all notifications for a user with pagination"""
        notifications = self.repository.get_user_notifications(self.db, user_id, skip, limit, is_read)
        total_count = self.repository.get_total_count(self.db, user_id)
        unread_count = self.repository.get_unread_count(self.db, user_id)
        
        return NotificationList(
            notifications=[NotificationOut.model_validate(notification) for notification in notifications],
            total_count=total_count,
            unread_count=unread_count
        )

    def mark_notification_read(self, notification_id: int, user_id: int) -> Optional[NotificationOut]:
        """Mark a specific notification as read"""
        notification = self.repository.mark_as_read(self.db, notification_id, user_id)
        return NotificationOut.model_validate(notification) if notification else None

    def mark_all_notifications_read(self, user_id: int) -> int:
        """Mark all user notifications as read"""
        return self.repository.mark_all_as_read(self.db, user_id)

    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for a user"""
        return self.repository.get_unread_count(self.db, user_id)

    def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """Delete a specific notification"""
        return self.repository.delete_notification(self.db, notification_id, user_id)

    def delete_all_notifications(self, user_id: int) -> int:
        """Delete all notifications for a user"""
        return self.repository.delete_all_notifications(self.db, user_id)

    def _send_email_notification(self, notification: NotificationModel):
        """Internal method to send email notifications (to be implemented)"""
        # TODO: Integrate with your email service
        # Example:
        # email_service.send_notification_email(
        #     user_email=notification.user.email,
        #     subject=notification.title,
        #     message=notification.message
        # )
        pass