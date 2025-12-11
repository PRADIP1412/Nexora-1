from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.feedback_repository import FeedbackRepository, UserIssueRepository
from repositories.user_repository import UserRepository
from repositories.order_repository import OrderRepository
from schemas.feedback_schema import FeedbackCreate, FeedbackResponseCreate, UserIssueCreate
from models.feedback.feedback import FeedbackStatus
from typing import Dict, Any, List

class FeedbackService:
    
    def __init__(self, db: Session):
        self.db = db
        self.feedback_repo = FeedbackRepository()
        self.issue_repo = UserIssueRepository()
        self.user_repo = UserRepository()
        self.order_repo = OrderRepository()
    
    def create_feedback(self, feedback_data: FeedbackCreate, user_id: int) -> Dict[str, Any]:
        """Create a new feedback"""
        # Validate order exists if provided
        if feedback_data.order_id:
            order = self.order_repo.get_order_by_id(self.db, feedback_data.order_id)
            if not order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Order not found"
                )
        
        # Validate user exists
        user = self.user_repo.get_user_by_id(self.db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create feedback with correct column name feedback_status
        feedback_data_dict = {
            "user_id": user_id,
            "order_id": feedback_data.order_id,
            "feedback_type": feedback_data.feedback_type,
            "subject": feedback_data.subject,
            "message": feedback_data.message,
            "rating": feedback_data.rating,
            "feedback_status": FeedbackStatus.OPEN  # Use feedback_status instead of status
        }
        
        feedback = self.feedback_repo.create_feedback(self.db, feedback_data_dict)
        
        return self._serialize_feedback(feedback)
    
    def get_user_feedbacks(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all feedbacks submitted by current user"""
        feedbacks = self.feedback_repo.get_feedbacks_by_user_id(self.db, user_id, skip, limit)
        
        return [self._serialize_feedback(feedback) for feedback in feedbacks]
    
    def get_feedback_details(self, feedback_id: int, user_id: int) -> Dict[str, Any]:
        """Get detailed feedback with admin responses"""
        feedback = self.feedback_repo.get_feedback_by_id(self.db, feedback_id)
        if not feedback or feedback.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        # Get responses
        responses_data = []
        for response in feedback.responses:
            responses_data.append({
                "response_id": response.response_id,
                "feedback_id": response.feedback_id,
                "admin_id": response.admin_id,
                "response_message": response.response_message,
                "created_at": response.created_at
            })
        
        result = self._serialize_feedback(feedback)
        result["responses"] = responses_data
        return result
    
    def update_feedback_status(self, feedback_id: int, user_id: int, status: FeedbackStatus) -> Dict[str, str]:
        """Update feedback status"""
        feedback = self.feedback_repo.get_feedback_by_id(self.db, feedback_id)
        if not feedback or feedback.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        updated_feedback = self.feedback_repo.update_feedback_status(self.db, feedback_id, status)
        if not updated_feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        return {"message": f"Feedback status updated to {status}"}
    
    def create_issue(self, issue_data: UserIssueCreate, user_id: int) -> Dict[str, Any]:
        """Create a new user issue (for delivery persons)"""
        # Validate order exists
        order = self.order_repo.get_order_by_id(self.db, issue_data.order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Create issue
        issue_data_dict = {
            "raised_by_id": user_id,
            "raised_by_role": issue_data.raised_by_role,
            "order_id": issue_data.order_id,
            "delivery_id": issue_data.delivery_id,
            "issue_type": issue_data.issue_type,
            "title": issue_data.title,
            "description": issue_data.description,
            "priority": issue_data.priority
        }
        
        issue = self.issue_repo.create_issue(self.db, issue_data_dict)
        
        return self._serialize_issue(issue)
    
    def get_user_issues(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all issues reported by current user"""
        issues = self.issue_repo.get_issues_by_user_id(self.db, user_id, skip, limit)
        
        return [self._serialize_issue(issue) for issue in issues]
    
    def update_issue_status(self, issue_id: int, user_id: int, status: str) -> Dict[str, str]:
        """Update issue status"""
        issue = self.issue_repo.get_issue_by_id(self.db, issue_id)
        if not issue or issue.raised_by_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found"
            )
        
        updated_issue = self.issue_repo.update_issue_status(self.db, issue_id, status)
        if not updated_issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Issue not found"
            )
        
        return {"message": f"Issue status updated to {status}"}
    
    def get_all_feedbacks(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all feedbacks (admin only)"""
        feedbacks = self.feedback_repo.get_all_feedbacks(self.db, skip, limit)
        
        return [self._serialize_feedback(feedback) for feedback in feedbacks]
    
    def get_all_issues(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all issues (admin only)"""
        issues = self.issue_repo.get_all_issues(self.db, skip, limit)
        
        return [self._serialize_issue(issue) for issue in issues]
    
    def respond_to_feedback(self, feedback_id: int, admin_id: int, response_data: FeedbackResponseCreate) -> Dict[str, Any]:
        """Admin responds to feedback"""
        feedback = self.feedback_repo.get_feedback_by_id(self.db, feedback_id)
        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feedback not found"
            )
        
        # Create response
        response_data_dict = {
            "feedback_id": feedback_id,
            "admin_id": admin_id,
            "response_message": response_data.response_message
        }
        
        response = self.feedback_repo.create_feedback_response(self.db, response_data_dict)
        
        # Update feedback status to IN_PROGRESS if it was OPEN
        if feedback.feedback_status == FeedbackStatus.OPEN:
            feedback.feedback_status = FeedbackStatus.IN_PROGRESS
            self.db.commit()
        
        return {
            "response_id": response.response_id,
            "feedback_id": response.feedback_id,
            "admin_id": response.admin_id,
            "response_message": response.response_message,
            "created_at": response.created_at
        }
    
    def get_feedback_analytics(self) -> Dict[str, Any]:
        """Get feedback statistics for admin dashboard"""
        return self.feedback_repo.get_feedback_analytics(self.db)
    
    def _serialize_feedback(self, feedback: Feedback) -> Dict[str, Any]:
        """Serialize feedback data"""
        return {
            "feedback_id": feedback.feedback_id,
            "user_id": feedback.user_id,
            "order_id": feedback.order_id,
            "feedback_type": feedback.feedback_type,
            "subject": feedback.subject,
            "message": feedback.message,
            "rating": feedback.rating,
            "feedback_status": feedback.feedback_status,
            "created_at": feedback.created_at,
            "resolved_at": feedback.resolved_at
        }
    
    def _serialize_issue(self, issue: UserIssue) -> Dict[str, Any]:
        """Serialize issue data"""
        return {
            "issue_id": issue.issue_id,
            "raised_by_id": issue.raised_by_id,
            "raised_by_role": issue.raised_by_role,
            "order_id": issue.order_id,
            "delivery_id": issue.delivery_id,
            "issue_type": issue.issue_type,
            "title": issue.title,
            "description": issue.description,
            "priority": issue.priority,
            "status": issue.status,
            "resolution_note": issue.resolution_note,
            "created_at": issue.created_at,
            "resolved_at": issue.resolved_at
        }