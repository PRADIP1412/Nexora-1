from sqlalchemy.orm import Session
from models.product_catalog.product_brand import ProductBrand
from typing import List, Optional

class BrandRepository:
    
    @staticmethod
    def get_all_brands(db: Session) -> List[ProductBrand]:
        """Get all brands"""
        return db.query(ProductBrand).all()
    
    @staticmethod
    def get_brand_by_id(db: Session, brand_id: int) -> Optional[ProductBrand]:
        """Get brand by ID"""
        return db.query(ProductBrand).filter(ProductBrand.brand_id == brand_id).first()
    
    @staticmethod
    def get_brand_by_name(db: Session, brand_name: str) -> Optional[ProductBrand]:
        """Get brand by name"""
        return db.query(ProductBrand).filter(ProductBrand.brand_name == brand_name).first()
    
    @staticmethod
    def create_brand(db: Session, brand_data: dict) -> ProductBrand:
        """Create new brand"""
        new_brand = ProductBrand(**brand_data)
        db.add(new_brand)
        db.commit()
        db.refresh(new_brand)
        return new_brand
    
    @staticmethod
    def update_brand(db: Session, brand: ProductBrand, update_data: dict) -> ProductBrand:
        """Update brand"""
        for key, value in update_data.items():
            if hasattr(brand, key):
                setattr(brand, key, value)
        
        db.commit()
        db.refresh(brand)
        return brand
    
    @staticmethod
    def delete_brand(db: Session, brand: ProductBrand) -> None:
        """Delete brand"""
        db.delete(brand)
        db.commit()