from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.review_repository import ReviewRepository
from repositories.user_repository import UserRepository
from repositories.product_catalog.variant_repository import VariantRepository
from schemas.review_schema import ReviewCreate, ReviewResponse
from datetime import datetime
from typing import Dict, Any

class ReviewService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = ReviewRepository()
        self.user_repo = UserRepository()
        self.variant_repo = VariantRepository()
    
    def get_product_reviews(self, variant_id: int, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        """Get product reviews with pagination - RETURN DICT FOR PAGINATION"""
        pagination_result = self.repository.get_reviews_by_variant_id(self.db, variant_id, page, per_page)
        
        # Convert items to serialized reviews
        serialized_items = [self._serialize_review(review) for review in pagination_result["items"]]
        
        return {
            "items": serialized_items,
            "total": pagination_result["total"],
            "page": pagination_result["page"],
            "per_page": pagination_result["per_page"],
            "total_pages": pagination_result["total_pages"]
        }
    
    def create_review(self, user_id: int, review_data: ReviewCreate) -> Dict[str, Any]:
        """Create a new product review"""
        existing_review = self.repository.get_review_by_user_and_variant(self.db, user_id, review_data.variant_id)
        
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this product"
            )
        
        # Verify variant exists
        variant = self.variant_repo.get_variant_by_id(self.db, review_data.variant_id)
        if not variant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product variant not found"
            )
        
        # Map the data to match the database model
        review_dict = {
            "user_id": user_id,
            "variant_id": review_data.variant_id,
            "rating": review_data.rating,
            "title": review_data.title,
            "body": review_data.body,
            "images": review_data.images,
            "created_at": datetime.now()
        }
        
        new_review = self.repository.create_review(self.db, review_dict)
        return self._serialize_review(new_review)
    
    def update_review(self, user_id: int, review_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing review by the user"""
        review = self.repository.get_review_by_id(self.db, review_id)
        if not review or review.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        updated_review = self.repository.update_review(self.db, review_id, update_data)
        if not updated_review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        return self._serialize_review(updated_review)
    
    def delete_review(self, user_id: int, review_id: int) -> Dict[str, str]:
        """Delete a review by the user"""
        review = self.repository.get_review_by_id(self.db, review_id)
        if not review or review.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        success = self.repository.delete_review(self.db, review_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        return {"message": "Review deleted successfully"}
    
    def _serialize_review(self, review) -> Dict[str, Any]:
        """Serialize review data"""
        user = self.user_repo.get_user_by_id(self.db, review.user_id)
        
        return {
            "review_id": review.review_id,
            "user_id": review.user_id,
            "variant_id": review.variant_id,
            "user_name": f"{user.first_name} {user.last_name}" if user else "Unknown User",
            "rating": review.rating,
            "title": review.title,
            "body": review.body,
            "images": review.images,
            "created_at": review.created_at
        }