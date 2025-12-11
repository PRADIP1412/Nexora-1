from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.inventory.supplier_repository import SupplierRepository
from repositories.inventory.company_repository import CompanyRepository
from repositories.address_repository import AddressRepository
from schemas.inventory_schema import SupplierCreate, SupplierUpdate
from typing import List, Dict, Any

class SupplierService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = SupplierRepository()
        self.company_repo = CompanyRepository()
        self.address_repo = AddressRepository()
    
    def create_supplier(self, supplier_data: SupplierCreate) -> Dict[str, Any]:
        """Create a new supplier"""
        # Check if company exists
        company = self.company_repo.get_company_by_id(self.db, supplier_data.company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # Check if area exists
        area = self.address_repo.get_area_by_id(self.db, supplier_data.area_id)
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found"
            )
        
        # Check if supplier with same name exists for this company
        existing_supplier = self.repository.get_supplier_by_name_and_company(
            self.db, supplier_data.name, supplier_data.company_id
        )
        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier with this name already exists for this company"
            )
        
        supplier = self.repository.create_supplier(self.db, supplier_data.model_dump())
        return self._serialize_supplier(supplier)
    
    def get_supplier(self, supplier_id: int) -> Dict[str, Any]:
        """Get supplier by ID"""
        supplier = self.repository.get_supplier_by_id(self.db, supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        return self._serialize_supplier(supplier)
    
    def get_all_suppliers(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all suppliers"""
        suppliers = self.repository.get_all_suppliers(self.db, skip, limit)
        return [self._serialize_supplier(supplier) for supplier in suppliers]
    
    def update_supplier(self, supplier_id: int, supplier_data: SupplierUpdate) -> Dict[str, Any]:
        """Update supplier"""
        supplier = self.repository.get_supplier_by_id(self.db, supplier_id)
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        # If company_id is being updated, check if new company exists
        if supplier_data.company_id is not None:
            company = self.company_repo.get_company_by_id(self.db, supplier_data.company_id)
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Company not found"
                )
        
        # If area_id is being updated, check if new area exists
        if supplier_data.area_id is not None:
            area = self.address_repo.get_area_by_id(self.db, supplier_data.area_id)
            if not area:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Area not found"
                )
        
        # Update fields
        update_data = supplier_data.model_dump(exclude_unset=True)
        updated_supplier = self.repository.update_supplier(self.db, supplier_id, update_data)
        if not updated_supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        return self._serialize_supplier(updated_supplier)
    
    def delete_supplier(self, supplier_id: int) -> Dict[str, str]:
        """Delete supplier"""
        success = self.repository.delete_supplier(self.db, supplier_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
        
        return {"message": "Supplier deleted successfully"}
    
    def _serialize_supplier(self, supplier: Supplier) -> Dict[str, Any]:
        """Serialize supplier data"""
        return {
            "supplier_id": supplier.supplier_id,
            "company_id": supplier.company_id,
            "name": supplier.name,
            "email": supplier.email,
            "phone": supplier.phone,
            "address_line": supplier.address_line,
            "area_id": supplier.area_id,
            "gst_number": supplier.gst_number,
            "is_active": supplier.is_active,
            "total_purchases": supplier.total_purchases,
            "last_purchase_date": supplier.last_purchase_date,
            "created_at": supplier.created_at,
            "updated_at": supplier.updated_at
        }