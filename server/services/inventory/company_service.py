from __future__ import annotations
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.inventory.company_repository import CompanyRepository
from repositories.address_repository import AddressRepository
from schemas.inventory_schema import CompanyCreate, CompanyUpdate
from typing import List, Dict, Any

class CompanyService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CompanyRepository()
        self.address_repo = AddressRepository()
    
    def create_company(self, company_data: CompanyCreate) -> Dict[str, Any]:
        """Create a new company"""
        # Check if company with same name exists
        existing_company = self.repository.get_company_by_name(self.db, company_data.name)
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this name already exists"
            )
        
        # Check if area exists
        area = self.address_repo.get_area_by_id(self.db, company_data.area_id)
        if not area:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Area not found"
            )
        
        company = self.repository.create_company(self.db, company_data.model_dump())
        return self._serialize_company(company)
    
    def get_company(self, company_id: int) -> Dict[str, Any]:
        """Get company by ID"""
        company = self.repository.get_company_by_id(self.db, company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        return self._serialize_company(company)
    
    def get_all_companies(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all companies"""
        companies = self.repository.get_all_companies(self.db, skip, limit)
        return [self._serialize_company(company) for company in companies]
    
    def update_company(self, company_id: int, company_data: CompanyUpdate) -> Dict[str, Any]:
        """Update company"""
        company = self.repository.get_company_by_id(self.db, company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        # If area_id is being updated, check if new area exists
        if company_data.area_id is not None:
            area = self.address_repo.get_area_by_id(self.db, company_data.area_id)
            if not area:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Area not found"
                )
        
        # Update fields
        update_data = company_data.model_dump(exclude_unset=True)
        updated_company = self.repository.update_company(self.db, company_id, update_data)
        if not updated_company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        return self._serialize_company(updated_company)
    
    def delete_company(self, company_id: int) -> Dict[str, str]:
        """Delete company"""
        success = self.repository.delete_company(self.db, company_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )
        
        return {"message": "Company deleted successfully"}
    
    def _serialize_company(self, company: Company) -> Dict[str, Any]:
        """Serialize company data"""
        return {
            "company_id": company.company_id,
            "name": company.name,
            "gst_number": company.gst_number,
            "address_line": company.address_line,
            "area_id": company.area_id,
            "contact_email": company.contact_email,
            "contact_phone": company.contact_phone,
            "website": company.website,
            "created_at": company.created_at,
            "updated_at": company.updated_at
        }