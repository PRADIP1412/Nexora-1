from sqlalchemy.orm import Session
from models.user import User
from typing import List, Optional

class UserRepository:
    
    @staticmethod
    def get_all_users(db: Session) -> List[User]:
        """Get all users"""
        return db.query(User).all()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.user_id == user_id).first()
    
    @staticmethod
    def update_user(db: Session, user: User, update_data: dict) -> User:
        """Update user"""
        for key, value in update_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user: User) -> None:
        """Delete user"""
        db.delete(user)
        db.commit()