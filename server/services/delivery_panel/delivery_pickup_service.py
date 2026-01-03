from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from repositories.delivery_panel.delivery_pickup_repository import DeliveryPickupRepository
from schemas.delivery_panel.delivery_pickup_schema import (
    PendingPickup, PendingPickupsResponse, PickupLocationGroup,
    PickupDetailsResponse, QRVerificationRequest, QRVerificationResponse,
    ConfirmPickupRequest, ConfirmPickupResponse, NavigationResponse,
    VendorContactResponse, DeliveryPickupResponse, PickupFilters,
    PickupStatus, VendorType, VendorDetails, PickupLocation, PickupItem
)
from models.delivery.delivery import Delivery
from models.order.order import Order


class DeliveryPickupService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DeliveryPickupRepository()
    
    # ===== PENDING PICKUPS =====
    
    def get_pending_pickups(
        self, 
        delivery_person_id: int,
        filters: Optional[PickupFilters] = None
    ) -> PendingPickupsResponse:
        """Get all pending pickups for delivery person"""
        # Convert filters to dict
        filter_dict = filters.dict(exclude_none=True) if filters else {}
        
        # Get pickups from repository
        pickups_data = self.repository.get_pending_pickups(
            self.db, delivery_person_id, filter_dict
        )
        
        # Convert to PendingPickup objects
        pending_pickups = []
        for pickup_data in pickups_data:
            # Convert vendor info
            vendor_data = pickup_data["vendor"]
            vendor = VendorDetails(**vendor_data)
            
            # Convert pickup location
            location_data = pickup_data["pickup_location"]
            pickup_location = PickupLocation(**location_data)
            
            # Convert items
            items = [
                PickupItem(**item) for item in pickup_data["items"]
            ]
            
            # Create PendingPickup object
            pickup = PendingPickup(
                delivery_id=pickup_data["delivery_id"],
                order_id=pickup_data["order_id"],
                delivery_number=pickup_data["delivery_number"],
                order_number=pickup_data["order_number"],
                vendor=vendor,
                pickup_location=pickup_location,
                items=items,
                total_items=pickup_data["total_items"],
                order_amount=pickup_data["order_amount"],
                payment_type=pickup_data["payment_type"],
                status=pickup_data["status"],
                status_text=pickup_data["status_text"],
                assigned_at=pickup_data["assigned_at"],
                expected_pickup_time=pickup_data["expected_pickup_time"],
                pickup_time_slot=pickup_data["pickup_time_slot"],
                available_actions=pickup_data["available_actions"],
                qr_verified=pickup_data["qr_verified"],
                qr_verified_at=pickup_data["qr_verified_at"],
                priority=pickup_data["priority"],
                notes=pickup_data["notes"]
            )
            pending_pickups.append(pickup)
        
        # Group pickups by location
        location_groups_data = self.repository.group_pickups_by_location(
            self.db, delivery_person_id
        )
        
        location_groups = []
        for group_data in location_groups_data:
            # Get pickups for this location
            location_pickups = [
                p for p in pending_pickups 
                if p.pickup_location.location_id == group_data["location_id"]
            ]
            
            group = PickupLocationGroup(
                location_id=group_data["location_id"],
                location_name=group_data["location_name"],
                location_type=group_data["location_type"],
                address=group_data["address"],
                distance=group_data["distance"],
                estimated_time=group_data["estimated_time"],
                pickup_count=group_data["pickup_count"],
                pickups=location_pickups
            )
            location_groups.append(group)
        
        # Calculate stats - FIXED: Use proper structure
        stats = {
            "total_pending": len(pending_pickups),
            "by_vendor_type": {
                "STORE": len([p for p in pending_pickups if p.vendor.vendor_type == VendorType.STORE]),
                "WAREHOUSE": len([p for p in pending_pickups if p.vendor.vendor_type == VendorType.WAREHOUSE]),
                "SUPPLIER": len([p for p in pending_pickups if p.vendor.vendor_type == VendorType.SUPPLIER]),
            },
            "urgent": len([p for p in pending_pickups if p.priority == "URGENT"]),
            "high": len([p for p in pending_pickups if p.priority == "HIGH"]),
            "normal": len([p for p in pending_pickups if p.priority == "NORMAL"]),
            "with_contact": len([p for p in pending_pickups if p.vendor.phone]),
            "cod_orders": len([p for p in pending_pickups if p.payment_type == "COD"]),
            "prepaid_orders": len([p for p in pending_pickups if p.payment_type == "PREPAID"]),
            "total_items": sum(p.total_items for p in pending_pickups),
            "total_value": sum(p.order_amount or 0 for p in pending_pickups)
        }
        
        return PendingPickupsResponse(
            pending_pickups=pending_pickups,
            grouped_by_location=location_groups,
            stats=stats,
            total_count=len(pending_pickups)
        )
    
    def get_pickup_details(
        self,
        delivery_person_id: int,
        delivery_id: int
    ) -> PickupDetailsResponse:
        """Get detailed information for specific pickup"""
        # First check if delivery exists and belongs to this delivery person
        delivery = self.db.query(Delivery).filter(
            Delivery.delivery_id == delivery_id,
            Delivery.delivery_person_id == delivery_person_id
        ).first()
        
        if not delivery:
            # Return empty response instead of raising exception
            return PickupDetailsResponse(
                pickup=None,
                order_details={},
                vendor_contact=None,
                pickup_instructions="Pickup not found or not assigned to you",
                qr_requirements=["Valid QR code", "Delivery person verification"]
            )
        
        # Get pickup data from repository with allow_all_statuses=True
        pickup_data = self.repository.get_pickup_by_id(
            self.db, delivery_person_id, delivery_id, allow_all_statuses=True
        )
        
        if not pickup_data:
            return PickupDetailsResponse(
                pickup=None,
                order_details={},
                vendor_contact=None,
                pickup_instructions="Unable to retrieve pickup details",
                qr_requirements=["Valid QR code", "Delivery person verification"]
            )
        
        # Convert to PendingPickup object
        vendor_data = pickup_data["vendor"]
        vendor = VendorDetails(**vendor_data)
        
        location_data = pickup_data["pickup_location"]
        pickup_location = PickupLocation(**location_data)
        
        items = [
            PickupItem(**item) for item in pickup_data["items"]
        ]
        
        pickup = PendingPickup(
            delivery_id=pickup_data["delivery_id"],
            order_id=pickup_data["order_id"],
            delivery_number=pickup_data["delivery_number"],
            order_number=pickup_data["order_number"],
            vendor=vendor,
            pickup_location=pickup_location,
            items=items,
            total_items=pickup_data["total_items"],
            order_amount=pickup_data["order_amount"],
            payment_type=pickup_data["payment_type"],
            status=pickup_data["status"],
            status_text=pickup_data["status_text"],
            assigned_at=pickup_data["assigned_at"],
            expected_pickup_time=pickup_data["expected_pickup_time"],
            pickup_time_slot=pickup_data["pickup_time_slot"],
            available_actions=pickup_data["available_actions"],
            qr_verified=pickup_data["qr_verified"],
            qr_verified_at=pickup_data["qr_verified_at"],
            priority=pickup_data["priority"],
            notes=pickup_data["notes"]
        )
        
        # Get QR requirements based on status
        qr_requirements = []
        if pickup_data["status"] == "ASSIGNED":
            qr_requirements = [
                "Valid QR code from vendor",
                "Match with order/delivery ID",
                "Scan within business hours",
                "Physical package verification"
            ]
        
        # Pickup instructions
        pickup_instructions = f"""
        Please proceed to {pickup_location.name} at:
        {pickup_location.address_line1}
        {pickup_location.area_name}, {pickup_location.city_name}
        
        Contact: {vendor.contact_person} - {vendor.phone}
        Hours: {vendor.business_hours}
        
        Status: {pickup_data['status_text']}
        """
        
        return PickupDetailsResponse(
            pickup=pickup,
            order_details=pickup_data.get("order_details", {}),
            vendor_contact={
                "contact_person": vendor.contact_person,
                "phone": vendor.phone,
                "email": vendor.email,
                "best_time_to_call": "During business hours"
            },
            pickup_instructions=pickup_instructions.strip(),
            qr_requirements=qr_requirements
        )
    
    # ===== QR VERIFICATION =====
    
    def verify_qr_code(
        self,
        delivery_person_id: int,
        request: QRVerificationRequest
    ) -> QRVerificationResponse:
        """Verify QR code for pickup"""
        result = self.repository.verify_qr_code(
            self.db,
            delivery_person_id,
            request.delivery_id,
            request.qr_data
        )
        
        if result["valid"]:
            return QRVerificationResponse(
                success=True,
                message=result["message"],
                delivery_id=result["delivery_id"],
                order_id=result["order_id"],
                verified_at=result["verified_at"],
                verification_type=request.verification_type,
                requires_confirmation=result["requires_confirmation"],
                next_action=result["next_action"]
            )
        else:
            return QRVerificationResponse(
                success=False,
                message=result["message"],
                delivery_id=request.delivery_id,
                order_id=0,
                verified_at=datetime.now(),
                verification_type=request.verification_type,
                requires_confirmation=True,
                next_action="retry_scan"
            )
    
    # ===== PICKUP CONFIRMATION =====
    
    def confirm_pickup(
        self,
        delivery_person_id: int,
        request: ConfirmPickupRequest
    ) -> ConfirmPickupResponse:
        """Confirm pickup after QR verification"""
        # First, check if delivery exists and is in correct state
        delivery = self.db.query(Delivery).filter(
            Delivery.delivery_id == request.delivery_id,
            Delivery.delivery_person_id == delivery_person_id,
            Delivery.status == "ASSIGNED"
        ).first()
        
        if not delivery:
            return ConfirmPickupResponse(
                success=False,
                message="Delivery not found or already picked up",
                delivery_id=request.delivery_id,
                order_id=0,
                confirmed_at=datetime.now(),
                new_status=PickupStatus.CANCELLED,
                next_step="contact_support"
            )
        
        # Confirm pickup through repository
        result = self.repository.confirm_pickup(
            self.db,
            delivery_person_id,
            request.delivery_id,
            request.notes,
            request.pod_image_url,
            request.signature_url
        )
        
        if result["success"]:
            return ConfirmPickupResponse(
                success=True,
                message=result["message"],
                delivery_id=result["delivery_id"],
                order_id=result["order_id"],
                confirmed_at=result["confirmed_at"],
                new_status=PickupStatus.PICKED_UP,
                next_step=result["next_step"]
            )
        else:
            return ConfirmPickupResponse(
                success=False,
                message=result["message"],
                delivery_id=request.delivery_id,
                order_id=delivery.order_id,
                confirmed_at=datetime.now(),
                new_status=PickupStatus.PENDING_PICKUP,
                next_step="retry_confirmation"
            )
    
    # ===== NAVIGATION =====
    
    def get_navigation_details(
        self,
        delivery_person_id: int,
        delivery_id: int
    ) -> NavigationResponse:
        """Get navigation details for pickup location"""
        result = self.repository.get_navigation_details(
            self.db, delivery_person_id, delivery_id
        )
        
        if result["success"]:
            return NavigationResponse(**result)
        else:
            return NavigationResponse(
                success=False,
                pickup_location_id=0,
                google_maps_url="",
                openstreetmap_url="",
                latitude=0.0,
                longitude=0.0,
                formatted_address="",
                distance_km=None,
                estimated_time_minutes=None
            )
    
    # ===== VENDOR CONTACT =====
    
    def get_vendor_contact(
        self,
        delivery_person_id: int,
        delivery_id: int
    ) -> VendorContactResponse:
        """Get vendor contact information"""
        result = self.repository.get_vendor_contact(
            self.db, delivery_person_id, delivery_id
        )
        
        if result["success"]:
            return VendorContactResponse(**result)
        else:
            return VendorContactResponse(
                success=False,
                vendor_id=0,
                vendor_name="",
                contact_person=None,
                phone=None,
                email=None,
                business_hours=None,
                emergency_contact=None,
                notes="Contact information not available"
            )
    
    # ===== VALIDATION METHODS =====
    
    def validate_pickup_access(
        self,
        delivery_person_id: int,
        delivery_id: int,
        require_assigned_status: bool = False
    ) -> bool:
        """Validate if delivery person can access this pickup"""
        query = self.db.query(Delivery).filter(
            Delivery.delivery_id == delivery_id,
            Delivery.delivery_person_id == delivery_person_id
        )
        
        # Only filter by ASSIGNED status if required
        if require_assigned_status:
            query = query.filter(Delivery.status == "ASSIGNED")
        
        delivery = query.first()
        
        return delivery is not None
    
    def check_qr_verification_status(
        self,
        delivery_person_id: int,
        delivery_id: int
    ) -> bool:
        """Check if QR has been verified for this pickup"""
        # In a real system, this would check a QR verification table
        # For now, return False (requires fresh verification)
        return False
    
    # ===== BUSINESS LOGIC =====
    
    def get_optimized_pickup_route(
        self,
        delivery_person_id: int
    ) -> List[Dict[str, Any]]:
        """Get optimized route for all pending pickups"""
        # Get all pending pickups
        pickups_data = self.repository.get_pending_pickups(self.db, delivery_person_id)
        
        if not pickups_data:
            return []
        
        # Sort by distance (simple optimization)
        pickups_with_distance = []
        for pickup in pickups_data:
            distance_info = pickup.get("distance_info", {})
            distance_km = distance_info.get("distance_km", 999)
            pickups_with_distance.append((pickup, distance_km))
        
        # Sort by distance
        pickups_with_distance.sort(key=lambda x: x[1])
        
        # Build route with sequence
        route = []
        sequence = 1
        
        for pickup_data, distance in pickups_with_distance:
            location = pickup_data["pickup_location"]
            
            route_point = {
                "sequence": sequence,
                "delivery_id": pickup_data["delivery_id"],
                "order_id": pickup_data["order_id"],
                "location_name": location["name"],
                "address": f"{location['address_line1']}, {location['area_name']}",
                "distance_km": distance,
                "estimated_minutes": pickup_data.get("distance_info", {}).get("estimated_minutes", 15),
                "vendor_name": pickup_data["vendor"]["vendor_name"],
                "items_count": pickup_data["total_items"],
                "priority": pickup_data["priority"]
            }
            
            route.append(route_point)
            sequence += 1
        
        return route