from sqlalchemy.orm import Session
from models.inventory.supplier import Supplier
from models.inventory.company import Company
from typing import List, Dict, Any, Optional

class SupplierRepository:
    
    @staticmethod
    def get_supplier_by_id(db: Session, supplier_id: int) -> Optional[Supplier]:
        """Get supplier by ID"""
        return db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
    
    @staticmethod
    def get_supplier_by_name_and_company(db: Session, name: str, company_id: int) -> Optional[Supplier]:
        """Get supplier by name and company"""
        return db.query(Supplier).filter(
            Supplier.name == name,
            Supplier.company_id == company_id
        ).first()
    
    @staticmethod
    def get_all_suppliers(db: Session, skip: int = 0, limit: int = 100) -> List[Supplier]:
        """Get all suppliers"""
        return db.query(Supplier).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_supplier(db: Session, supplier_data: Dict[str, Any]) -> Supplier:
        """Create a new supplier"""
        supplier = Supplier(**supplier_data)
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return supplier
    
    @staticmethod
    def update_supplier(db: Session, supplier_id: int, update_data: Dict[str, Any]) -> Optional[Supplier]:
        """Update supplier"""
        supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
        
        if supplier:
            for field, value in update_data.items():
                setattr(supplier, field, value)
            db.commit()
            db.refresh(supplier)
        
        return supplier
    
    @staticmethod
    def delete_supplier(db: Session, supplier_id: int) -> bool:
        """Delete supplier"""
        supplier = db.query(Supplier).filter(Supplier.supplier_id == supplier_id).first()
        
        if supplier:
            db.delete(supplier)
            db.commit()
            return True
        
        return False