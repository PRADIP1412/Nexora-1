from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.dependencies import get_db, get_current_user
from controllers.review_controller import ReviewController
from schemas.review_schema import (
    ReviewCreate, ReviewWrapper, MessageWrapper, ReviewListWrapper  # ADD ReviewListWrapper
)

router = APIRouter(prefix="/api/v1/reviews", tags=["Product Reviews"])

# CHANGE THIS ENDPOINT TO USE ReviewListWrapper INSTEAD OF ListWrapper
@router.get("/{variant_id}", response_model=ReviewListWrapper)
def list_reviews(
    variant_id: int, 
    page: int = Query(1, ge=1), 
    per_page: int = Query(10, ge=1, le=100), 
    db: Session = Depends(get_db)
):
    """Get all reviews for a specific product variant (Paginated)."""
    controller = ReviewController(db)
    reviews_data = controller.get_product_reviews(variant_id, page, per_page)
    return {
        "success": True, 
        "message": "Reviews retrieved successfully", 
        "data": reviews_data
    }

@router.post("/", response_model=ReviewWrapper, status_code=201)
def add_review(
    review_data: ReviewCreate, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """User: Create a new review for a product variant."""
    controller = ReviewController(db)
    review = controller.create_review(current_user.user_id, review_data)
    return {
        "success": True, 
        "message": "Review added successfully", 
        "data": review
    }

@router.put("/{review_id}", response_model=ReviewWrapper)
def edit_review(
    review_id: int, 
    update_data: dict, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):   
    """User: Update an existing review."""
    controller = ReviewController(db)
    review = controller.update_review(current_user.user_id, review_id, update_data)
    return {
        "success": True, 
        "message": "Review updated successfully", 
        "data": review
    }

@router.delete("/{review_id}", response_model=MessageWrapper)
def remove_review(
    review_id: int, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """User: Delete an existing review."""
    controller = ReviewController(db)
    result = controller.delete_review(current_user.user_id, review_id)
    return {
        "success": True, 
        "message": result.get("message"), 
        "data": result
    }