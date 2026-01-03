from sqlalchemy.orm import Session
from fastapi import HTTPException
from repositories.order_admin_repository import OrderAdminRepository

class OrderAdminService:

    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderAdminRepository()

    def get_all_orders(self, page, per_page, status):
        return self.repo.get_all_orders(self.db, page, per_page, status)

    def get_order_admin(self, order_id):
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        return order

    def update_order_admin(self, order_id, data, admin_id):
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")

        for key, value in data.items():
            setattr(order, key, value)

        self.repo.add_history(self.db, order_id, data.get("order_status"), admin_id)
        self.db.commit()
        return order

    def admin_cancel_order(self, order_id, admin_id):
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        
        order.order_status = "CANCELLED"
        self.repo.add_history(self.db, order_id, "CANCELLED", admin_id)
        self.db.commit()
        return {"message": "Order cancelled by admin"}

    def delete_order(self, order_id):
        self.repo.delete_order(self.db, order_id)
        self.db.commit()
        return {"message": "Order deleted"}

    def get_order_items(self, order_id):
        return self.repo.get_order_items(self.db, order_id)

    def update_order_item_qty(self, order_id: int, variant_id: int, qty: int):
        if qty <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than zero"
            )

        return self.repo.update_order_item_qty(
            self.db,
            order_id,
            variant_id,
            qty
        )

    def remove_order_item(self, order_id, variant_id):
        return self.repo.remove_order_item(self.db, order_id, variant_id)

    def get_order_history(self, order_id):
        return self.repo.get_order_history(self.db, order_id)

    def add_order_history(self, order_id, status, admin_id):
        history = self.repo.add_history(
            self.db,
            order_id,
            status,
            admin_id
        )

        self.db.commit()

        return {
            "message": "Order history added successfully",
            "history_id": history.history_id,
            "order_id": history.order_id,
            "status": history.status
        }

    def list_all_returns(self):
        return self.repo.list_all_returns(self.db)

    def get_return_request(self, return_id):
        return self.repo.get_return_request(self.db, return_id)

    def approve_return(self, return_id, admin_id):
        return self.repo.update_return_status(self.db, return_id, "APPROVED")

    def reject_return(self, return_id, admin_id, reason):
        return self.repo.update_return_status(self.db, return_id, "REJECTED")

    def get_return_items(self, return_id):
        return self.repo.get_return_items(self.db, return_id)

    def list_all_refunds(self):
        return self.repo.list_all_refunds(self.db)

    def get_refund(self, refund_id):
        return self.repo.get_refund(self.db, refund_id)

    def create_refund(self, return_id, admin_id):
        return self.repo.create_refund(self.db, return_id, admin_id)

    def update_refund_status(self, refund_id, status, admin_id):
        return self.repo.update_refund_status(self.db, refund_id, status)

    def retry_refund(self, refund_id, admin_id):
        return self.update_refund_status(refund_id, "PROCESSING", admin_id)

    def get_order_stats(self):
        return self.repo.get_order_stats(self.db)

    def get_orders_by_date(self, start, end):
        return self.repo.get_orders_by_date(self.db, start, end)

    def get_orders_by_payment_status(self, status):
        return self.repo.get_orders_by_payment_status(self.db, status)

    def get_orders_by_delivery_status(self, status):
        return self.repo.get_orders_by_delivery_status(self.db, status)

    # ADD THESE MISSING METHODS:
    def assign_delivery(self, order_id, delivery_user_id):
        # Basic implementation - you'll need to modify based on your Order model
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        
        # Assuming your Order model has a delivery_user_id field
        order.delivery_user_id = delivery_user_id
        self.db.commit()
        
        return {"message": "Delivery person assigned", "order_id": order_id, "delivery_user_id": delivery_user_id}

    def update_delivery_person(self, order_id, delivery_user_id):
        # Similar to assign_delivery
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        
        order.delivery_user_id = delivery_user_id
        self.db.commit()
        
        return {"message": "Delivery person updated", "order_id": order_id, "delivery_user_id": delivery_user_id}

    def get_delivery_details(self, order_id):
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        
        # Return delivery details based on your Order model
        return {
            "order_id": order.order_id,
            "delivery_user_id": getattr(order, 'delivery_user_id', None),
            "delivery_status": order.order_status,
            "delivery_address": getattr(order, 'delivery_address', None),
            "estimated_delivery": getattr(order, 'estimated_delivery', None)
        }

    def get_order_issues(self, order_id):
        # Placeholder - implement based on your Issue model
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        
        return {"message": "No issues found", "order_id": order_id}

    def resolve_order_issue(self, issue_id, resolution_note):
        # Placeholder - implement based on your Issue model
        return {"message": f"Issue {issue_id} resolved", "resolution_note": resolution_note}

    def get_order_feedback(self, order_id):
        # Placeholder - implement based on your Feedback model
        order = self.repo.get_order_by_id(self.db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        
        return {"message": "No feedback available", "order_id": order_id}