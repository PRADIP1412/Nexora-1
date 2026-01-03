from sqlalchemy.orm import Session
from models.product_catalog.product_variant import ProductVariant
from models.product_catalog.product import Product
from models.product_catalog.product_image import ProductImage
from models.product_catalog.attribute_variant import AttributeVariant
from models.product_catalog.product_attribute import ProductAttribute
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime
import math

class VariantRepository:
    
    @staticmethod
    def get_all_variants_query(db: Session, product_id: Optional[int] = None):
        """Base query for variants"""
        query = db.query(ProductVariant)
        if product_id:
            query = query.filter(ProductVariant.product_id == product_id)
        return query
    
    @staticmethod
    def get_variant_by_id(db: Session, variant_id: int) -> Optional[ProductVariant]:
        """Get variant by ID"""
        return db.query(ProductVariant).filter(ProductVariant.variant_id == variant_id).first()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return db.query(Product).filter(Product.product_id == product_id).first()
    
    @staticmethod
    def get_variant_images(db: Session, variant_id: int) -> List[ProductImage]:
        """Get images for variant"""
        return db.query(ProductImage).filter(ProductImage.variant_id == variant_id).all()
    
    @staticmethod
    def get_variant_attributes(db: Session, variant_id: int) -> List:
        """Get attributes for variant"""
        return db.query(ProductAttribute, AttributeVariant.value).join(
            AttributeVariant,
            ProductAttribute.attribute_id == AttributeVariant.attribute_id
        ).filter(AttributeVariant.variant_id == variant_id).all()
    
    @staticmethod
    def count_product_variants(db: Session, product_id: int) -> int:
        """Count variants for a product"""
        return db.query(ProductVariant).filter(ProductVariant.product_id == product_id).count()
    
    @staticmethod
    def create_variant(db: Session, variant_data: dict) -> ProductVariant:
        """Create new variant"""
        new_variant = ProductVariant(**variant_data)
        db.add(new_variant)
        db.commit()
        db.refresh(new_variant)
        return new_variant
    
    @staticmethod
    def update_variant(db: Session, variant: ProductVariant, update_data: dict) -> ProductVariant:
        """Update variant"""
        for key, value in update_data.items():
            if hasattr(variant, key):
                setattr(variant, key, value)
        
        variant.updated_at = datetime.now()
        db.commit()
        db.refresh(variant)
        return variant
    
    @staticmethod
    def delete_variant(db: Session, variant: ProductVariant) -> None:
        """Delete variant"""
        db.delete(variant)
        db.commit()
    
    @staticmethod
    def update_variant_default_status(db: Session, product_id: int, is_default: bool = False) -> None:
        """Update default status for all variants of a product"""
        db.query(ProductVariant).filter(
            ProductVariant.product_id == product_id
        ).update({"is_default": is_default})
        db.commit()
    
    @staticmethod
    def get_another_variant(db: Session, product_id: int, exclude_variant_id: int) -> Optional[ProductVariant]:
        """Get another variant for the same product"""
        return db.query(ProductVariant).filter(
            ProductVariant.product_id == product_id,
            ProductVariant.variant_id != exclude_variant_id
        ).first()
    @staticmethod
    def get_all_images_by_variant(db: Session, variant_id: int):
        return (
            db.query(ProductImage)
            .filter(ProductImage.variant_id == variant_id)
            .order_by(ProductImage.is_default.desc())
            .all()
        )
    @staticmethod
    def get_all_videos_by_variant(db: Session, variant_id: int):
        return (
            db.query(ProductVideo)
            .filter(ProductVideo.variant_id == variant_id)
            .all()
        )
