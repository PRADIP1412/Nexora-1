from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_
from models.product_catalog.product import Product
from models.product_catalog.product_variant import ProductVariant
from models.product_catalog.product_brand import ProductBrand
from models.product_catalog.sub_category import SubCategory
from models.product_catalog.category import Category
from models.product_catalog.product_image import ProductImage
from typing import List, Dict, Any, Optional
from decimal import Decimal
import math

class ProductRepository:
    
    @staticmethod
    def get_all_products_query(db: Session):
        """Base query for products - FIXED: No join in base query"""
        # Just get all products, we'll handle variants separately
        return db.query(Product)
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        """Get product by ID"""
        return db.query(Product).filter(Product.product_id == product_id).first()
    
    @staticmethod
    def get_product_variants(db: Session, product_id: int) -> List[ProductVariant]:
        """Get all variants of a product"""
        return db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()
    
    @staticmethod
    def get_brand_by_id(db: Session, brand_id: int) -> Optional[ProductBrand]:
        """Get brand by ID"""
        return db.query(ProductBrand).filter(ProductBrand.brand_id == brand_id).first()
    
    @staticmethod
    def get_subcategory_by_id(db: Session, subcategory_id: int) -> Optional[SubCategory]:
        """Get subcategory by ID"""
        return db.query(SubCategory).filter(SubCategory.sub_category_id == subcategory_id).first()
    
    @staticmethod
    def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
        """Get category by ID"""
        return db.query(Category).filter(Category.category_id == category_id).first()
    
    @staticmethod
    def get_variant_images(db: Session, variant_id: int) -> List[ProductImage]:
        """Get images for a variant"""
        return db.query(ProductImage).filter(ProductImage.variant_id == variant_id).all()
    
    @staticmethod
    def get_default_variant(db: Session, product_id: int) -> Optional[ProductVariant]:
        """Get default variant for a product"""
        return db.query(ProductVariant).filter(
            ProductVariant.product_id == product_id,
            ProductVariant.is_default == True
        ).first()
    
    @staticmethod
    def search_products_by_name(db: Session, search_pattern: str, limit: int = 10) -> List[str]:
        """Search products by name for suggestions"""
        return db.query(Product.product_name).filter(
            Product.product_name.ilike(search_pattern)
        ).limit(limit).all()
    
    @staticmethod
    def create_product(db: Session, product_data: dict) -> Product:
        """Create new product"""
        new_product = Product(**product_data)
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product
    
    @staticmethod
    def update_product(db: Session, product: Product, update_data: dict) -> Product:
        """Update product"""
        for key, value in update_data.items():
            if hasattr(product, key):
                setattr(product, key, value)
        
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def delete_product(db: Session, product: Product) -> None:
        """Delete product"""
        db.delete(product)
        db.commit()

    @staticmethod
    def get_discounted_products_query(db: Session):
        """Base query for discounted products - FIXED"""
        # Get products that have discounted default variants
        return db.query(Product).join(ProductVariant).filter(
            ProductVariant.is_default == True,
            or_(
                ProductVariant.discount_type != "NONE",
                ProductVariant.discount_value > 0
            )
        )
    
    @staticmethod
    def get_new_arrivals_query(db: Session, days: int = 7):
        """Query for products added in the last N days - FIXED"""
        from datetime import datetime, timedelta
        threshold_date = datetime.now() - timedelta(days=days)
        
        return db.query(Product).filter(
            Product.created_at >= threshold_date
        )
    
    @staticmethod
    def get_trending_products_query(db: Session, limit: int = 6):
        """Query for trending products - FIXED"""
        # For simplicity, return newest products with discounts
        return db.query(Product).join(ProductVariant).filter(
            ProductVariant.is_default == True,
            or_(
                ProductVariant.discount_type != "NONE",
                ProductVariant.discount_value > 0
            )
        ).order_by(Product.created_at.desc()).limit(limit)
    
    @staticmethod
    def get_products_by_category_name(db: Session, category_name: str):
        """Get products by category name - FIXED"""
        return db.query(Product).join(SubCategory).join(Category).filter(
            Category.category_name.ilike(category_name)
        )
    
    # NEW METHOD: Get products with their default variants
    @staticmethod
    def get_products_with_default_variants(db: Session, product_ids: List[int]) -> Dict[int, ProductVariant]:
        """Get default variants for multiple products"""
        variants = db.query(ProductVariant).filter(
            ProductVariant.product_id.in_(product_ids),
            ProductVariant.is_default == True
        ).all()
        
        return {v.product_id: v for v in variants}