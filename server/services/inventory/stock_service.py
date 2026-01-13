from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.inventory.stock_repository import StockRepository
from repositories.product_catalog.variant_repository import VariantRepository
from decimal import Decimal
from typing import List, Dict, Any

class StockService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = StockRepository()
        self.variant_repo = VariantRepository()
    
    def get_stock_movements(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all stock movements"""
        movements = self.repository.get_all_stock_movements(self.db, skip, limit)
        return [self._serialize_stock_movement(movement) for movement in movements]
    
    def get_stock_summary(self) -> List[Dict[str, Any]]:
        """Get current stock summary"""
        stock_summary = self.repository.get_stock_summary(self.db)
        
        result = []
        for summary in stock_summary:
            variant = summary["variant"]
            result.append({
                "variant_id": variant.variant_id,
                "variant_name": variant.variant_name if hasattr(variant, 'variant_name') else f"Variant {variant.variant_id}",
                "current_stock": summary["current_stock"],
                "reserved_stock": 0,  # You might want to calculate this based on orders
                "available_stock": summary["current_stock"],
                "total_value": Decimal('0')  # You might want to calculate this based on average cost
            })
        
        return result
    
    def adjust_stock(self, adjustment_data: dict, user_id: int) -> Dict[str, Any]:
        """Manually adjust stock"""
        variant_id = adjustment_data.get("variant_id")
        quantity = adjustment_data.get("quantity")
        remark = adjustment_data.get("remark", "Manual adjustment")
        
        if not variant_id or quantity is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Variant ID and quantity are required"
            )
        
        # Check if variant exists
        variant = self.variant_repo.get_variant_by_id(self.db, variant_id)
        if not variant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product variant not found"
            )
        
        # Determine movement type
        movement_type = "ADJUSTMENT"
        
        # Create stock movement
        movement_data = {
            "variant_id": variant_id,
            "movement_type": movement_type,
            "reference_type": "MANUAL",
            "reference_id": user_id,
            "quantity": abs(quantity),
            "unit_cost": adjustment_data.get("unit_cost"),
            "remark": remark
        }
        
        movement = self.repository.create_stock_movement(self.db, movement_data)
        
        return {"message": f"Stock adjusted by {quantity} units"}
    
    def get_variant_movements(self, variant_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get stock movements for a specific variant"""
        # Check if variant exists
        variant = self.variant_repo.get_variant_by_id(self.db, variant_id)
        if not variant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product variant not found"
            )
        
        movements = self.repository.get_stock_movements_by_variant(self.db, variant_id, skip, limit)
        return [self._serialize_stock_movement(movement) for movement in movements]
    
    def _serialize_stock_movement(self, movement: StockMovement) -> Dict[str, Any]:
        """Serialize stock movement data"""
        return {
            "movement_id": movement.movement_id,
            "variant_id": movement.variant_id,
            "movement_type": movement.movement_type,
            "reference_type": movement.reference_type,
            "reference_id": movement.reference_id,
            "quantity": movement.quantity,
            "unit_cost": movement.unit_cost,
            "remark": movement.remark,
            "moved_at": movement.moved_at
        }