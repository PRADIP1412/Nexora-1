# delivery_panel_controller.py
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional

from config.dependencies import get_db, get_current_user, is_delivery_person
from services.delivery_panel_service import DeliveryPanelService
from schemas.delivery_panel_schema import (
    DashboardResponse, ActiveDeliveriesResponse, StatusUpdateRequest,
    MessageResponse, PendingPickupsResponse, QRVerifyRequest,
    PickupConfirmationRequest, CompletedDeliveriesResponse, DateFilterRequest,
    EarningsResponse, PerformanceResponse, ScheduleResponse,
    ShiftCreateRequest, ShiftUpdateRequest, VehicleUpdateRequest,
    SupportTicketRequest, ProfileUpdateRequest, StatusToggleRequest,
    PaginationParams, FilterParams
)
from models.user import User
from models.delivery.delivery_person import DeliveryPerson


class DeliveryPanelController:
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.service = DeliveryPanelService(db)
    
    # ===== HELPER METHOD =====
    
    def _get_delivery_person_id(self, current_user: User) -> int:
        """Get delivery person ID from user"""
        delivery_person = self.db.query(DeliveryPerson).filter(
            DeliveryPerson.user_id == current_user.user_id
        ).first()
        
        if not delivery_person:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not a delivery person"
            )
        
        return delivery_person.delivery_person_id
    
    # ===== DASHBOARD =====
    
    def get_dashboard(self, current_user: User) -> DashboardResponse:
        """Get dashboard data"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_dashboard(delivery_person_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get dashboard: {str(e)}"
            )
    
    # ===== ACTIVE DELIVERIES =====
    
    def get_active_deliveries(
        self,
        current_user: User,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        sort_by: Optional[str] = None
    ) -> ActiveDeliveriesResponse:
        """Get active deliveries"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            
            filters = FilterParams(
                status=status,
                priority=priority
            )
            
            return self.service.get_active_deliveries(delivery_person_id, filters)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get active deliveries: {str(e)}"
            )
    
    def update_delivery_status(
        self,
        delivery_id: int,
        request: StatusUpdateRequest,
        current_user: User
    ) -> MessageResponse:
        """Update delivery status"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.update_delivery_status(delivery_person_id, delivery_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update delivery status: {str(e)}"
            )
    
    def update_live_location(
        self,
        latitude: float,
        longitude: float,
        current_user: User
    ) -> MessageResponse:
        """Update live location"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.update_live_location(delivery_person_id, latitude, longitude)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update location: {str(e)}"
            )
    
    # ===== PENDING PICKUPS =====
    
    def get_pending_pickups(self, current_user: User) -> PendingPickupsResponse:
        """Get pending pickups"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_pending_pickups(delivery_person_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get pending pickups: {str(e)}"
            )
    
    def verify_qr_code(
        self,
        request: QRVerifyRequest,
        current_user: User
    ) -> MessageResponse:
        """Verify QR code"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.verify_qr_code(delivery_person_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to verify QR code: {str(e)}"
            )
    
    def confirm_pickup(
        self,
        request: PickupConfirmationRequest,
        current_user: User
    ) -> MessageResponse:
        """Confirm pickup"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.confirm_pickup(delivery_person_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to confirm pickup: {str(e)}"
            )
    
    # ===== COMPLETED DELIVERIES =====
    
    def get_completed_deliveries(
        self,
        current_user: User,
        period: Optional[str] = "7days",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> CompletedDeliveriesResponse:
        """Get completed deliveries"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            
            # Parse dates if provided
            start = None
            end = None
            if start_date:
                start = date.fromisoformat(start_date)
            if end_date:
                end = date.fromisoformat(end_date)
            
            filters = DateFilterRequest(
                period=period,
                start_date=start,
                end_date=end
            )
            
            pagination = PaginationParams(
                page=page,
                page_size=page_size
            )
            
            return self.service.get_completed_deliveries(delivery_person_id, filters, pagination)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get completed deliveries: {str(e)}"
            )
    
    def get_pod_details(
        self,
        delivery_id: int,
        current_user: User
    ) -> MessageResponse:
        """Get Proof of Delivery details"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_pod_details(delivery_person_id, delivery_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get POD details: {str(e)}"
            )
    
    # ===== EARNINGS =====
    
    def get_earnings_overview(self, current_user: User) -> EarningsResponse:
        """Get earnings overview"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_earnings_overview(delivery_person_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get earnings overview: {str(e)}"
            )
    
    def get_bank_details(self, current_user: User) -> MessageResponse:
        """Get bank details"""
        try:
            return self.service.get_bank_details(current_user.user_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get bank details: {str(e)}"
            )
    
    # ===== ROUTE MAP =====
    
    def get_route_map(self, current_user: User) -> MessageResponse:
        """Get route map"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_route_map(delivery_person_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get route map: {str(e)}"
            )
    
    # ===== PERFORMANCE =====
    
    def get_performance_metrics(
        self,
        current_user: User,
        period: str = "month"
    ) -> PerformanceResponse:
        """Get performance metrics"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_performance_metrics(delivery_person_id, period)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get performance metrics: {str(e)}"
            )
    
    # ===== SCHEDULE =====
    
    def get_schedule(
        self,
        current_user: User,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> ScheduleResponse:
        """Get schedule"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            
            # Parse dates if provided
            start = None
            end = None
            if start_date:
                start = date.fromisoformat(start_date)
            if end_date:
                end = date.fromisoformat(end_date)
            
            return self.service.get_schedule(delivery_person_id, start, end)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get schedule: {str(e)}"
            )
    
    def create_shift(
        self,
        request: ShiftCreateRequest,
        current_user: User
    ) -> MessageResponse:
        """Create a new shift"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.create_shift(delivery_person_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create shift: {str(e)}"
            )
    
    def update_shift(
        self,
        shift_id: int,
        request: ShiftUpdateRequest,
        current_user: User
    ) -> MessageResponse:
        """Update shift"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.update_shift(delivery_person_id, shift_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update shift: {str(e)}"
            )
    
    # ===== VEHICLE =====
    
    def get_vehicle_info(self, current_user: User) -> MessageResponse:
        """Get vehicle information"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_vehicle_info(delivery_person_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get vehicle info: {str(e)}"
            )
    
    def update_vehicle_info(
        self,
        request: VehicleUpdateRequest,
        current_user: User
    ) -> MessageResponse:
        """Update vehicle information"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.update_vehicle_info(delivery_person_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update vehicle info: {str(e)}"
            )
    
    # ===== SUPPORT =====
    
    def create_support_ticket(
        self,
        request: SupportTicketRequest,
        current_user: User
    ) -> MessageResponse:
        """Create support ticket"""
        try:
            return self.service.create_support_ticket(current_user.user_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create support ticket: {str(e)}"
            )
    
    # ===== PROFILE =====
    
    def get_profile(self, current_user: User) -> MessageResponse:
        """Get profile"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.get_profile(delivery_person_id)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get profile: {str(e)}"
            )
    
    def update_profile(
        self,
        request: ProfileUpdateRequest,
        current_user: User
    ) -> MessageResponse:
        """Update profile"""
        try:
            return self.service.update_profile(current_user.user_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update profile: {str(e)}"
            )
    
    def update_online_status(
        self,
        request: StatusToggleRequest,
        current_user: User
    ) -> MessageResponse:
        """Update online status"""
        try:
            delivery_person_id = self._get_delivery_person_id(current_user)
            return self.service.update_online_status(delivery_person_id, request)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update status: {str(e)}"
            )
    
    # ===== HEALTH CHECK =====
    
    def health_check(self, current_user: User) -> MessageResponse:
        """Health check for delivery panel"""
        try:
            # Try to get dashboard to verify everything works
            delivery_person_id = self._get_delivery_person_id(current_user)
            self.service.get_dashboard(delivery_person_id)
            
            return MessageResponse(
                success=True,
                message="Delivery panel is working correctly",
                data={
                    "user_id": current_user.user_id,
                    "status": "healthy",
                    "timestamp": datetime.now().isoformat()
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Delivery panel health check failed: {str(e)}"
            )