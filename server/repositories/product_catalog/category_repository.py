from sqlalchemy.orm import Session
from models.product_catalog.category import Category
from models.product_catalog.sub_category import SubCategory
from typing import List, Optional, Dict, Any

class CategoryRepository:
    
    @staticmethod
    def get_all_categories(db: Session) -> List[Category]:
        """Get all categories"""
        return db.query(Category).all()
    
    @staticmethod
    def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
        """Get category by ID"""
        return db.query(Category).filter(Category.category_id == category_id).first()
    
    @staticmethod
    def get_category_by_name(db: Session, category_name: str) -> Optional[Category]:
        """Get category by name"""
        return db.query(Category).filter(Category.category_name == category_name).first()
    
    @staticmethod
    def get_subcategories_by_category(db: Session, category_id: int) -> List[SubCategory]:
        """Get all subcategories of a category"""
        return db.query(SubCategory).filter(SubCategory.category_id == category_id).all()
    
    @staticmethod
    def get_subcategory_by_id(db: Session, subcategory_id: int) -> Optional[SubCategory]:
        """Get subcategory by ID"""
        return db.query(SubCategory).filter(SubCategory.sub_category_id == subcategory_id).first()
    
    @staticmethod
    def create_category(db: Session, category_data: dict) -> Category:
        """Create new category"""
        new_category = Category(**category_data)
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category
    
    @staticmethod
    def create_subcategory(db: Session, subcategory_data: dict) -> SubCategory:
        """Create new subcategory"""
        new_subcategory = SubCategory(**subcategory_data)
        db.add(new_subcategory)
        db.commit()
        db.refresh(new_subcategory)
        return new_subcategory
    
    @staticmethod
    def update_category(db: Session, category: Category, update_data: dict) -> Category:
        """Update category"""
        for key, value in update_data.items():
            if hasattr(category, key):
                setattr(category, key, value)
        
        db.commit()
        db.refresh(category)
        return category
    
    @staticmethod
    def update_subcategory(db: Session, subcategory: SubCategory, update_data: dict) -> SubCategory:
        """Update subcategory"""
        for key, value in update_data.items():
            if hasattr(subcategory, key):
                setattr(subcategory, key, value)
        
        db.commit()
        db.refresh(subcategory)
        return subcategory
    
    @staticmethod
    def delete_category(db: Session, category: Category) -> None:
        """Delete category"""
        db.delete(category)
        db.commit()
    
    @staticmethod
    def delete_subcategory(db: Session, subcategory: SubCategory) -> None:
        """Delete subcategory"""
        db.delete(subcategory)
        db.commit()
        
    @staticmethod
    def get_all_subcategories(db: Session) -> List[SubCategory]:  # NEW METHOD
        """Get all subcategories"""
        return db.query(SubCategory).all()
    
    @staticmethod
    def get_subcategory_with_category(db: Session, subcategory_id: int) -> Optional[Dict[str, Any]]:
        """Get subcategory by ID with category details"""
        subcategory = db.query(SubCategory).filter(SubCategory.sub_category_id == subcategory_id).first()
        if not subcategory:
            return None
        
        # Get category details
        category = db.query(Category).filter(Category.category_id == subcategory.category_id).first()
        
        return {
            "subcategory": subcategory,
            "category": category
        }