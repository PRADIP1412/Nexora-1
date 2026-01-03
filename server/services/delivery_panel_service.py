# delivery_panel_service.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from decimal import Decimal

from repositories.delivery_panel_repository import DeliveryPanelRepository
from schemas.delivery_panel_schema import (
    DashboardResponse, DashboardStats, ActiveDeliveryPreview,
    ActiveDeliveriesResponse, DeliveryOrder, StatusUpdateRequest,
    MessageResponse, PendingPickupsResponse, PendingPickupItem,
    QRVerifyRequest, PickupConfirmationRequest,
    CompletedDeliveriesResponse, CompletedDeliveryItem, DateFilterRequest,
    EarningsResponse, EarningsOverview, EarningsPeriod,
    RouteMapResponse, RouteStop,
    PerformanceResponse, PerformanceMetrics, RatingHistoryItem,
    ScheduleResponse, ShiftItem, ShiftCreateRequest, ShiftUpdateRequest,
    VehicleResponse, VehicleInfo, VehicleDocument, VehicleUpdateRequest,
    SupportTicketResponse, SupportTicketRequest,
    DeliveryProfile, ProfileUpdateRequest, StatusToggleRequest,
    PaginationParams, FilterParams
)


class DeliveryPanelService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DeliveryPanelRepository()
    
    # ===== DASHBOARD =====
    
    def get_dashboard(self, delivery_person_id: int) -> DashboardResponse:
        """Get dashboard data"""
        # Get stats
        stats_data = self.repository.get_dashboard_stats(self.db, delivery_person_id)
        stats = DashboardStats(**stats_data)
        
        # Get active deliveries preview
        active_previews = self.repository.get_active_deliveries_preview(self.db, delivery_person_id)
        previews = [ActiveDeliveryPreview(**preview) for preview in active_previews]
        
        # Quick actions
        quick_actions = ["scan-qr", "upload-pod", "report-issue", "navigate"]
        
        return DashboardResponse(
            stats=stats,
            active_deliveries=previews,
            quick_actions=quick_actions
        )
    
    # ===== ACTIVE DELIVERIES =====
    
    def get_active_deliveries(
        self, 
        delivery_person_id: int,
        filters: Optional[FilterParams] = None
    ) -> ActiveDeliveriesResponse:
        """Get active deliveries"""
        filter_dict = filters.dict(exclude_none=True) if filters else {}
        deliveries_data = self.repository.get_active_deliveries(self.db, delivery_person_id, filter_dict)
        
        # Convert to schema objects
        deliveries = [DeliveryOrder(**delivery) for delivery in deliveries_data]
        
        # Calculate counts
        pending_pickup = len([d for d in deliveries if d.status == "ASSIGNED"])
        in_transit = len([d for d in deliveries if d.status == "IN_TRANSIT"])
        picked_up = len([d for d in deliveries if d.status == "PICKED_UP"])
        
        return ActiveDeliveriesResponse(
            deliveries=deliveries,
            total_count=len(deliveries),
            pending_pickup=pending_pickup,
            in_transit=in_transit,
            picked_up=picked_up
        )
    
    def update_delivery_status(
        self,
        delivery_person_id: int,
        delivery_id: int,
        request: StatusUpdateRequest
    ) -> MessageResponse:
        """Update delivery status"""
        success = self.repository.update_delivery_status(
            self.db, delivery_id, request.status.value, delivery_person_id, request.notes
        )
        
        if success:
            return MessageResponse(
                success=True,
                message=f"Delivery status updated to {request.status.value}"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to update delivery status"
            )
    
    def update_live_location(
        self,
        delivery_person_id: int,
        latitude: float,
        longitude: float
    ) -> MessageResponse:
        """Update live location"""
        success = self.repository.update_delivery_person_location(
            self.db, delivery_person_id, latitude, longitude
        )
        
        if success:
            return MessageResponse(
                success=True,
                message="Location updated successfully"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to update location"
            )
    
    # ===== PENDING PICKUPS =====
    
    def get_pending_pickups(self, delivery_person_id: int) -> PendingPickupsResponse:
        """Get pending pickups"""
        pickups_data = self.repository.get_pending_pickups(self.db, delivery_person_id)
        pickups = [PendingPickupItem(**pickup) for pickup in pickups_data]
        
        # Extract unique locations
        locations = list(set([pickup.pickup_location for pickup in pickups]))
        
        return PendingPickupsResponse(
            pickups=pickups,
            total_count=len(pickups),
            locations=locations
        )
    
    def verify_qr_code(
        self,
        delivery_person_id: int,
        request: QRVerifyRequest
    ) -> MessageResponse:
        """Verify QR code"""
        result = self.repository.verify_pickup_qr(self.db, request.qr_data, delivery_person_id)
        
        if result["valid"]:
            return MessageResponse(
                success=True,
                message=result["message"],
                data=result
            )
        else:
            return MessageResponse(
                success=False,
                message=result["message"]
            )
    
    def confirm_pickup(
        self,
        delivery_person_id: int,
        request: PickupConfirmationRequest
    ) -> MessageResponse:
        """Confirm pickup"""
        success = self.repository.confirm_pickup(
            self.db, request.delivery_id, delivery_person_id, request.confirmation_code, request.notes
        )
        
        if success:
            return MessageResponse(
                success=True,
                message="Pickup confirmed successfully"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to confirm pickup"
            )
    
    # ===== COMPLETED DELIVERIES =====
    
    def get_completed_deliveries(
        self,
        delivery_person_id: int,
        filters: Optional[DateFilterRequest] = None,
        pagination: Optional[PaginationParams] = None
    ) -> CompletedDeliveriesResponse:
        """Get completed deliveries"""
        filter_dict = {}
        if filters:
            if filters.period == "7days":
                filter_dict["date_from"] = date.today() - timedelta(days=7)
            elif filters.period == "30days":
                filter_dict["date_from"] = date.today() - timedelta(days=30)
            elif filters.period == "month":
                today = date.today()
                filter_dict["date_from"] = today.replace(day=1)
                filter_dict["date_to"] = today
            else:  # custom
                if filters.start_date:
                    filter_dict["date_from"] = filters.start_date
                if filters.end_date:
                    filter_dict["date_to"] = filters.end_date
        
        # Apply pagination (mock implementation since repository doesn't support pagination yet)
        deliveries_data = self.repository.get_completed_deliveries(self.db, delivery_person_id, filter_dict)
        
        if pagination:
            start_idx = (pagination.page - 1) * pagination.page_size
            end_idx = start_idx + pagination.page_size
            deliveries_data = deliveries_data[start_idx:end_idx]
        
        deliveries = [CompletedDeliveryItem(**delivery) for delivery in deliveries_data]
        
        # Get summary
        summary = self.repository.get_completed_deliveries_summary(self.db, delivery_person_id, filter_dict)
        
        return CompletedDeliveriesResponse(
            deliveries=deliveries,
            total_count=len(deliveries_data),  # Total before pagination
            summary=summary
        )
    
    def get_pod_details(
        self,
        delivery_person_id: int,
        delivery_id: int
    ) -> MessageResponse:
        """Get Proof of Delivery details"""
        pod_data = self.repository.get_pod_details(self.db, delivery_id, delivery_person_id)
        
        if pod_data:
            return MessageResponse(
                success=True,
                message="POD details retrieved",
                data=pod_data
            )
        else:
            return MessageResponse(
                success=False,
                message="POD details not found"
            )
    
    # ===== EARNINGS =====
    
    def get_earnings_overview(self, delivery_person_id: int) -> EarningsResponse:
        """Get earnings overview"""
        # Get earnings data
        earnings_data = self.repository.get_earnings_overview(self.db, delivery_person_id)
        
        # Create period objects
        today_period = EarningsPeriod(**earnings_data["today"])
        week_period = EarningsPeriod(**earnings_data["this_week"])
        month_period = EarningsPeriod(**earnings_data["this_month"])
        
        overview = EarningsOverview(
            today=today_period,
            this_week=week_period,
            this_month=month_period,
            total=earnings_data["total"],
            pending_settlement=earnings_data["pending_settlement"],
            settled_amount=earnings_data["settled_amount"]
        )
        
        # Get breakdown
        breakdown = self.repository.get_earnings_breakdown(self.db, delivery_person_id)
        
        # Get transaction history
        transactions_data = self.repository.get_transaction_history(self.db, delivery_person_id)
        transactions = [TransactionItem(**txn) for txn in transactions_data]
        
        return EarningsResponse(
            overview=overview,
            breakdown=breakdown,
            transactions=transactions
        )
    
    def get_bank_details(self, user_id: int) -> MessageResponse:
        """Get bank details"""
        bank_data = self.repository.get_bank_details(self.db, user_id)
        
        if bank_data:
            return MessageResponse(
                success=True,
                message="Bank details retrieved",
                data=bank_data
            )
        else:
            return MessageResponse(
                success=False,
                message="Bank details not found"
            )
    
    # ===== ROUTE MAP =====
    
    def get_route_map(self, delivery_person_id: int) -> MessageResponse:
        """Get route map data"""
        route_data = self.repository.get_route_data(self.db, delivery_person_id)
        
        if route_data["total_stops"] > 0:
            # Convert stops to schema objects
            stops = [RouteStop(**stop) for stop in route_data["stops"]]
            
            route_response = RouteMapResponse(
                route_id=route_data["route_id"],
                total_distance_km=route_data["total_distance_km"],
                estimated_duration_minutes=route_data["estimated_duration_minutes"],
                total_stops=route_data["total_stops"],
                current_stop=route_data["current_stop"],
                stops=stops,
                optimized_path=route_data["optimized_path"],
                map_url=route_data["map_url"]
            )
            
            return MessageResponse(
                success=True,
                message="Route map retrieved",
                data=route_response.dict()
            )
        else:
            return MessageResponse(
                success=True,
                message="No deliveries scheduled for today",
                data=route_data
            )
    
    # ===== PERFORMANCE =====
    
    def get_performance_metrics(
        self,
        delivery_person_id: int,
        period: str = "month"
    ) -> PerformanceResponse:
        """Get performance metrics"""
        # Get metrics data
        metrics_data = self.repository.get_performance_metrics(self.db, delivery_person_id, period)
        metrics = PerformanceMetrics(**metrics_data)
        
        # Get rating history
        rating_history_data = self.repository.get_rating_history(self.db, delivery_person_id)
        rating_history = [RatingHistoryItem(**rating) for rating in rating_history_data]
        
        # Mock badges (in production, calculate based on achievements)
        badges = [
            {
                "name": "Speed Star",
                "description": "Completed 50 deliveries in record time",
                "icon": "zap",
                "color": "gold"
            },
            {
                "name": "5-Star Champion",
                "description": "Maintained 5.0 rating for 30 days",
                "icon": "star",
                "color": "silver"
            },
            {
                "name": "Consistent Performer",
                "description": "On-time delivery rate >95% for month",
                "icon": "trending-up",
                "color": "bronze"
            }
        ]
        
        # Mock trends (in production, calculate from historical data)
        trends = {
            "on_time_trend": +5.2,
            "rating_trend": +0.2,
            "speed_trend": +12.0,
            "cancellation_trend": -0.5
        }
        
        return PerformanceResponse(
            metrics=metrics,
            rating_history=rating_history,
            badges=badges,
            trends=trends
        )
    
    # ===== SCHEDULE =====
    
    def get_schedule(
        self,
        delivery_person_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> ScheduleResponse:
        """Get delivery person schedule"""
        schedule_data = self.repository.get_schedule(self.db, delivery_person_id, start_date, end_date)
        shifts = [ShiftItem(**shift) for shift in schedule_data]
        
        # Mock preferences (in production, store in user_preferences table)
        preferences = {
            "preferred_days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "preferred_timing": "9:00 AM - 6:00 PM",
            "preferred_zones": ["Gandhinagar", "Ahmedabad Central"],
            "max_deliveries_per_day": 20,
            "break_duration_minutes": 30
        }
        
        # Get upcoming shifts (next 7 days)
        today = date.today()
        upcoming_shifts = [shift for shift in shifts if shift.date >= today and shift.date <= today + timedelta(days=7)]
        
        return ScheduleResponse(
            shifts=shifts,
            preferences=preferences,
            upcoming_shifts=upcoming_shifts
        )
    
    def create_shift(
        self,
        delivery_person_id: int,
        request: ShiftCreateRequest
    ) -> MessageResponse:
        """Create a new shift"""
        shift_data = request.dict()
        result = self.repository.create_shift(self.db, delivery_person_id, shift_data)
        
        if result:
            return MessageResponse(
                success=True,
                message="Shift created successfully",
                data={"shift_id": result["shift_id"]}
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to create shift"
            )
    
    def update_shift(
        self,
        delivery_person_id: int,
        shift_id: int,
        request: ShiftUpdateRequest
    ) -> MessageResponse:
        """Update shift details"""
        update_data = request.dict(exclude_none=True)
        success = self.repository.update_shift(self.db, shift_id, delivery_person_id, update_data)
        
        if success:
            return MessageResponse(
                success=True,
                message="Shift updated successfully"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to update shift"
            )
    
    # ===== VEHICLE =====
    
    def get_vehicle_info(self, delivery_person_id: int) -> MessageResponse:
        """Get vehicle information"""
        vehicle_info = self.repository.get_vehicle_info(self.db, delivery_person_id)
        documents_data = self.repository.get_vehicle_documents(self.db, delivery_person_id)
        
        if not vehicle_info:
            return MessageResponse(
                success=False,
                message="Vehicle information not found"
            )
        
        # Convert to schema objects
        info = VehicleInfo(**vehicle_info)
        documents = [VehicleDocument(**doc) for doc in documents_data]
        
        # Mock health metrics (in production, calculate from service history)
        health_metrics = {
            "fuel_efficiency": vehicle_info.get("fuel_efficiency", 45.0),
            "last_service_days": (date.today() - vehicle_info.get("last_service_date", date.today())).days,
            "next_service_km": vehicle_info.get("next_service_due_km", 500.0),
            "insurance_days_left": (vehicle_info.get("insurance_valid_until", date.today()) - date.today()).days
        }
        
        vehicle_response = VehicleResponse(
            info=info,
            documents=documents,
            health_metrics=health_metrics
        )
        
        return MessageResponse(
            success=True,
            message="Vehicle information retrieved",
            data=vehicle_response.dict()
        )
    
    def update_vehicle_info(
        self,
        delivery_person_id: int,
        request: VehicleUpdateRequest
    ) -> MessageResponse:
        """Update vehicle information"""
        update_data = request.dict(exclude_none=True)
        success = self.repository.update_vehicle_info(self.db, delivery_person_id, update_data)
        
        if success:
            return MessageResponse(
                success=True,
                message="Vehicle information updated successfully"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to update vehicle information"
            )
    
    # ===== SUPPORT =====
    
    def create_support_ticket(
        self,
        user_id: int,
        request: SupportTicketRequest
    ) -> MessageResponse:
        """Create a support ticket"""
        issue_data = request.dict()
        result = self.repository.create_support_ticket(self.db, user_id, issue_data)
        
        if result:
            ticket = SupportTicketResponse(**result)
            return MessageResponse(
                success=True,
                message="Support ticket created successfully",
                data=ticket.dict()
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to create support ticket"
            )
    
    # ===== PROFILE =====
    
    def get_profile(self, delivery_person_id: int) -> MessageResponse:
        """Get delivery person profile"""
        profile_data = self.repository.get_delivery_profile(self.db, delivery_person_id)
        
        if profile_data:
            profile = DeliveryProfile(**profile_data)
            return MessageResponse(
                success=True,
                message="Profile retrieved successfully",
                data=profile.dict()
            )
        else:
            return MessageResponse(
                success=False,
                message="Profile not found"
            )
    
    def update_profile(
        self,
        user_id: int,
        request: ProfileUpdateRequest
    ) -> MessageResponse:
        """Update profile"""
        update_data = request.dict(exclude_none=True)
        success = self.repository.update_profile(self.db, user_id, update_data)
        
        if success:
            return MessageResponse(
                success=True,
                message="Profile updated successfully"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to update profile"
            )
    
    def update_online_status(
        self,
        delivery_person_id: int,
        request: StatusToggleRequest
    ) -> MessageResponse:
        """Update online status"""
        success = self.repository.update_online_status(
            self.db,
            delivery_person_id,
            request.online_status,
            request.current_location
        )
        
        if success:
            status_text = "online" if request.online_status else "offline"
            return MessageResponse(
                success=True,
                message=f"Status updated to {status_text}"
            )
        else:
            return MessageResponse(
                success=False,
                message="Failed to update status"
            )