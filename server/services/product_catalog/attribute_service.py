from sqlalchemy.orm import Session
from fastapi import HTTPException
from repositories.product_catalog.attribute_repository import AttributeRepository
from schemas.product_catalog_schema import AttributeCreate
from models.product_catalog.product_attribute import ProductAttribute
from models.product_catalog.attribute_variant import AttributeVariant
from typing import List, Dict, Any

class AttributeService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = AttributeRepository()
    
    def get_all_attributes(self) -> List[Dict[str, Any]]:
        """Get all attributes"""
        attributes = self.repository.get_all_attributes(self.db)
        return [{"attribute_id": attr.attribute_id, "attribute_name": attr.attribute_name} for attr in attributes]
    
    def get_variant_attributes(self, variant_id: int) -> List[Dict[str, Any]]:
        """Get all attributes of a variant"""
        return self.repository.get_variant_attributes(self.db, variant_id)
    
    def create_attribute(self, attribute_data: AttributeCreate) -> Dict[str, Any]:
        """Create new attribute"""
        # Check if attribute already exists
        existing = self.repository.get_attribute_by_name(self.db, attribute_data.attribute_name)
        if existing:
            raise HTTPException(status_code=400, detail="Attribute already exists")
        
        new_attribute = self.repository.create_attribute(self.db, attribute_data.model_dump())
        return {"attribute_id": new_attribute.attribute_id, "attribute_name": new_attribute.attribute_name}
    
    def assign_attribute_to_variant(self, variant_id: int, attribute_id: int, value: str) -> Dict[str, str]:
        """Assign attribute to variant"""
        # Check if already assigned
        existing = self.repository.get_attribute_variant(self.db, variant_id, attribute_id)
        if existing:
            raise HTTPException(status_code=400, detail="Attribute already assigned to this variant")
        
        self.repository.create_attribute_variant(self.db, variant_id, attribute_id, value)
        return {"message": "Attribute assigned successfully"}
    
    def update_variant_attribute_value(self, variant_id: int, attribute_id: int, value: str) -> Dict[str, str]:
        """Update attribute value for variant"""
        attr_variant = self.repository.get_attribute_variant(self.db, variant_id, attribute_id)
        if not attr_variant:
            raise HTTPException(status_code=404, detail="Attribute not found for this variant")
        
        self.repository.update_attribute_variant_value(self.db, attr_variant, value)
        return {"message": "Attribute value updated successfully"}
    
    def remove_attribute_from_variant(self, variant_id: int, attribute_id: int) -> Dict[str, str]:
        """Remove attribute from variant"""
        attr_variant = self.repository.get_attribute_variant(self.db, variant_id, attribute_id)
        if not attr_variant:
            raise HTTPException(status_code=404, detail="Attribute not found for this variant")
        
        self.repository.delete_attribute_variant(self.db, attr_variant)
        return {"message": "Attribute removed successfully"}
    # Add these methods to AttributeService class

    def update_attribute(self, attribute_id: int, attribute_data: AttributeCreate) -> Dict[str, Any]:
        """Update existing attribute"""
        # Check if attribute exists
        attribute = self.repository.get_attribute_by_id(self.db, attribute_id)
        if not attribute:
            raise HTTPException(status_code=404, detail="Attribute not found")
        
        # Check if new name already exists (excluding current attribute)
        if attribute_data.attribute_name != attribute.attribute_name:
            existing = self.repository.get_attribute_by_name(self.db, attribute_data.attribute_name)
            if existing:
                raise HTTPException(status_code=400, detail="Attribute name already exists")
        
        updated_attribute = self.repository.update_attribute(
            self.db, attribute, attribute_data.model_dump()
        )
        return {"attribute_id": updated_attribute.attribute_id, "attribute_name": updated_attribute.attribute_name}
    
    def delete_attribute(self, attribute_id: int) -> Dict[str, str]:
        """Delete attribute"""
        # Check if attribute exists
        attribute = self.repository.get_attribute_by_id(self.db, attribute_id)
        if not attribute:
            raise HTTPException(status_code=404, detail="Attribute not found")
        
        # Check if attribute is being used by any variants
        attribute_variants = self.db.query(AttributeVariant).filter(
            AttributeVariant.attribute_id == attribute_id
        ).count()
        
        if attribute_variants > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete attribute. It is being used by {attribute_variants} variants. "
                       f"Please remove all assignments first."
            )
        
        self.repository.delete_attribute(self.db, attribute, attribute_id)
        return {"message": "Attribute deleted successfully"}