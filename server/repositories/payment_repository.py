from sqlalchemy.orm import Session
from models.payment import Payment
from models.order.order import Order
from models.user import User
from schemas.payment_schema import PaymentCreate, PaymentInitiateRequest
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, List, Optional
import math

class PaymentRepository:
    
    @staticmethod
    def get_payment_by_id(db: Session, payment_id: int) -> Optional[Payment]:
        """Get payment by ID"""
        return db.query(Payment).filter(Payment.payment_id == payment_id).first()
    
    @staticmethod
    def get_payments_by_user_id(db: Session, user_id: int, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Get all payments for a user"""
        query = db.query(Payment).filter(Payment.user_id == user_id)
        
        total = query.count()
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0
        
        if total == 0:
            return {
                "payments": [],
                "total_payments": 0,
                "total_pages": total_pages
            }
        
        offset = (page - 1) * per_page
        payments = query.order_by(Payment.payment_date.desc()).offset(offset).limit(per_page).all()
        
        return {
            "payments": payments,
            "total_payments": total,
            "total_pages": total_pages
        }
    
    @staticmethod
    def create_payment(db: Session, payment_data: Dict[str, Any]) -> Payment:
        """Create a new payment"""
        payment = Payment(**payment_data)
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment
    
    @staticmethod
    def update_payment_status(db: Session, payment_id: int, status: str) -> Optional[Payment]:
        """Update payment status"""
        payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
        
        if payment:
            payment.payment_status = status
            db.commit()
            db.refresh(payment)
        
        return payment
    
    @staticmethod
    def get_all_payments(db: Session, page: int = 1, per_page: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        """Get all payments"""
        query = db.query(Payment)
        
        if status:
            query = query.filter(Payment.payment_status == status)
        
        total = query.count()
        total_pages = math.ceil(total / per_page) if per_page > 0 else 0
        
        if total == 0:
            return {
                "payments": [],
                "total_payments": 0,
                "total_pages": total_pages
            }
        
        offset = (page - 1) * per_page
        payments = query.order_by(Payment.payment_date.desc()).offset(offset).limit(per_page).all()
        
        return {
            "payments": payments,
            "total_payments": total,
            "total_pages": total_pages
        }
    
    @staticmethod
    def get_payment_by_order_id(db: Session, order_id: int) -> Optional[Payment]:
        """Get payment by order ID"""
        return db.query(Payment).filter(
            Payment.order_id == order_id,
            Payment.payment_status == "PAID"
        ).first()
    
    @staticmethod
    def update_payment_refund_amount(db: Session, payment_id: int, refund_amount: Decimal) -> Optional[Payment]:
        """Update payment refund amount"""
        payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
        
        if payment:
            payment.amount_refunded += refund_amount
            db.commit()
            db.refresh(payment)
        
        return payment

    @staticmethod
    def confirm_payment(db: Session, payment_id: str, payment_data: dict) -> Optional[Payment]:
        """
        Mark payment as PAID and store transaction details.
        """
        payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()

        if not payment:
            return None

        payment.payment_status = "PAID"
        payment.transaction_reference = payment_data.get("transaction_reference")
        payment.amount_paid = payment_data.get("amount_paid", payment.amount_paid)
        payment.remarks = payment_data.get("remarks")

        db.commit()
        db.refresh(payment)
        return payment


    @staticmethod
    def get_payment_status(db: Session, payment_id: str) -> Optional[str]:
        """
        Return only the status of a payment.
        """
        payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()

        if not payment:
            return None

        return payment.payment_status