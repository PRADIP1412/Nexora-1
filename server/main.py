# main.py

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.database import init_db, get_db
import os
import sys
from sqlalchemy import inspect
from config.database import engine, SessionLocal
from models.address import State, City, Area, Address
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

# Import all route modules
from routes import (
    auth_routes,
    user_routes,
    role_routes,
    permission_routes,
    cart_routes,
    wishlist_routes,
    address_routes,
    review_routes,
    profile_routes,
    account_routes,
    delivery_routes,
    order_routes,
    payment_routes,
    delivery_person_routes,
    return_routes,
    refund_routes,
    notification_routes,
    analytics_routes,
    feedback_routes,
    address_routes,
    checkout_routes,
    dashboard_routes
)

from routes import (
    offer_routes,
    coupon_routes
)

from routes.product_catalog import (
    product_routes,
    variant_routes,
    category_routes,
    brand_routes,
    attribute_routes,
    media_routes
)

from routes.inventory import (
    batch_routes,
    company_routes,
    purchase_return_routes,
    purchase_routes,
    stock_routes,
    supplier_routes
)
os.environ["PYDANTIC_DISABLE_VALIDATION"] = "1"

# OR add this to suppress the specific error
import warnings
warnings.filterwarnings("ignore", message="not fully defined")


# --- Initialize FastAPI ---
app = FastAPI(
    title="Nexora E-commerce API",
    version="1.0.0",
    description="Complete E-commerce Backend API",
    docs_url="/docs",  # Keep docs
    redoc_url="/redoc",  # Keep redoc
    openapi_url="/openapi.json"  # Ensure this exists
)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static File Mount (uploads) ---
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/debug-database")
def debug_database():
    """Diagnostic route to check database state"""
    try:
        # Check what tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        # Check if we can query core tables
        db = SessionLocal()
        users_count = db.query(User).count()
        states_count = db.query(State).count()
        products_count = db.query(Product).count()
        db.close()
        
        return {
            "database_status": "connected",
            "total_tables": len(tables),
            "tables": sorted(tables),
            "data_counts": {
                "users": users_count,
                "states": states_count,
                "products": products_count
            },
            "core_tables_exist": all([
                'user' in tables,
                'state' in tables,
                'product' in tables,
                'product_variant' in tables
            ])
        }
        
    except Exception as e:
        return {
            "database_status": "error",
            "error": str(e)
        }
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
        headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
    )
@app.get("/test-db-insert")
def test_db_insert(db: Session = Depends(get_db)):
    """Test if we can insert into database"""
    try:
        # Test creating a user
        from models.user import User
        test_user = User(
            username="testuser",
            email="test@example.com",
            password_hash="test_hash",
            first_name="Test",
            last_name="User"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        return {
            "status": "success",
            "message": "Successfully inserted test user",
            "user_id": test_user.user_id,
            "username": test_user.username
        }
        
    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "error": str(e)
        }

# --- Include all routers ---
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(role_routes.router)
app.include_router(permission_routes.router)
app.include_router(cart_routes.router)
app.include_router(wishlist_routes.router)
app.include_router(address_routes.router)
app.include_router(review_routes.router)
app.include_router(profile_routes.router)
app.include_router(account_routes.router)
app.include_router(order_routes.router)
app.include_router(delivery_routes.router)
app.include_router(payment_routes.router)
app.include_router(delivery_person_routes.router)
app.include_router(return_routes.router)
app.include_router(refund_routes.router)
app.include_router(notification_routes.router)
app.include_router(analytics_routes.router)
app.include_router(feedback_routes.router)
app.include_router(address_routes.router)
app.include_router(checkout_routes.router)
app.include_router(dashboard_routes.router)


# Marketing Routes
app.include_router(offer_routes.router)
app.include_router(coupon_routes.router)

# Product Catalog Routes
app.include_router(product_routes.router)
app.include_router(variant_routes.router)
app.include_router(category_routes.router)
app.include_router(brand_routes.router)
app.include_router(attribute_routes.router)
app.include_router(media_routes.router)

# Inventory Routes
app.include_router(batch_routes.router)
app.include_router(company_routes.router)
app.include_router(purchase_routes.router)
app.include_router(purchase_return_routes.router)
app.include_router(stock_routes.router)
app.include_router(supplier_routes.router)

# --- Startup Event ---
@app.on_event("startup")
def startup():
    try:
        init_db()
        print("✅ Database initialized successfully!")
        print("🚀 Server started on http://localhost:8000")
        print("📖 API Documentation: http://localhost:8000/docs")
    except Exception as e:
        print(f"❌ Startup error: {e}")
        import traceback
        traceback.print_exc()

# --- Health & Root Routes ---
@app.get("/")
def root():
    return {
        "message": "Welcome to Nexora E-commerce API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}