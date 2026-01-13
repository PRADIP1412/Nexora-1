from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.inventory.purchase_repository import PurchaseRepository
from repositories.inventory.supplier_repository import SupplierRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.inventory_schema import PurchaseCreate, PurchaseStatus
from decimal import Decimal
from typing import List, Dict, Any

class PurchaseService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PurchaseRepository()
        self.supplier_repo = SupplierRepository()
        self.variant_repo = VariantRepository()
    
    def create_purchase(self, purchase_data: PurchaseCreate) -> Dict[str, Any]:
        """Create a new purchase"""
        # Check if supplier exists
        supplier = self.supplier_repo.get_supplier_by_id(self.db, purchase_data.supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        # Validate all variants exist
        for item in purchase_data.items:
            variant = self.variant_repo.get_variant_by_id(self.db, item.variant_id)
            if not variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product variant {item.variant_id} not found"
                )
        
        # Create purchase (remove company_id from the data)
        purchase_dict = purchase_data.model_dump(exclude={'items', 'company_id'})
        purchase = self.repository.create_purchase(self.db, purchase_dict)
        
        # Create purchase items
        total_cost = Decimal('0')
        for item in purchase_data.items:
            purchase_item_data = {
                "purchase_id": purchase.purchase_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "cost_per_unit": item.cost_per_unit,
                "total_cost": item.total_cost
            }
            total_cost += item.total_cost
            self.repository.create_purchase_item(self.db, purchase_item_data)
        
        # Update purchase total cost
        purchase.total_cost = total_cost
        
        self.db.commit()
        self.db.refresh(purchase)
        
        return self._serialize_purchase(purchase)
    
    def get_purchase(self, purchase_id: int) -> Dict[str, Any]:
        """Get purchase by ID"""
        purchase = self.repository.get_purchase_by_id(self.db, purchase_id)
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )
        
        return self._serialize_purchase_with_items(purchase)
    
    def get_all_purchases(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all purchases"""
        purchases = self.repository.get_all_purchases(self.db, skip, limit)
        return [self._serialize_purchase(purchase) for purchase in purchases]
    
    def update_purchase_status(self, purchase_id: int, status: str) -> Dict[str, str]:
        """Update purchase status"""
        # Validate status
        valid_statuses = [s.value for s in PurchaseStatus]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        purchase = self.repository.update_purchase_status(self.db, purchase_id, status)
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )
        
        return {"message": f"Purchase status updated to {status}"}
    
    def _serialize_purchase(self, purchase: Purchase) -> Dict[str, Any]:
        """Serialize purchase data"""
        return {
            "purchase_id": purchase.purchase_id,
            "supplier_id": purchase.supplier_id,
            "invoice_number": purchase.invoice_number,
            "total_cost": purchase.total_cost,
            "status": purchase.status,
            "notes": purchase.notes,
            "purchase_date": purchase.purchase_date,
            "created_at": purchase.created_at,
            "updated_at": purchase.updated_at
        }
    
    def _serialize_purchase_with_items(self, purchase: Purchase) -> Dict[str, Any]:
        """Serialize purchase with items"""
        items = self.repository.get_purchase_items(self.db, purchase.purchase_id)
        
        purchase_data = self._serialize_purchase(purchase)
        purchase_data["items"] = [{
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "cost_per_unit": item.cost_per_unit,
            "total_cost": item.total_cost
        } for item in items]
        
        return purchase_data