from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from controllers.auth_controller import AuthController
from schemas.user_schema import UserCreate, UserLogin, RegisterResponse, LoginResponse
from config.database import get_db

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return controller.register_user(user_data)

@router.post("/login", response_model=LoginResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return controller.login_user(user_data)
