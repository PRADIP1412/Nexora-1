from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.delivery_person_repository import DeliveryPersonRepository
from repositories.user_repository import UserRepository
from schemas.delivery_schema import DeliveryPersonCreate
from typing import Dict, Any

class DeliveryPersonService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DeliveryPersonRepository()
        self.user_repository = UserRepository()
    
    def register_delivery_person(self, delivery_data: DeliveryPersonCreate) -> Dict[str, Any]:
        """Register a user as a delivery person"""
        # Check if user exists
        user = self.user_repository.get_user_by_id(self.db, delivery_data.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is already a delivery person
        existing_delivery_person = self.repository.get_delivery_person_by_user_id(self.db, delivery_data.user_id)
        if existing_delivery_person:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a delivery person"
            )
        
        # Create delivery person
        delivery_person_data = {
            "user_id": delivery_data.user_id,
            "license_number": delivery_data.license_number,
            "status": "PENDING"
        }
        
        delivery_person = self.repository.create_delivery_person(self.db, delivery_person_data)
        return self._serialize_delivery_person(delivery_person)
    
    def get_all_delivery_persons(self, page: int = 1, per_page: int = 20, status: str = None) -> Dict[str, Any]:
        """Get all delivery persons with filtering"""
        result = self.repository.get_all_delivery_persons(self.db, page, per_page, status)
        
        delivery_persons_data = [
            self._serialize_delivery_person(dp) for dp in result["delivery_persons"]
        ]
        
        return {
            "delivery_persons": delivery_persons_data,
            "total_delivery_persons": result["total_delivery_persons"],
            "total_pages": result["total_pages"]
        }
    
    def get_delivery_person_by_id(self, delivery_person_id: int) -> Dict[str, Any]:
        """Get delivery person by ID"""
        delivery_person = self.repository.get_delivery_person_by_id(self.db, delivery_person_id)
        if not delivery_person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery person not found"
            )
        
        return self._serialize_delivery_person(delivery_person)
    
    def update_delivery_person_status(self, delivery_person_id: int, status: str) -> Dict[str, Any]:
        """Update delivery person status"""
        valid_statuses = ["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED"]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status"
            )
        
        delivery_person = self.repository.update_delivery_person_status(self.db, delivery_person_id, status)
        if not delivery_person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery person not found"
            )
        
        return self._serialize_delivery_person(delivery_person)
    
    def update_delivery_person_rating(self, delivery_person_id: int, rating: float) -> Dict[str, Any]:
        """Update delivery person rating"""
        if rating < 0 or rating > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rating must be between 0 and 5"
            )
        
        delivery_person = self.repository.update_delivery_person_rating(self.db, delivery_person_id, rating)
        if not delivery_person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery person not found"
            )
        
        return self._serialize_delivery_person(delivery_person)
    
    def get_my_delivery_profile(self, user_id: int) -> Dict[str, Any]:
        """Get current user's delivery profile"""
        delivery_person = self.repository.get_delivery_person_by_user_id(self.db, user_id)
        if not delivery_person:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery profile not found"
            )
        
        return self._serialize_delivery_person(delivery_person)
    
    def _serialize_delivery_person(self, delivery_person: DeliveryPerson) -> Dict[str, Any]:
        """Serialize delivery person with user details and stats"""
        user = self.user_repository.get_user_by_id(self.db, delivery_person.user_id)
        stats = self.repository.get_delivery_stats(self.db, delivery_person.delivery_person_id)
        
        return {
            "delivery_person_id": delivery_person.delivery_person_id,
            "user_id": delivery_person.user_id,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown",
            "email": user.email if user else "Unknown",
            "phone": user.phone if user else "Unknown",
            "license_number": delivery_person.license_number,
            "status": delivery_person.status,
            "rating": float(delivery_person.rating),
            "total_deliveries": stats["total_deliveries"],
            "total_earnings": stats["total_earnings"],
            "joined_at": delivery_person.joined_at
        }