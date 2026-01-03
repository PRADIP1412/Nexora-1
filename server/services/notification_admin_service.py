from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from repositories.notification_admin_repository import NotificationAdminRepository
from repositories.notification_repository import NotificationRepository
from schemas.notification import NotificationCreate, NotificationOut
from schemas.notification_admin import (
    NotificationSearchQuery,
    NotificationBroadcast,
    NotificationUpdateAdmin,
    DeleteOldNotifications,
    NotificationStatsResponse,
    NotificationTypeStatsResponse,
    NotificationWithUser,
    NotificationListAdmin
)
from models.notification import Notification as NotificationModel
from models.user import User

class NotificationAdminService:
    
    def __init__(self, db: Session):
        self.db = db
        self.admin_repo = NotificationAdminRepository()
        self.repo = NotificationRepository()
    
    def get_all_notifications(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[NotificationSearchQuery] = None
    ) -> NotificationListAdmin:
        """Get all notifications with user details and filtering"""
        notifications, total_count = self.admin_repo.get_all_notifications(
            self.db, skip, limit, filters
        )
        
        # Convert to response format with user details
        notification_list = []
        for notification in notifications:
            # Get user details
            user = self.db.query(User).filter(User.user_id == notification.user_id).first()
            
            notification_with_user = NotificationWithUser(
                notification_id=notification.notification_id,
                user_id=notification.user_id,
                user_email=user.email if user else None,
                user_name=f"{user.first_name} {user.last_name}".strip() if user else None,
                title=notification.title,
                message=notification.message,
                type=notification.type,
                is_read=notification.is_read,
                created_at=notification.created_at,
                read_at=notification.read_at,
                reference_id=notification.reference_id
            )
            notification_list.append(notification_with_user)
        
        return NotificationListAdmin(
            notifications=notification_list,
            total_count=total_count,
            page=skip // limit + 1 if limit > 0 else 1,
            limit=limit,
            filters=filters.model_dump() if filters else {}
        )
    
    def get_notifications_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> NotificationListAdmin:
        """Get all notifications for a specific user"""
        notifications, total_count = self.admin_repo.get_notifications_by_user(
            self.db, user_id, skip, limit
        )
        
        # Get user details
        user = self.db.query(User).filter(User.user_id == user_id).first()
        
        # Convert to response format
        notification_list = []
        for notification in notifications:
            notification_with_user = NotificationWithUser(
                notification_id=notification.notification_id,
                user_id=notification.user_id,
                user_email=user.email if user else None,
                user_name=f"{user.first_name} {user.last_name}".strip() if user else None,
                title=notification.title,
                message=notification.message,
                type=notification.type,
                is_read=notification.is_read,
                created_at=notification.created_at,
                read_at=notification.read_at,
                reference_id=notification.reference_id
            )
            notification_list.append(notification_with_user)
        
        return NotificationListAdmin(
            notifications=notification_list,
            total_count=total_count,
            page=skip // limit + 1 if limit > 0 else 1,
            limit=limit,
            filters={"user_id": user_id}
        )
    
    def get_unread_notifications(
        self,
        skip: int = 0,
        limit: int = 50
    ) -> NotificationListAdmin:
        """Get all unread notifications in the system"""
        notifications, total_count = self.admin_repo.get_unread_notifications(
            self.db, skip, limit
        )
        
        # Convert to response format with user details
        notification_list = []
        for notification in notifications:
            # Get user details
            user = self.db.query(User).filter(User.user_id == notification.user_id).first()
            
            notification_with_user = NotificationWithUser(
                notification_id=notification.notification_id,
                user_id=notification.user_id,
                user_email=user.email if user else None,
                user_name=f"{user.first_name} {user.last_name}".strip() if user else None,
                title=notification.title,
                message=notification.message,
                type=notification.type,
                is_read=notification.is_read,
                created_at=notification.created_at,
                read_at=notification.read_at,
                reference_id=notification.reference_id
            )
            notification_list.append(notification_with_user)
        
        return NotificationListAdmin(
            notifications=notification_list,
            total_count=total_count,
            page=skip // limit + 1 if limit > 0 else 1,
            limit=limit,
            filters={"is_read": False}
        )
    
    def search_notifications(
        self,
        keyword: str,
        skip: int = 0,
        limit: int = 50
    ) -> NotificationListAdmin:
        """Search notifications by title or message"""
        notifications, total_count = self.admin_repo.search_notifications(
            self.db, keyword, skip, limit
        )
        
        # Convert to response format with user details
        notification_list = []
        for notification in notifications:
            # Get user details
            user = self.db.query(User).filter(User.user_id == notification.user_id).first()
            
            notification_with_user = NotificationWithUser(
                notification_id=notification.notification_id,
                user_id=notification.user_id,
                user_email=user.email if user else None,
                user_name=f"{user.first_name} {user.last_name}".strip() if user else None,
                title=notification.title,
                message=notification.message,
                type=notification.type,
                is_read=notification.is_read,
                created_at=notification.created_at,
                read_at=notification.read_at,
                reference_id=notification.reference_id
            )
            notification_list.append(notification_with_user)
        
        return NotificationListAdmin(
            notifications=notification_list,
            total_count=total_count,
            page=skip // limit + 1 if limit > 0 else 1,
            limit=limit,
            filters={"keyword": keyword}
        )
    
    def get_notification_stats(self) -> NotificationStatsResponse:
        """Get notification statistics for admin dashboard"""
        stats = self.admin_repo.get_notification_stats(self.db)
        
        return NotificationStatsResponse(**stats)
    
    def get_notification_count_by_type(self) -> NotificationTypeStatsResponse:
        """Get notification count grouped by type"""
        stats_data = self.admin_repo.get_notification_count_by_type(self.db)
        
        total_count = sum(item['count'] for item in stats_data)
        
        return NotificationTypeStatsResponse(
            stats=stats_data,
            total=total_count
        )
    
    def send_notification_to_user(
        self,
        user_id: int,
        title: str,
        message: str,
        type: str,
        reference_id: Optional[int] = None
    ) -> NotificationOut:
        """Send notification to a single user (admin version)"""
        notification_data = NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            reference_id=reference_id
        )
        
        db_notification = self.repo.create_notification(self.db, notification_data)
        
        # TODO: Integrate with email service
        # self._send_email_notification(db_notification)
        
        return NotificationOut.model_validate(db_notification)
    
    def send_notification_to_multiple_users(
        self,
        user_ids: List[int],
        title: str,
        message: str,
        type: str,
        reference_id: Optional[int] = None
    ) -> List[NotificationOut]:
        """Send notifications to multiple selected users"""
        from schemas.notification import BulkNotificationCreate
        
        bulk_data = BulkNotificationCreate(
            user_ids=user_ids,
            title=title,
            message=message,
            type=type,
            reference_id=reference_id
        )
        
        # Use the existing bulk notification method
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
        
        db_notifications = self.repo.create_bulk_notifications(self.db, notifications_data)
        
        # TODO: Integrate with email service for bulk notifications
        
        return [NotificationOut.model_validate(notification) for notification in db_notifications]
    
    def send_notification_to_all_users(self, broadcast: NotificationBroadcast) -> int:
        """Broadcast notification to all users"""
        count = self.admin_repo.send_notification_to_all_users(
            self.db,
            broadcast.title,
            broadcast.message,
            broadcast.type,
            broadcast.reference_id
        )
        
        # TODO: Integrate with email service for broadcast
        
        return count
    
    def mark_notification_read_by_admin(self, notification_id: int) -> Optional[NotificationOut]:
        """Admin can mark any notification as read"""
        notification = self.admin_repo.mark_notification_read_by_admin(self.db, notification_id)
        
        return NotificationOut.model_validate(notification) if notification else None
    
    def update_notification(
        self,
        notification_id: int,
        update_data: NotificationUpdateAdmin
    ) -> Optional[NotificationOut]:
        """Update notification details"""
        notification = self.admin_repo.update_notification(
            self.db,
            notification_id,
            title=update_data.title,
            message=update_data.message,
            type=update_data.type,
            reference_id=update_data.reference_id
        )
        
        return NotificationOut.model_validate(notification) if notification else None
    
    def delete_notification_by_admin(self, notification_id: int) -> bool:
        """Admin can delete any notification"""
        return self.admin_repo.delete_notification_by_admin(self.db, notification_id)
    
    def delete_old_notifications(self, days: int = 30) -> int:
        """Delete notifications older than specified days"""
        return self.admin_repo.delete_old_notifications(self.db, days)
    
    def _send_email_notification(self, notification: NotificationModel):
        """Internal method to send email notifications"""
        # TODO: Integrate with email service
        pass