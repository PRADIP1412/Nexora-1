from sqlalchemy.orm import Session
from models.product_catalog.product_attribute import ProductAttribute
from models.product_catalog.attribute_variant import AttributeVariant
from typing import List, Dict, Any

class AttributeRepository:
    
    @staticmethod
    def get_all_attributes(db: Session) -> List[ProductAttribute]:
        """Get all attributes"""
        return db.query(ProductAttribute).all()
    
    @staticmethod
    def get_variant_attributes(db: Session, variant_id: int) -> List[Dict[str, Any]]:
        """Get all attributes of a variant"""
        attributes = db.query(ProductAttribute, AttributeVariant.value).join(
            AttributeVariant, 
            ProductAttribute.attribute_id == AttributeVariant.attribute_id
        ).filter(AttributeVariant.variant_id == variant_id).all()
        
        return [
            {
                "attribute_id": attr.attribute_id,
                "attribute_name": attr.attribute_name,
                "value": value
            } for attr, value in attributes
        ]
    
    @staticmethod
    def get_attribute_by_name(db: Session, attribute_name: str) -> ProductAttribute:
        """Get attribute by name"""
        return db.query(ProductAttribute).filter(
            ProductAttribute.attribute_name == attribute_name
        ).first()
    
    @staticmethod
    def create_attribute(db: Session, attribute_data: dict) -> ProductAttribute:
        """Create new attribute"""
        new_attribute = ProductAttribute(**attribute_data)
        db.add(new_attribute)
        db.commit()
        db.refresh(new_attribute)
        return new_attribute
    
    @staticmethod
    def get_attribute_variant(db: Session, variant_id: int, attribute_id: int) -> AttributeVariant:
        """Get attribute variant relationship"""
        return db.query(AttributeVariant).filter(
            AttributeVariant.variant_id == variant_id,
            AttributeVariant.attribute_id == attribute_id
        ).first()
    
    @staticmethod
    def create_attribute_variant(db: Session, variant_id: int, attribute_id: int, value: str) -> AttributeVariant:
        """Create attribute variant relationship"""
        new_attr_variant = AttributeVariant(
            variant_id=variant_id,
            attribute_id=attribute_id,
            value=value
        )
        db.add(new_attr_variant)
        db.commit()
        return new_attr_variant
    
    @staticmethod
    def update_attribute_variant_value(db: Session, attr_variant: AttributeVariant, value: str) -> AttributeVariant:
        """Update attribute variant value"""
        attr_variant.value = value
        db.commit()
        return attr_variant
    
    @staticmethod
    def delete_attribute_variant(db: Session, attr_variant: AttributeVariant) -> None:
        """Delete attribute variant relationship"""
        db.delete(attr_variant)
        db.commit()
    
    # Add these methods to AttributeRepository class

    @staticmethod
    def get_attribute_by_id(db: Session, attribute_id: int) -> ProductAttribute:
        """Get attribute by ID"""
        return db.query(ProductAttribute).filter(
            ProductAttribute.attribute_id == attribute_id
        ).first()
    
    @staticmethod
    def update_attribute(db: Session, attribute: ProductAttribute, attribute_data: dict) -> ProductAttribute:
        """Update attribute"""
        for key, value in attribute_data.items():
            setattr(attribute, key, value)
        db.commit()
        db.refresh(attribute)
        return attribute
    
    @staticmethod
    def delete_attribute(db: Session, attribute: ProductAttribute, attribute_id : int) -> None:
        """Delete attribute and all its variant relationships"""
        try:
            # First delete all attribute-variant relationships
            db.query(AttributeVariant).filter(
                AttributeVariant.attribute_id == attribute_id
            ).delete(synchronize_session=False)
            
            # Then delete the attribute
            db.query(ProductAttribute).filter(
                ProductAttribute.attribute_id == attribute_id
            ).delete(synchronize_session=False)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e