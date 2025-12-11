from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from config.dependencies import get_current_user, is_admin
from controllers.notification_controller import NotificationController
from schemas.notification import (
    NotificationCreate, 
    NotificationOut, 
    BulkNotificationCreate,
    NotificationList,
    UnreadCountResponse
)
from models.user import User

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

# ✅ GET /api/v1/notifications/ - Get all notifications for current user
@router.get("/", response_model=NotificationList)
def get_user_notifications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends()
):
    """
    Get all notifications for the authenticated user with pagination.
    Optionally filter by read status.
    """
    return controller.get_user_notifications(current_user, skip, limit, is_read)

# ✅ GET /api/v1/notifications/unread-count - Get unread count
@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends()
):
    """Get the count of unread notifications for the current user"""
    return controller.get_unread_count(current_user)

# ✅ POST /api/v1/notifications/ - Create notification (Admin only)
@router.post("/", response_model=NotificationOut, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(is_admin),
    controller: NotificationController = Depends()
):
    """Create and send a notification to a specific user (Admin only)"""
    return controller.create_notification(notification_data, current_user)

# ✅ POST /api/v1/notifications/bulk - Send bulk notifications (Admin only)
@router.post("/bulk", response_model=list[NotificationOut], status_code=status.HTTP_201_CREATED)
def create_bulk_notifications(
    bulk_data: BulkNotificationCreate,
    current_user: User = Depends(is_admin),
    controller: NotificationController = Depends()
):
    """Send notifications to multiple users (Admin only)"""
    return controller.create_bulk_notifications(bulk_data, current_user)

# ✅ PUT /api/v1/notifications/{notification_id}/read - Mark as read
@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends()
):
    """Mark a specific notification as read"""
    return controller.mark_notification_read(notification_id, current_user)

# ✅ PUT /api/v1/notifications/mark-all-read - Mark all as read
@router.put("/mark-all-read")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends()
):
    """Mark all notifications for the current user as read"""
    return controller.mark_all_notifications_read(current_user)

# ✅ DELETE /api/v1/notifications/{notification_id} - Delete notification
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends()
):
    """Delete a specific notification"""
    return controller.delete_notification(notification_id, current_user)

# ✅ DELETE /api/v1/notifications/ - Delete all notifications
@router.delete("/")
def delete_all_notifications(
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends()
):
    """Delete all notifications for the current user"""
    return controller.delete_all_notifications(current_user)