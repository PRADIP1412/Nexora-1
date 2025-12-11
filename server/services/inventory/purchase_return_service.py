from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.inventory.purchase_return_repository import PurchaseReturnRepository
from repositories.inventory.purchase_repository import PurchaseRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.inventory_schema import PurchaseReturnCreate, ReturnStatus
from decimal import Decimal
from typing import List, Dict, Any

class PurchaseReturnService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PurchaseReturnRepository()
        self.purchase_repo = PurchaseRepository()
        self.variant_repo = VariantRepository()
    
    def create_purchase_return(self, return_data: PurchaseReturnCreate) -> Dict[str, Any]:
        """Create a new purchase return"""
        # Check if purchase exists
        purchase = self.purchase_repo.get_purchase_by_id(self.db, return_data.purchase_id)
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )
        
        # Validate all variants exist
        for item in return_data.items:
            variant = self.variant_repo.get_variant_by_id(self.db, item.variant_id)
            if not variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product variant {item.variant_id} not found"
                )
        
        # Create purchase return
        return_dict = return_data.model_dump(exclude={'items'})
        purchase_return = self.repository.create_purchase_return(self.db, return_dict)
        
        # Create return items
        total_refund = Decimal('0')
        for item in return_data.items:
            return_item_data = {
                "return_id": purchase_return.return_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "refund_amount": item.refund_amount
            }
            total_refund += item.refund_amount
            self.repository.create_purchase_return_item(self.db, return_item_data)
        
        # Update return total refund
        purchase_return.total_refund = total_refund
        
        self.db.commit()
        self.db.refresh(purchase_return)
        
        return self._serialize_purchase_return(purchase_return)
    
    def get_purchase_return(self, return_id: int) -> Dict[str, Any]:
        """Get purchase return by ID"""
        purchase_return = self.repository.get_purchase_return_by_id(self.db, return_id)
        if not purchase_return:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase return not found"
            )
        
        return self._serialize_purchase_return_with_items(purchase_return)
    
    def get_all_purchase_returns(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all purchase returns"""
        returns = self.repository.get_all_purchase_returns(self.db, skip, limit)
        return [self._serialize_purchase_return(ret) for ret in returns]
    
    def update_purchase_return_status(self, return_id: int, status: str) -> Dict[str, str]:
        """Update purchase return status"""
        # Validate status
        valid_statuses = [s.value for s in ReturnStatus]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        purchase_return = self.repository.update_purchase_return_status(self.db, return_id, status)
        if not purchase_return:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase return not found"
            )
        
        return {"message": f"Purchase return status updated to {status}"}
    
    def _serialize_purchase_return(self, purchase_return: PurchaseReturn) -> Dict[str, Any]:
        """Serialize purchase return data"""
        return {
            "return_id": purchase_return.return_id,
            "purchase_id": purchase_return.purchase_id,
            "reason": purchase_return.reason,
            "return_date": purchase_return.return_date,
            "total_refund": purchase_return.total_refund,
            "status": purchase_return.status,
        }
    
    def _serialize_purchase_return_with_items(self, purchase_return: PurchaseReturn) -> Dict[str, Any]:
        """Serialize purchase return with items"""
        items = self.repository.get_purchase_return_items(self.db, purchase_return.return_id)
        
        return_data = self._serialize_purchase_return(purchase_return)
        return_data["items"] = [{
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "refund_amount": item.refund_amount
        } for item in items]
        
        return return_data