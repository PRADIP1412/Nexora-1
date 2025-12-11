from schemas.user_schema import UserCreate, UserLogin, RegisterResponse, LoginResponse
from services.auth_service import AuthService

class AuthController:

    def __init__(self, db):
        self.db = db
        self.auth_service = AuthService()

    # REGISTER
    def register_user(self, user_data: UserCreate) -> RegisterResponse:
        response = self.auth_service.register(user_data, self.db)
        return RegisterResponse(**response)

    # LOGIN
    def login_user(self, user_data: UserLogin) -> LoginResponse:
        response = self.auth_service.login(user_data, self.db)
        return LoginResponse(**response)
