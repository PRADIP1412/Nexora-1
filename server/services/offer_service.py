from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.offer_repository import OfferRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.marketing_schema import OfferCreate, OfferUpdate
from datetime import datetime
from typing import List, Dict, Any

class OfferService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = OfferRepository()
        self.variant_repo = VariantRepository()
    
    def create_offer(self, offer_data: OfferCreate) -> Dict[str, Any]:
        """Create a new offer"""
        # Validate dates
        if offer_data.start_date >= offer_data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )
        
        # Validate discount values
        if offer_data.discount_type == "PERCENT" and offer_data.discount_value > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Percentage discount cannot exceed 100%"
            )
        
        # Create offer
        offer_dict = offer_data.model_dump(exclude={'variant_ids'})
        offer = self.repository.create_offer(self.db, offer_dict)
        
        # Link variants if provided
        if offer_data.variant_ids:
            # Validate all variants exist
            for variant_id in offer_data.variant_ids:
                variant = self.variant_repo.get_variant_by_id(self.db, variant_id)
                if not variant:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product variant {variant_id} not found"
                    )
                
                offer_variant_data = {
                    "offer_id": offer.offer_id,
                    "variant_id": variant_id
                }
                self.repository.create_offer_variant(self.db, offer_variant_data)
        
        self.db.commit()
        self.db.refresh(offer)
        
        return self._serialize_offer(offer)
    
    def get_offer(self, offer_id: int) -> Dict[str, Any]:
        """Get offer by ID"""
        offer = self.repository.get_offer_by_id(self.db, offer_id)
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found"
            )
        
        return self._serialize_offer(offer)
    
    def get_all_offers(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all offers"""
        offers = self.repository.get_all_offers(self.db, skip, limit)
        return [self._serialize_offer(offer) for offer in offers]
    
    def get_active_offers(self) -> List[Dict[str, Any]]:
        """Get currently active offers"""
        offers = self.repository.get_active_offers(self.db)
        return [self._serialize_offer(offer) for offer in offers]
    
    def update_offer(self, offer_id: int, offer_data: OfferUpdate) -> Dict[str, Any]:
        """Update offer"""
        offer = self.repository.get_offer_by_id(self.db, offer_id)
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found"
            )
        
        # Update fields
        update_data = offer_data.model_dump(exclude_unset=True)
        updated_offer = self.repository.update_offer(self.db, offer_id, update_data)
        if not updated_offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found"
            )
        
        return self._serialize_offer(updated_offer)
    
    def update_offer_status(self, offer_id: int, is_active: bool) -> Dict[str, str]:
        """Update offer status"""
        offer = self.repository.update_offer_status(self.db, offer_id, is_active)
        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found"
            )
        
        status = "activated" if is_active else "deactivated"
        return {"message": f"Offer {status} successfully"}
    
    def delete_offer(self, offer_id: int) -> Dict[str, str]:
        """Delete offer"""
        success = self.repository.delete_offer(self.db, offer_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found"
            )
        
        return {"message": "Offer deleted successfully"}
    
    def _serialize_offer(self, offer: Offer) -> Dict[str, Any]:
        """Serialize offer data"""
        variant_ids = self.repository.get_offer_variants(self.db, offer.offer_id)
        
        return {
            "offer_id": offer.offer_id,
            "title": offer.title,
            "description": offer.description,
            "discount_type": offer.discount_type,
            "discount_value": offer.discount_value,
            "start_date": offer.start_date,
            "end_date": offer.end_date,
            "is_active": offer.is_active,
            "created_at": offer.created_at,
            "variants": variant_ids
        }