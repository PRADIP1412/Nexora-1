# delivery_panel/active_deliveries/delivery_active_service.py
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from decimal import Decimal

from repositories.delivery_panel.delivery_active_repository import DeliveryActiveRepository
from schemas.delivery_panel.delivery_active_schema import (
    ActiveDeliveriesListResponse, ActiveDelivery, CustomerInfo,
    DeliveryAddress, OrderInfo, DeliveryResponse, StatusUpdateRequest,
    LocationUpdateResponse, CustomerCallResponse, NavigationDataResponse,
    SuccessResponse, DeliveryStatistics, DeliveryStatus, PaymentType,
    StatusTransitionResponse, ProgressUpdateRequest
)

from models.delivery.delivery import Delivery as DeliveryModel
from models.delivery.delivery_person import DeliveryPerson
from models.order.order import Order as OrderModel
from models.user import User as UserModel
from models.address import Address as AddressModel
from models.payment import Payment as PaymentModel


class DeliveryActiveService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DeliveryActiveRepository()
    
    # ===== ACTIVE DELIVERIES LIST =====
    
    def get_active_deliveries(self, delivery_person_id: int) -> ActiveDeliveriesListResponse:
        """Get all active deliveries for delivery person"""
        try:
            # Get deliveries from repository
            deliveries_data = self.repository.get_active_deliveries(self.db, delivery_person_id)
            
            # Get statistics
            stats = self.repository.get_delivery_statistics(self.db, delivery_person_id)
            
            # Convert to schema objects
            active_deliveries = []
            for delivery_data in deliveries_data:
                delivery_schema = self._convert_dict_to_active_delivery(delivery_data)
                if delivery_schema:
                    active_deliveries.append(delivery_schema)
            
            return ActiveDeliveriesListResponse(
                success=True,
                message=f"Found {len(active_deliveries)} active deliveries",
                active_deliveries=active_deliveries,
                count=len(active_deliveries),
                pending_pickup=stats["pending_pickup"],
                in_transit=stats["in_transit"],
                picked_up=stats["picked_up"]
            )
            
        except Exception as e:
            return ActiveDeliveriesListResponse(
                success=False,
                message=f"Failed to get active deliveries: {str(e)}",
                active_deliveries=[],
                count=0,
                pending_pickup=0,
                in_transit=0,
                picked_up=0
            )
    
    def get_delivery_by_id(self, delivery_id: int, delivery_person_id: int) -> DeliveryResponse:
        """Get specific delivery by ID"""
        try:
            delivery_data = self.repository.get_delivery_by_id(self.db, delivery_id, delivery_person_id)
            
            if not delivery_data:
                return DeliveryResponse(
                    success=False,
                    message=f"Delivery {delivery_id} not found or not assigned to you"
                )
            
            delivery_schema = self._convert_dict_to_active_delivery(delivery_data)
            if not delivery_schema:
                return DeliveryResponse(
                    success=False,
                    message="Failed to process delivery data"
                )
            
            return DeliveryResponse(
                success=True,
                message="Delivery retrieved successfully",
                delivery=delivery_schema
            )
            
        except Exception as e:
            return DeliveryResponse(
                success=False,
                message=f"Failed to get delivery: {str(e)}"
            )
    
    def get_delivery_statistics(self, delivery_person_id: int) -> DeliveryStatistics:
        """Get delivery statistics"""
        stats = self.repository.get_delivery_statistics(self.db, delivery_person_id)
        
        return DeliveryStatistics(**stats)
    
    # ===== STATUS UPDATES =====
    
    def update_delivery_status(
        self, 
        delivery_id: int, 
        delivery_person_id: int, 
        request: StatusUpdateRequest
    ) -> DeliveryResponse:
        """Update delivery status"""
        try:
            # Validate status transition
            validation = self.repository.validate_status_transition(
                self.db, delivery_id, delivery_person_id, request.status
            )
            
            if not validation["allowed"]:
                return DeliveryResponse(
                    success=False,
                    message=validation["message"]
                )
            
            # Update status
            success = self.repository.update_delivery_status(
                self.db,
                delivery_id,
                request.status,
                delivery_person_id,
                request.notes,
                request.latitude,
                request.longitude
            )
            
            if not success:
                return DeliveryResponse(
                    success=False,
                    message="Failed to update delivery status"
                )
            
            # Get updated delivery
            delivery_data = self.repository.get_delivery_by_id(self.db, delivery_id, delivery_person_id)
            if not delivery_data:
                return DeliveryResponse(
                    success=False,
                    message="Delivery updated but could not retrieve updated data"
                )
            
            delivery_schema = self._convert_dict_to_active_delivery(delivery_data)
            
            return DeliveryResponse(
                success=True,
                message=f"Delivery status updated to {request.status}",
                delivery=delivery_schema
            )
            
        except Exception as e:
            return DeliveryResponse(
                success=False,
                message=f"Failed to update delivery status: {str(e)}"
            )
    
    def validate_status_transition(
        self,
        delivery_id: int,
        delivery_person_id: int,
        target_status: str
    ) -> StatusTransitionResponse:
        """Validate if status transition is allowed"""
        validation = self.repository.validate_status_transition(
            self.db, delivery_id, delivery_person_id, target_status
        )
        
        return StatusTransitionResponse(**validation)
    
    def update_delivery_progress(
        self,
        delivery_id: int,
        delivery_person_id: int,
        request: ProgressUpdateRequest
    ) -> DeliveryResponse:
        """Update delivery progress with location"""
        try:
            # Determine status based on progress
            status = None
            if request.progress_percentage >= 75:
                status = DeliveryStatus.IN_TRANSIT
            elif request.progress_percentage >= 50:
                status = DeliveryStatus.PICKED_UP
            
            # Update location
            if request.latitude is not None and request.longitude is not None:
                location_success = self.repository.update_delivery_person_location(
                    self.db,
                    delivery_person_id,
                    request.latitude,
                    request.longitude
                )
                
                if not location_success:
                    return DeliveryResponse(
                        success=False,
                        message="Failed to update location"
                    )
            
            # Update status if determined
            if status:
                success = self.repository.update_delivery_status(
                    self.db,
                    delivery_id,
                    status,
                    delivery_person_id,
                    request.notes,
                    request.latitude,
                    request.longitude
                )
                
                if not success:
                    return DeliveryResponse(
                        success=False,
                        message="Failed to update delivery status"
                    )
            
            # Get updated delivery
            delivery_data = self.repository.get_delivery_by_id(self.db, delivery_id, delivery_person_id)
            if not delivery_data:
                return DeliveryResponse(
                    success=False,
                    message="Progress updated but could not retrieve delivery"
                )
            
            delivery_schema = self._convert_dict_to_active_delivery(delivery_data)
            
            return DeliveryResponse(
                success=True,
                message=f"Delivery progress updated to {request.progress_percentage}%",
                delivery=delivery_schema
            )
            
        except Exception as e:
            return DeliveryResponse(
                success=False,
                message=f"Failed to update delivery progress: {str(e)}"
            )
    
    # ===== LOCATION UPDATES =====
    
    def update_delivery_person_location(
        self,
        delivery_person_id: int,
        latitude: float,
        longitude: float,
        accuracy: Optional[float] = None
    ) -> LocationUpdateResponse:
        """Update delivery person's current location"""
        try:
            success = self.repository.update_delivery_person_location(
                self.db,
                delivery_person_id,
                latitude,
                longitude,
                accuracy
            )
            
            if not success:
                return LocationUpdateResponse(
                    success=False,
                    message="Failed to update location",
                    updated_at=datetime.now(),
                    latitude=latitude,
                    longitude=longitude
                )
            
            return LocationUpdateResponse(
                success=True,
                message="Location updated successfully",
                updated_at=datetime.now(),
                latitude=latitude,
                longitude=longitude
            )
            
        except Exception as e:
            return LocationUpdateResponse(
                success=False,
                message=f"Failed to update location: {str(e)}",
                updated_at=datetime.now(),
                latitude=latitude,
                longitude=longitude
            )
    
    # ===== CUSTOMER CALL =====
    
    def get_customer_contact_info(
        self, 
        delivery_id: int, 
        delivery_person_id: int
    ) -> CustomerCallResponse:
        """Get customer contact information for calling"""
        try:
            contact_info = self.repository.get_customer_contact_info(
                self.db, delivery_id, delivery_person_id
            )
            
            if not contact_info:
                return CustomerCallResponse(
                    success=False,
                    message="Customer information not found",
                    customer_name="",
                    customer_phone="",
                    delivery_id=delivery_id,
                    order_id=0,
                    call_timestamp=datetime.now()
                )
            
            # Log the call action
            self.repository.log_call_action(
                self.db,
                delivery_person_id,
                delivery_id,
                contact_info["customer_id"]
            )
            
            return CustomerCallResponse(
                success=True,
                message="Customer contact information retrieved",
                customer_name=contact_info["name"],
                customer_phone=contact_info["phone"],
                delivery_id=delivery_id,
                order_id=contact_info["order_id"],
                call_timestamp=datetime.now()
            )
            
        except Exception as e:
            return CustomerCallResponse(
                success=False,
                message=f"Failed to get customer information: {str(e)}",
                customer_name="",
                customer_phone="",
                delivery_id=delivery_id,
                order_id=0,
                call_timestamp=datetime.now()
            )
    
    # ===== NAVIGATION =====
    
    def get_delivery_navigation_data(
        self, 
        delivery_id: int, 
        delivery_person_id: int
    ) -> NavigationDataResponse:
        """Get navigation data for delivery"""
        try:
            nav_data = self.repository.get_delivery_navigation_data(
                self.db, delivery_id, delivery_person_id
            )
            
            if not nav_data:
                return NavigationDataResponse(
                    success=False,
                    message="Navigation data not found",
                    delivery_address=DeliveryAddress(
                        address_id=0,
                        line1="",
                        area_name="",
                        city_name=""
                    ),
                    customer_name="",
                    customer_phone="",
                    google_maps_url="",
                    openstreetmap_url=""
                )
            
            # Create delivery address
            delivery_address = DeliveryAddress(
                address_id=0,  # Not directly available
                line1=nav_data["formatted_address"].split(",")[0] if nav_data["formatted_address"] else "",
                line2=None,
                area_name="",
                city_name="",
                pincode=None,
                latitude=nav_data.get("latitude"),
                longitude=nav_data.get("longitude")
            )
            
            return NavigationDataResponse(
                success=True,
                message="Navigation data retrieved",
                delivery_address=delivery_address,
                customer_name=nav_data["customer_name"],
                customer_phone=nav_data["customer_phone"],
                google_maps_url=nav_data["google_maps_url"],
                openstreetmap_url=nav_data["openstreetmap_url"],
                distance_km=nav_data.get("distance_km"),
                estimated_time_minutes=self._calculate_estimated_time(nav_data.get("distance_km"))
            )
            
        except Exception as e:
            return NavigationDataResponse(
                success=False,
                message=f"Failed to get navigation data: {str(e)}",
                delivery_address=DeliveryAddress(
                    address_id=0,
                    line1="",
                    area_name="",
                    city_name=""
                ),
                customer_name="",
                customer_phone="",
                google_maps_url="",
                openstreetmap_url=""
            )
    
    # ===== HELPER METHODS =====
    
    def _convert_dict_to_active_delivery(self, delivery_data: Dict[str, Any]) -> Optional[ActiveDelivery]:
        """Convert delivery dictionary to ActiveDelivery schema"""
        try:
            if not delivery_data:
                return None
            
            # Extract data from dictionary
            delivery_id = delivery_data.get("delivery_id")
            order_data = {
                "order_id": delivery_data.get("order_id"),
                "order_number": delivery_data.get("order_number"),
                "subtotal": delivery_data.get("subtotal", 0.0),
                "discount_amount": delivery_data.get("discount_amount", 0.0),
                "delivery_fee": delivery_data.get("delivery_fee", 0.0),
                "total_amount": delivery_data.get("total_amount", 0.0),
                "payment_type": delivery_data.get("payment_type"),
                "cod_amount": delivery_data.get("cod_amount"),
                "items_count": delivery_data.get("items_count", 0)
            }
            
            customer_data = delivery_data.get("customer", {})
            address_data = delivery_data.get("delivery_address", {})
            
            # Customer info
            customer_info = CustomerInfo(
                customer_id=customer_data.get("customer_id", 0),
                name=customer_data.get("name", "Unknown Customer"),
                phone=customer_data.get("phone", ""),
                avatar_url=customer_data.get("avatar_url")
            )
            
            # Delivery address
            delivery_address = DeliveryAddress(
                address_id=address_data.get("address_id", 0),
                line1=address_data.get("line1", ""),
                line2=address_data.get("line2"),
                area_name=address_data.get("area_name", ""),
                city_name=address_data.get("city_name", ""),
                pincode=address_data.get("pincode"),
                latitude=None,
                longitude=None
            )
            
            # Order info
            order_info = OrderInfo(
                order_id=order_data["order_id"],
                order_number=order_data["order_number"],
                subtotal=order_data["subtotal"],
                discount_amount=order_data["discount_amount"],
                delivery_fee=order_data["delivery_fee"],
                total_amount=order_data["total_amount"],
                payment_type=order_data["payment_type"],
                cod_amount=order_data.get("cod_amount"),
                items_count=order_data["items_count"]
            )
            
            # Status
            status = DeliveryStatus(delivery_data.get("status", "ASSIGNED"))
            status_label = delivery_data.get("status_label", delivery_data.get("status", "ASSIGNED"))
            
            return ActiveDelivery(
                delivery_id=delivery_id,
                delivery_person_id=delivery_data.get("delivery_person_id", 0),
                order=order_info,
                customer=customer_info,
                delivery_address=delivery_address,
                status=status,
                status_label=status_label,
                assigned_at=delivery_data.get("assigned_at"),
                # Note: Delivery model doesn't have picked_up_at field
                expected_delivery_time=delivery_data.get("expected_delivery_time"),
                distance_km=delivery_data.get("distance_km"),
                pod_image_url=delivery_data.get("pod_image_url"),
                signature_url=delivery_data.get("signature_url"),
                delivery_notes=delivery_data.get("delivery_notes"),
                current_latitude=delivery_data.get("current_latitude"),
                current_longitude=delivery_data.get("current_longitude")
            )
            
        except Exception as e:
            print(f"Error converting delivery data: {e}")
            return None
    
    def _calculate_estimated_time(self, distance_km: Optional[float]) -> Optional[int]:
        """Calculate estimated time in minutes based on distance"""
        if not distance_km:
            return None
        
        # Average speed: 30 km/h in city traffic
        hours = distance_km / 30
        minutes = int(hours * 60)
        
        # Add buffer for traffic, stops, etc.
        minutes += 10
        
        return minutes
    
    def get_todays_deliveries(self, delivery_person_id: int) -> ActiveDeliveriesListResponse:
        """Get all deliveries assigned today"""
        try:
            deliveries_data = self.repository.get_todays_deliveries(self.db, delivery_person_id)
            
            # Filter only active deliveries
            active_deliveries = []
            for delivery_data in deliveries_data:
                if delivery_data.get("status") in ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"]:
                    delivery_schema = self._convert_dict_to_active_delivery(delivery_data)
                    if delivery_schema:
                        active_deliveries.append(delivery_schema)
            
            # Get statistics for today
            stats = self.repository.get_delivery_statistics(self.db, delivery_person_id)
            
            return ActiveDeliveriesListResponse(
                success=True,
                message=f"Found {len(active_deliveries)} deliveries for today",
                active_deliveries=active_deliveries,
                count=len(active_deliveries),
                pending_pickup=stats["pending_pickup"],
                in_transit=stats["in_transit"],
                picked_up=stats["picked_up"]
            )
            
        except Exception as e:
            return ActiveDeliveriesListResponse(
                success=False,
                message=f"Failed to get today's deliveries: {str(e)}",
                active_deliveries=[],
                count=0,
                pending_pickup=0,
                in_transit=0,
                picked_up=0
            )
    
    def get_deliveries_by_status(
        self,
        delivery_person_id: int,
        status: str
    ) -> ActiveDeliveriesListResponse:
        """Get deliveries by specific status"""
        try:
            deliveries_data = self.repository.get_deliveries_by_status(
                self.db, delivery_person_id, status
            )
            
            active_deliveries = []
            for delivery_data in deliveries_data:
                delivery_schema = self._convert_dict_to_active_delivery(delivery_data)
                if delivery_schema:
                    active_deliveries.append(delivery_schema)
            
            # Get statistics
            stats = self.repository.get_delivery_statistics(self.db, delivery_person_id)
            
            return ActiveDeliveriesListResponse(
                success=True,
                message=f"Found {len(active_deliveries)} deliveries with status {status}",
                active_deliveries=active_deliveries,
                count=len(active_deliveries),
                pending_pickup=stats["pending_pickup"],
                in_transit=stats["in_transit"],
                picked_up=stats["picked_up"]
            )
            
        except Exception as e:
            return ActiveDeliveriesListResponse(
                success=False,
                message=f"Failed to get deliveries by status: {str(e)}",
                active_deliveries=[],
                count=0,
                pending_pickup=0,
                in_transit=0,
                picked_up=0
            )