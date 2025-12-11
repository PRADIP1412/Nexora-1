from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.inventory.batch_repository import BatchRepository
from repositories.inventory.purchase_repository import PurchaseRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.inventory_schema import ProductBatchCreate
from typing import List, Dict, Any

class BatchService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = BatchRepository()
        self.purchase_repo = PurchaseRepository()
        self.variant_repo = VariantRepository()
    
    def create_batch(self, batch_data: ProductBatchCreate) -> Dict[str, Any]:
        """Create a new product batch"""
        # Check if purchase exists
        purchase = self.purchase_repo.get_purchase_by_id(self.db, batch_data.purchase_id)
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Purchase not found"
            )
        
        # Check if batch number already exists
        existing_batch = self.repository.get_batch_by_number(self.db, batch_data.batch_number)
        if existing_batch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch number already exists"
            )
        
        # Validate all variants exist
        for item in batch_data.items:
            variant = self.variant_repo.get_variant_by_id(self.db, item.variant_id)
            if not variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product variant {item.variant_id} not found"
                )
        
        # Create product batch
        batch_dict = batch_data.model_dump(exclude={'items'})
        batch = self.repository.create_batch(self.db, batch_dict)
        
        # Create batch items
        for item in batch_data.items:
            batch_item_data = {
                "batch_id": batch.batch_id,
                "variant_id": item.variant_id,
                "quantity": item.quantity
            }
            self.repository.create_batch_item(self.db, batch_item_data)
        
        self.db.commit()
        self.db.refresh(batch)
        
        return self._serialize_batch(batch)
    
    def get_batch(self, batch_id: int) -> Dict[str, Any]:
        """Get batch by ID"""
        batch = self.repository.get_batch_by_id(self.db, batch_id)
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found"
            )
        
        return self._serialize_batch_with_items(batch)
    
    def get_all_batches(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all batches"""
        batches = self.repository.get_all_batches(self.db, skip, limit)
        return [self._serialize_batch(batch) for batch in batches]
    
    def update_batch(self, batch_id: int, batch_data) -> Dict[str, Any]:
        """Update batch information"""
        batch = self.repository.get_batch_by_id(self.db, batch_id)
        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found"
            )
        
        # Update fields
        update_data = batch_data.model_dump(exclude_unset=True)
        updated_batch = self.repository.update_batch(self.db, batch_id, update_data)
        if not updated_batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found"
            )
        
        return self._serialize_batch(updated_batch)
    
    def _serialize_batch(self, batch: ProductBatch) -> Dict[str, Any]:
        """Serialize batch data"""
        return {
            "batch_id": batch.batch_id,
            "purchase_id": batch.purchase_id,
            "batch_number": batch.batch_number,
            "manufactured_at": batch.manufactured_at,
            "expires_at": batch.expires_at,
            "created_at": batch.created_at
        }
    
    def _serialize_batch_with_items(self, batch: ProductBatch) -> Dict[str, Any]:
        """Serialize batch with items"""
        items = self.repository.get_batch_items(self.db, batch.batch_id)
        
        batch_data = self._serialize_batch(batch)
        batch_data["items"] = [{
            "variant_id": item.variant_id,
            "quantity": item.quantity
        } for item in items]
        
        return batch_data