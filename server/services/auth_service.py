from sqlalchemy.orm import Session
from fastapi import HTTPException
from repositories.auth_repository import AuthRepository
from utils.hashing import hash_password, verify_password
from utils.jwt_handler import create_access_token


class AuthService:

    def __init__(self):
        self.auth_repo = AuthRepository()

    # --------------------- REGISTER ---------------------
    def register(self, user_data, db: Session):

        # Check email/username exists
        existing_user = self.auth_repo.get_user_by_email_or_username(
            db, user_data.email, user_data.username
        )

        if existing_user:
            if existing_user.email == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
            if existing_user.username == user_data.username:
                raise HTTPException(status_code=400, detail="Username already taken")

        # Hash password
        hashed_password = hash_password(user_data.password)

        # Prepare data for DB
        new_user_data = {
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hashed_password,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "phone": user_data.phone,
            "is_active": True,
            "is_verified": False
        }

        # Create user
        new_user = self.auth_repo.create_user(db, new_user_data)

        # roles
        roles = [ur.role.role_name for ur in new_user.roles] if new_user.roles else []

        return {
            "success": True,
            "message": "User Registered Successfully",
            "user": {
                "user_id": new_user.user_id,
                "username": new_user.username,
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "phone": new_user.phone,
                "roles": roles
            }
        }

    # --------------------- LOGIN ---------------------
    def login(self, user_data, db: Session):

        user = self.auth_repo.get_user_by_email(db, user_data.email)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(user_data.password, user.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect password")

        # roles
        roles = [ur.role.role_name for ur in user.roles] if user.roles else []

        # create JWT
        token = create_access_token({
            "user_id": user.user_id,
            "email": user.email,
            "roles": roles
        })

        return {
            "success": True,
            "message": "Login successful",
            "access_token": token,
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "roles": roles
            }
        }
