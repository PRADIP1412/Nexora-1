from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.coupon_repository import CouponRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.marketing_schema import CouponCreate, CouponUpdate
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any

class CouponService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CouponRepository()
        self.variant_repo = VariantRepository()
    
    def create_coupon(self, coupon_data: CouponCreate) -> Dict[str, Any]:
        """Create a new coupon"""
        # Check if coupon code already exists
        existing_coupon = self.repository.get_coupon_by_code(self.db, coupon_data.code)
        if existing_coupon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coupon code already exists"
            )
        
        # Validate dates
        if coupon_data.start_date >= coupon_data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date"
            )
        
        # Validate discount values
        if coupon_data.discount_type == "PERCENT" and coupon_data.discount_value > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Percentage discount cannot exceed 100%"
            )
        
        # Create coupon
        coupon_dict = coupon_data.model_dump(exclude={'variant_ids'})
        coupon = self.repository.create_coupon(self.db, coupon_dict)
        
        # Link variants if provided
        if coupon_data.variant_ids:
            # Validate all variants exist
            for variant_id in coupon_data.variant_ids:
                variant = self.variant_repo.get_variant_by_id(self.db, variant_id)
                if not variant:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product variant {variant_id} not found"
                    )
                
                coupon_variant_data = {
                    "coupon_id": coupon.coupon_id,
                    "variant_id": variant_id
                }
                self.repository.create_coupon_variant(self.db, coupon_variant_data)
        
        self.db.commit()
        self.db.refresh(coupon)
        
        return self._serialize_coupon(coupon)
    
    def get_coupon(self, coupon_id: int) -> Dict[str, Any]:
        """Get coupon by ID"""
        coupon = self.repository.get_coupon_by_id(self.db, coupon_id)
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        
        return self._serialize_coupon(coupon)
    
    def get_all_coupons(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all coupons"""
        coupons = self.repository.get_all_coupons(self.db, skip, limit)
        return [self._serialize_coupon(coupon) for coupon in coupons]
    
    def get_active_coupons(self) -> List[Dict[str, Any]]:
        """Get currently active coupons"""
        coupons = self.repository.get_active_coupons(self.db)
        return [self._serialize_coupon(coupon) for coupon in coupons]
    
    def update_coupon(self, coupon_id: int, coupon_data: CouponUpdate) -> Dict[str, Any]:
        """Update coupon"""
        coupon = self.repository.get_coupon_by_id(self.db, coupon_id)
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        
        # Update fields
        update_data = coupon_data.model_dump(exclude_unset=True)
        updated_coupon = self.repository.update_coupon(self.db, coupon_id, update_data)
        if not updated_coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        
        return self._serialize_coupon(updated_coupon)
    
    def update_coupon_status(self, coupon_id: int, is_active: bool) -> Dict[str, str]:
        """Update coupon status"""
        coupon = self.repository.update_coupon_status(self.db, coupon_id, is_active)
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        
        status = "activated" if is_active else "deactivated"
        return {"message": f"Coupon {status} successfully"}
    
    def delete_coupon(self, coupon_id: int) -> Dict[str, str]:
        """Delete coupon"""
        success = self.repository.delete_coupon(self.db, coupon_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon not found"
            )
        
        return {"message": "Coupon deleted successfully"}
    
    def validate_coupon(self, code: str, variant_ids: List[int], order_total: Decimal) -> Dict[str, Any]:
        """Validate coupon for checkout"""
        coupon = self.repository.get_coupon_by_code(self.db, code)
        if not coupon:
            return {
                "valid": False,
                "discount_amount": Decimal('0'),
                "message": "Invalid coupon code"
            }
        
        now = datetime.now()
        
        # Check if coupon is active
        if not coupon.is_active:
            return {
                "valid": False,
                "discount_amount": Decimal('0'),
                "message": "Coupon is not active"
            }
        
        # Check date validity
        if now < coupon.start_date or now > coupon.end_date:
            return {
                "valid": False,
                "discount_amount": Decimal('0'),
                "message": "Coupon is expired or not yet active"
            }
        
        # Check minimum order amount
        if coupon.min_order_amount and order_total < coupon.min_order_amount:
            return {
                "valid": False,
                "discount_amount": Decimal('0'),
                "message": f"Minimum order amount of {coupon.min_order_amount} required"
            }
        
        # Check if coupon applies to variants
        coupon_variants = self.repository.get_coupon_variants(self.db, coupon.coupon_id)
        if coupon_variants:
            valid_variants = any(variant_id in coupon_variants for variant_id in variant_ids)
            if not valid_variants:
                return {
                    "valid": False,
                    "discount_amount": Decimal('0'),
                    "message": "Coupon not applicable to selected product variants"
                }
        
        # Calculate discount
        if coupon.discount_type == "PERCENT":
            discount_amount = (order_total * coupon.discount_value) / 100
            if coupon.max_discount_amount and discount_amount > coupon.max_discount_amount:
                discount_amount = coupon.max_discount_amount
        else:  # FLAT discount
            discount_amount = coupon.discount_value
        
        # Ensure discount doesn't exceed order total
        if discount_amount > order_total:
            discount_amount = order_total
        
        # Get coupon details for response
        coupon_details = self._serialize_coupon(coupon)
        
        return {
            "valid": True,
            "discount_amount": discount_amount,
            "message": "Coupon applied successfully",
            "coupon": coupon_details
        }
    
    def _serialize_coupon(self, coupon: Coupon) -> Dict[str, Any]:
        """Serialize coupon data"""
        variant_ids = self.repository.get_coupon_variants(self.db, coupon.coupon_id)
        
        return {
            "coupon_id": coupon.coupon_id,
            "code": coupon.code,
            "description": coupon.description,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "min_order_amount": coupon.min_order_amount,
            "max_discount_amount": coupon.max_discount_amount,
            "start_date": coupon.start_date,
            "end_date": coupon.end_date,
            "usage_limit": coupon.usage_limit,
            "is_active": coupon.is_active,
            "created_at": coupon.created_at,
            "variants": variant_ids
        }