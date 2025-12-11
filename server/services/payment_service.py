from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repositories.payment_repository import PaymentRepository
from repositories.order_repository import OrderRepository
from repositories.user_repository import UserRepository
from schemas.payment_schema import PaymentInitiateRequest, PaymentVerifyRequest
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
import hashlib
import hmac

class PaymentService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PaymentRepository()
        self.order_repo = OrderRepository()
        self.user_repo = UserRepository()
    
    def initiate_payment(self, payment_data: PaymentInitiateRequest, user_id: int) -> Dict[str, Any]:
        """Initiate a payment for an order"""
        order = self.order_repo.get_order_by_id(self.db, payment_data.order_id)
        if not order or order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        if order.payment_status == "PAID":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order already paid"
            )
        
        # Create payment record
        payment_data_dict = {
            "user_id": user_id,
            "order_id": payment_data.order_id,
            "payment_method": payment_data.payment_method,
            "amount_paid": order.total_amount,
            "payment_status": "PENDING"
        }
        
        payment = self.repository.create_payment(self.db, payment_data_dict)
        
        # For online payments, generate payment gateway data
        if payment_data.payment_method in ["RAZORPAY", "STRIPE"]:
            # In a real implementation, you would call Razorpay/Stripe API here
            razorpay_order_id = f"order_{payment.payment_id}_{datetime.now().timestamp()}"
            
            return {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "amount": float(payment.amount_paid),
                "currency": "INR",
                "razorpay_order_id": razorpay_order_id,
                "key": "your_razorpay_key_here"  # This should be from environment variables
            }
        else:
            # For COD, mark as pending but don't process payment
            return {
                "payment_id": payment.payment_id,
                "order_id": payment.order_id,
                "amount": float(payment.amount_paid),
                "currency": "INR"
            }
    def confirm_payment(self, payment_id: str, payment_data: dict):
        payment = PaymentRepository.get_payment_by_id(self.db, payment_id)

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        if payment.payment_status == "PAID":
            return {
                "message": "Payment already confirmed",
                "payment_id": payment_id,
                "status": "PAID"
            }

        updated_payment = PaymentRepository.confirm_payment(
            self.db, payment_id, payment_data
        )

        return {
            "message": "Payment confirmed successfully",
            "payment_id": updated_payment.payment_id,
            "status": updated_payment.payment_status,
            "transaction_reference": updated_payment.transaction_reference
        }


    # ===========================
    # GET PAYMENT STATUS
    # ===========================
    def get_payment_status(self, payment_id: str):
        status = PaymentRepository.get_payment_status(self.db, payment_id)

        if not status:
            raise HTTPException(status_code=404, detail="Payment not found")

        return {
            "payment_id": payment_id,
            "status": status
        }

    def verify_payment(self, verify_data: PaymentVerifyRequest, user_id: int) -> Dict[str, Any]:
        """Verify payment completion"""
        payment = self.repository.get_payment_by_id(self.db, verify_data.payment_id)
        if not payment or payment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # In a real implementation, verify with Razorpay/Stripe
        # This is a simplified version
        is_valid = True  # Replace with actual verification
        
        if is_valid:
            payment.payment_status = "PAID"
            payment.transaction_reference = verify_data.razorpay_payment_id
            
            # Update order status
            order = self.order_repo.get_order_by_id(self.db, payment.order_id)
            if order:
                order.payment_status = "PAID"
            
            self.db.commit()
            
            return {
                "payment_id": payment.payment_id,
                "status": "SUCCESS",
                "message": "Payment verified successfully"
            }
        else:
            payment.payment_status = "FAILED"
            self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed"
            )
    
    def get_user_payments(self, user_id: int, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """Get all payments for a user"""
        result = self.repository.get_payments_by_user_id(self.db, user_id, page, per_page)
        
        payments_data = [
            self._serialize_payment(payment) for payment in result["payments"]
        ]
        
        return {
            "payments": payments_data,
            "total_payments": result["total_payments"],
            "total_pages": result["total_pages"]
        }
    
    def get_payment_by_id(self, payment_id: int, user_id: int, is_admin: bool = False) -> Dict[str, Any]:
        """Get payment details by ID"""
        payment = self.repository.get_payment_by_id(self.db, payment_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if not is_admin and payment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return self._serialize_payment(payment)
    
    def get_all_payments(self, page: int = 1, per_page: int = 20, status: Optional[str] = None) -> Dict[str, Any]:
        """Get all payments"""
        result = self.repository.get_all_payments(self.db, page, per_page, status)
        
        payments_data = [
            self._serialize_payment(payment) for payment in result["payments"]
        ]
        
        return {
            "payments": payments_data,
            "total_payments": result["total_payments"],
            "total_pages": result["total_pages"]
        }
    
    def update_payment_status(self, payment_id: int, status: str) -> Dict[str, Any]:
        """Update payment status"""
        payment = self.repository.update_payment_status(self.db, payment_id, status)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        return self._serialize_payment(payment)
    
    def get_payment_for_refund(self, order_id: int) -> Payment:
        """Get payment details for refund processing"""
        payment = self.repository.get_payment_by_order_id(self.db, order_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found or not paid"
            )
        
        # Check if payment method supports refunds
        if payment.payment_method == "COD":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="COD payments cannot be refunded"
            )
        
        return payment
    
    def process_refund_payment(self, payment_id: int, refund_amount: Decimal) -> Dict[str, Any]:
        """Process refund through payment gateway"""
        payment = self.repository.get_payment_by_id(self.db, payment_id)
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if payment.payment_status != "PAID":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is not completed"
            )
        
        if refund_amount > payment.amount_paid - payment.amount_refunded:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refund amount exceeds available balance"
            )
        
        # Process refund based on payment method
        try:
            if payment.payment_method in ["RAZORPAY", "STRIPE"]:
                # Integrate with actual payment gateway
                refund_result = self._process_gateway_refund(payment, refund_amount)
            else:
                # For other methods like wallet, bank transfer
                refund_result = self._process_manual_refund(payment, refund_amount)
            
            # Update payment refund amount
            self.repository.update_payment_refund_amount(self.db, payment_id, refund_amount)
            
            return {
                "success": True,
                "transaction_id": refund_result.get("transaction_id"),
                "refund_amount": float(refund_amount),
                "remaining_balance": float(payment.amount_paid - payment.amount_refunded - refund_amount)
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Refund processing failed: {str(e)}"
            )
    
    def get_payment_refund_status(self, payment_id: int) -> Dict[str, Any]:
        """Get refund status and history for a payment"""
        payment = self.repository.get_payment_by_id(self.db, payment_id)
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Get refund history from OrderRefund table
        from models.order.order_refund import OrderRefund
        refunds = self.db.query(OrderRefund).filter(OrderRefund.payment_id == payment_id).all()
        
        refund_history = []
        for refund in refunds:
            refund_history.append({
                "refund_id": refund.refund_id,
                "amount": float(refund.amount),
                "status": refund.status,
                "processed_at": refund.processed_at
            })
        
        return {
            "payment_id": payment.payment_id,
            "total_paid": float(payment.amount_paid),
            "total_refunded": float(payment.amount_refunded),
            "available_for_refund": float(payment.amount_paid - payment.amount_refunded),
            "refund_history": refund_history
        }
    
    def _process_gateway_refund(self, payment: Payment, refund_amount: Decimal) -> Dict[str, Any]:
        """Process refund through payment gateway (Razorpay/Stripe)"""
        # This is a placeholder - implement actual gateway integration
        # For Razorpay:
        # client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
        # refund = client.payment.refund(payment.transaction_reference, {"amount": int(refund_amount * 100)})
        
        return {
            "transaction_id": f"REF_{payment.transaction_reference}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": "processed"
        }
    
    def _process_manual_refund(self, payment: Payment, refund_amount: Decimal) -> Dict[str, Any]:
        """Process manual refund (bank transfer, wallet credit, etc.)"""
        return {
            "transaction_id": f"MANUAL_REF_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": "processed"
        }
    
    def _serialize_payment(self, payment: Payment) -> Dict[str, Any]:
        """Serialize payment data"""
        return {
            "payment_id": payment.payment_id,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "amount_paid": float(payment.amount_paid),
            "transaction_reference": payment.transaction_reference,
            "payment_date": payment.payment_date,
            "order_id": payment.order_id,
            "user_id": payment.user_id
        }

    def confirm_payment(self, payment_id: str, payload: dict):
        """Confirm payment after gateway success webhook"""

        payment = PaymentRepository.get_payment_by_id(self.db, payment_id)

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        gateway_status = payload.get("status")
        transaction_ref = payload.get("transaction_id")

        # --------- Update payment status ---------
        if gateway_status == "SUCCESS":
            payment.payment_status = "PAID"
            payment.transaction_reference = transaction_ref
        else:
            payment.payment_status = "FAILED"

        self.db.commit()
        self.db.refresh(payment)

        return {
            "payment_id": payment.payment_id,
            "status": payment.payment_status,
            "transaction_reference": payment.transaction_reference
        }


    def get_payment_status(self, payment_id: str):
        """Return current payment status"""

        payment = PaymentRepository.get_payment_by_id(self.db, payment_id)

        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")

        return {
            "payment_id": payment.payment_id,
            "status": payment.payment_status,
            "amount_paid": float(payment.amount_paid),
            "transaction_reference": payment.transaction_reference
        }