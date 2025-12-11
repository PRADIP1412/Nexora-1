from sqlalchemy.orm import Session
from models.product_catalog.product_review import ProductReview
from typing import Dict, Any, Optional
import math

class ReviewRepository:
    
    @staticmethod
    def get_reviews_by_variant_id(db: Session, variant_id: int, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        """Get product reviews with pagination - RETURN DICT FOR PAGINATION"""
        query = db.query(ProductReview).filter(ProductReview.variant_id == variant_id).order_by(ProductReview.created_at.desc())
        
        total = query.count()
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0
        
        if total == 0:
            return {
                "items": [],
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages
            }
        
        offset = (page - 1) * per_page
        reviews = query.offset(offset).limit(per_page).all()
        
        return {
            "items": reviews,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    
    @staticmethod
    def get_review_by_user_and_variant(db: Session, user_id: int, variant_id: int) -> Optional[ProductReview]:
        """Get review by user and variant"""
        return db.query(ProductReview).filter(
            ProductReview.user_id == user_id,
            ProductReview.variant_id == variant_id
        ).first()
    
    @staticmethod
    def create_review(db: Session, review_data: Dict[str, Any]) -> ProductReview:
        """Create a new review"""
        review = ProductReview(**review_data)
        db.add(review)
        db.commit()
        db.refresh(review)
        return review
    
    @staticmethod
    def update_review(db: Session, review_id: int, update_data: Dict[str, Any]) -> Optional[ProductReview]:
        """Update an existing review"""
        review = db.query(ProductReview).filter(ProductReview.review_id == review_id).first()
        
        if review:
            for key, value in update_data.items():
                if hasattr(review, key) and value is not None:
                    setattr(review, key, value)
            db.commit()
            db.refresh(review)
        
        return review
    
    @staticmethod
    def delete_review(db: Session, review_id: int) -> bool:
        """Delete a review"""
        review = db.query(ProductReview).filter(ProductReview.review_id == review_id).first()
        
        if review:
            db.delete(review)
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def get_review_by_id(db: Session, review_id: int) -> Optional[ProductReview]:
        """Get review by ID"""
        return db.query(ProductReview).filter(ProductReview.review_id == review_id).first()