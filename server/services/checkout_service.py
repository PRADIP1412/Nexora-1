from sqlalchemy.orm import Session
from decimal import Decimal
from repositories.checkout_repository import CheckoutRepository
from models.order.order import Order
from models.order.order_item import OrderItem

class CheckoutService:

    @staticmethod
    def calculate_shipping(address):
        # simple flat rate for now
        return Decimal("40.00")

    @staticmethod
    def calculate_tax(subtotal):
        tax_percentage = Decimal("0.18")  # 18%
        return (subtotal * tax_percentage).quantize(Decimal("0.01"))

    @staticmethod
    def validate_cart(db: Session, user_id: int):
        items = CheckoutRepository.get_cart_items(db, user_id)
        if not items:
            raise Exception("Cart is empty")

        return items

    @staticmethod
    def generate_checkout_summary(db: Session, user_id: int, address_id: int, coupon_code=None):
        items = CheckoutService.validate_cart(db, user_id)
        address = CheckoutRepository.get_address(db, user_id, address_id)
        if not address:
            raise Exception("Invalid address")

        subtotal = sum(Decimal(str(i.variant.price)) * i.quantity for i in items)
        discount = Decimal("0.00")

        # Apply coupon
        if coupon_code:
            coupon = CheckoutRepository.get_coupon(db, coupon_code)
            if coupon:
                discount = Decimal(str(coupon.discount_amount))

        delivery_fee = CheckoutService.calculate_shipping(address)
        tax = CheckoutService.calculate_tax(subtotal - discount)

        total = subtotal - discount + delivery_fee + tax

        detailed_items = [
            {
                "variant_id": i.variant_id,
                "quantity": i.quantity,
                "price": float(i.variant.price),
                "total": float(i.variant.price * i.quantity)
            }
            for i in items
        ]

        return {
            "subtotal": float(subtotal),
            "discount_amount": float(discount),
            "delivery_fee": float(delivery_fee),
            "tax_amount": float(tax),
            "total_amount": float(total),
            "coupon_code": coupon_code,
            "items": detailed_items,
            "address_id": address_id
        }

    @staticmethod
    def confirm_order(db: Session, user_id: int, data):
        summary = CheckoutService.generate_checkout_summary(
            db,
            user_id,
            data.address_id,
            data.coupon_code
        )

        order = Order(
            user_id=user_id,
            address_id=data.address_id,
            subtotal=summary["subtotal"],
            discount_amount=summary["discount_amount"],
            delivery_fee=summary["delivery_fee"],
            tax_amount=summary["tax_amount"],
            total_amount=summary["total_amount"],
            coupon_code=data.coupon_code,
            payment_status="PENDING",
            order_status="PLACED",
        )

        # OrderItems
        order_items = []
        for item in summary["items"]:
            order_items.append(
                OrderItem(
                    variant_id=item["variant_id"],
                    quantity=item["quantity"],
                    price=item["price"],
                    total=item["total"],
                )
            )

        return CheckoutRepository.create_order(db, order, order_items)
