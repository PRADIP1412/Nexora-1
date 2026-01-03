# delivery_panel_route.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional
from datetime import date

from config.dependencies import get_current_user, is_delivery_person
from controllers.delivery_panel_controller import DeliveryPanelController
from schemas.delivery_panel_schema import (
    DashboardResponse, ActiveDeliveriesResponse, StatusUpdateRequest,
    MessageResponse, PendingPickupsResponse, QRVerifyRequest,
    PickupConfirmationRequest, CompletedDeliveriesResponse, DateFilterRequest,
    EarningsResponse, PerformanceResponse, ScheduleResponse,
    ShiftCreateRequest, ShiftUpdateRequest, VehicleUpdateRequest,
    SupportTicketRequest, ProfileUpdateRequest, StatusToggleRequest
)
from models.user import User

router = APIRouter(prefix="/api/v1/delivery/panel", tags=["Delivery Panel"])


# ===== DASHBOARD =====

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get delivery person dashboard with stats and active deliveries
    """
    return controller.get_dashboard(current_user)


# ===== ACTIVE DELIVERIES =====

@router.get("/deliveries/active", response_model=ActiveDeliveriesResponse)
def get_active_deliveries(
    current_user: User = Depends(is_delivery_person),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    sort_by: Optional[str] = Query(None, description="Sort field"),
    controller: DeliveryPanelController = Depends()
):
    """
    Get active deliveries for delivery person
    """
    return controller.get_active_deliveries(current_user, status, priority, sort_by)


@router.put("/deliveries/{delivery_id}/status", response_model=MessageResponse)
def update_delivery_status(
    delivery_id: int,
    request: StatusUpdateRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Update delivery status
    """
    return controller.update_delivery_status(delivery_id, request, current_user)


@router.put("/location", response_model=MessageResponse)
def update_live_location(
    latitude: float = Query(..., description="Latitude"),
    longitude: float = Query(..., description="Longitude"),
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Update delivery person's live location
    """
    return controller.update_live_location(latitude, longitude, current_user)


# ===== PENDING PICKUPS =====

@router.get("/pickups/pending", response_model=PendingPickupsResponse)
def get_pending_pickups(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get pending pickups
    """
    return controller.get_pending_pickups(current_user)


@router.post("/qr/verify", response_model=MessageResponse)
def verify_qr_code(
    request: QRVerifyRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Verify QR code for pickup
    """
    return controller.verify_qr_code(request, current_user)


@router.post("/pickup/confirm", response_model=MessageResponse)
def confirm_pickup(
    request: PickupConfirmationRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Confirm pickup completion
    """
    return controller.confirm_pickup(request, current_user)


# ===== COMPLETED DELIVERIES =====

@router.get("/deliveries/completed", response_model=CompletedDeliveriesResponse)
def get_completed_deliveries(
    current_user: User = Depends(is_delivery_person),
    period: Optional[str] = Query("7days", description="Time period: 7days, 30days, month, custom"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD) for custom period"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD) for custom period"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    controller: DeliveryPanelController = Depends()
):
    """
    Get completed deliveries with filters and pagination
    """
    return controller.get_completed_deliveries(
        current_user, period, start_date, end_date, page, page_size
    )


@router.get("/deliveries/{delivery_id}/pod", response_model=MessageResponse)
def get_pod_details(
    delivery_id: int,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get Proof of Delivery details
    """
    return controller.get_pod_details(delivery_id, current_user)


# ===== EARNINGS =====

@router.get("/earnings", response_model=EarningsResponse)
def get_earnings_overview(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get earnings overview and transaction history
    """
    return controller.get_earnings_overview(current_user)


@router.get("/earnings/bank-details", response_model=MessageResponse)
def get_bank_details(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get bank account details for payouts
    """
    return controller.get_bank_details(current_user)


# ===== ROUTE MAP =====

@router.get("/route", response_model=MessageResponse)
def get_route_map(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get today's route map and navigation details
    """
    return controller.get_route_map(current_user)


# ===== PERFORMANCE =====

@router.get("/performance", response_model=PerformanceResponse)
def get_performance_metrics(
    current_user: User = Depends(is_delivery_person),
    period: str = Query("month", description="Time period: week, month"),
    controller: DeliveryPanelController = Depends()
):
    """
    Get performance metrics and rating history
    """
    return controller.get_performance_metrics(current_user, period)


# ===== SCHEDULE =====

@router.get("/schedule", response_model=ScheduleResponse)
def get_schedule(
    current_user: User = Depends(is_delivery_person),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    controller: DeliveryPanelController = Depends()
):
    """
    Get delivery person schedule
    """
    return controller.get_schedule(current_user, start_date, end_date)


@router.post("/schedule", response_model=MessageResponse)
def create_shift(
    request: ShiftCreateRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Create a new shift
    """
    return controller.create_shift(request, current_user)


@router.put("/schedule/{shift_id}", response_model=MessageResponse)
def update_shift(
    shift_id: int,
    request: ShiftUpdateRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Update shift details
    """
    return controller.update_shift(shift_id, request, current_user)


# ===== VEHICLE =====

@router.get("/vehicle", response_model=MessageResponse)
def get_vehicle_info(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get vehicle information and documents
    """
    return controller.get_vehicle_info(current_user)


@router.put("/vehicle", response_model=MessageResponse)
def update_vehicle_info(
    request: VehicleUpdateRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Update vehicle information
    """
    return controller.update_vehicle_info(request, current_user)


# ===== SUPPORT =====

@router.post("/support", response_model=MessageResponse)
def create_support_ticket(
    request: SupportTicketRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Create a support ticket
    """
    return controller.create_support_ticket(request, current_user)


# ===== PROFILE =====

@router.get("/profile", response_model=MessageResponse)
def get_profile(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get delivery person profile
    """
    return controller.get_profile(current_user)


@router.put("/profile", response_model=MessageResponse)
def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Update profile information
    """
    return controller.update_profile(request, current_user)


@router.put("/status", response_model=MessageResponse)
def update_online_status(
    request: StatusToggleRequest,
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Update online/offline status
    """
    return controller.update_online_status(request, current_user)


# ===== HEALTH CHECK =====

@router.get("/health", response_model=MessageResponse)
def health_check(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Health check for delivery panel
    """
    return controller.health_check(current_user)


# ===== UTILITY ENDPOINTS =====

@router.get("/notifications", response_model=MessageResponse)
def get_notifications(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get notifications for delivery person
    """
    # This is a placeholder - integrate with Notification model in future
    return MessageResponse(
        success=True,
        message="Notifications endpoint - integrate with Notification model",
        data={"notifications": []}
    )


@router.get("/stats/summary", response_model=MessageResponse)
def get_stats_summary(
    current_user: User = Depends(is_delivery_person),
    controller: DeliveryPanelController = Depends()
):
    """
    Get quick stats summary
    """
    try:
        delivery_person_id = controller._get_delivery_person_id(current_user)
        stats = controller.service.repository.get_dashboard_stats(controller.db, delivery_person_id)
        
        return MessageResponse(
            success=True,
            message="Stats summary retrieved",
            data=stats
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats summary: {str(e)}"
        )