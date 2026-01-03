from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime


class DeliveryAvailableService:

    def __init__(self, db: Session):
        self.db = db

    def fetchAvailableDeliveries(self):
        """Fetch available deliveries for delivery person"""
        try:
            results = self.db.execute(
                text("""
                SELECT 
                    d.delivery_id,
                    d.order_id,
                    d.status,
                    d.available_since,
                    d.assigned_at
                FROM delivery d
                WHERE d.status = 'AVAILABLE'
                  AND d.is_available = true
                ORDER BY d.available_since ASC
                """)
            ).fetchall()
            
            deliveries = []
            for row in results:
                delivery_id, order_id, status, available_since, assigned_at = row
                
                # Get customer details
                order_result = self.db.execute(
                    text("""
                    SELECT 
                        u.first_name,
                        u.last_name,
                        o.address_id
                    FROM "order" o
                    JOIN "user" u ON o.user_id = u.user_id
                    WHERE o.order_id = :order_id
                    """),
                    {"order_id": order_id}
                ).fetchone()
                
                if order_result:
                    customer_name = f"{order_result[0]} {order_result[1]}"
                    address_id = order_result[2]
                    
                    # Get address details
                    if address_id:
                        address_result = self.db.execute(
                            text("""
                            SELECT 
                                a.line1,
                                a.line2,
                                ar.area_name,
                                c.city_name,
                                s.state_name
                            FROM address a
                            JOIN area ar ON a.area_id = ar.area_id
                            JOIN city c ON ar.city_id = c.city_id
                            JOIN state s ON c.state_id = s.state_id
                            WHERE a.address_id = :address_id
                            """),
                            {"address_id": address_id}
                        ).fetchone()
                        
                        if address_result:
                            # Build address string
                            parts = []
                            if address_result[0]:
                                parts.append(address_result[0])
                            if address_result[1]:
                                parts.append(address_result[1])
                            if address_result[2]:
                                parts.append(f"{address_result[2]}")
                            if address_result[3]:
                                parts.append(f"{address_result[3]}")
                            if address_result[4]:
                                parts.append(f"{address_result[4]}")
                            
                            delivery_address = ", ".join(parts) if parts else "Address not available"
                        else:
                            delivery_address = "Address not available"
                    else:
                        delivery_address = "No address specified"
                else:
                    customer_name = "Customer"
                    delivery_address = "Address not available"
                
                deliveries.append({
                    "delivery_id": delivery_id,
                    "order_id": order_id,  # INTEGER
                    "status": status,
                    "customer_name": customer_name,
                    "delivery_address": delivery_address,
                    "available_since": available_since,
                    "waiting_time_minutes": (
                        (datetime.utcnow() - available_since).total_seconds() / 60
                        if available_since else 0
                    )
                })
            
            return deliveries
            
        except Exception as e:
            print(f"Error fetching available deliveries: {e}")
            return []

    def assignDeliveryToPerson(self, delivery_id, delivery_person_id):
        """Assign delivery to delivery person with transaction lock"""
        try:
            # Start transaction with row lock
            self.db.execute(text("BEGIN"))
            
            # Check if delivery is still available (with lock)
            result = self.db.execute(
                text("""
                SELECT status, is_available, delivery_person_id 
                FROM delivery 
                WHERE delivery_id = :delivery_id 
                FOR UPDATE
                """),
                {"delivery_id": delivery_id}
            ).fetchone()
            
            if not result:
                self.db.execute(text("ROLLBACK"))
                raise HTTPException(404, "Delivery not found")
            
            status, is_available, current_person_id = result
            
            # Check if already assigned
            if current_person_id:
                self.db.execute(text("ROLLBACK"))
                return {
                    "success": False,
                    "message": "Delivery already assigned to another person",
                    "assigned_to": current_person_id
                }
            
            if status != "AVAILABLE" or not is_available:
                self.db.execute(text("ROLLBACK"))
                return {
                    "success": False,
                    "message": "Delivery is no longer available"
                }
            
            # Assign delivery
            self.db.execute(
                text("""
                UPDATE delivery 
                SET delivery_person_id = :dp_id,
                    status = 'ASSIGNED',
                    is_available = false,
                    assigned_at = :now
                WHERE delivery_id = :delivery_id
                """),
                {
                    "dp_id": delivery_person_id,
                    "delivery_id": delivery_id,
                    "now": datetime.utcnow()
                }
            )
            
            self.db.execute(text("COMMIT"))
            
            return {
                "success": True,
                "message": "Delivery accepted successfully",
                "delivery_id": delivery_id,
                "delivery_person_id": delivery_person_id
            }
            
        except Exception as e:
            self.db.execute(text("ROLLBACK"))
            raise HTTPException(500, f"Failed to accept delivery: {str(e)}")

    def cancelDelivery(self, delivery_id, delivery_person_id):
        """Cancel delivery by delivery person"""
        try:
            # Start transaction
            self.db.execute(text("BEGIN"))
            
            # Check if delivery belongs to this person
            result = self.db.execute(
                text("""
                SELECT status, delivery_person_id 
                FROM delivery 
                WHERE delivery_id = :delivery_id 
                FOR UPDATE
                """),
                {"delivery_id": delivery_id}
            ).fetchone()
            
            if not result:
                self.db.execute(text("ROLLBACK"))
                raise HTTPException(404, "Delivery not found")
            
            status, assigned_person_id = result
            
            # Check permissions
            if assigned_person_id != delivery_person_id:
                self.db.execute(text("ROLLBACK"))
                raise HTTPException(403, "Not authorized to cancel this delivery")
            
            if status != "ASSIGNED":
                self.db.execute(text("ROLLBACK"))
                return {
                    "success": False,
                    "message": f"Cannot cancel delivery with status: {status}"
                }
            
            # Cancel and make available again
            self.db.execute(
                text("""
                UPDATE delivery 
                SET status = 'AVAILABLE',
                    is_available = true,
                    delivery_person_id = NULL,
                    available_since = :now
                WHERE delivery_id = :delivery_id
                """),
                {
                    "delivery_id": delivery_id,
                    "now": datetime.utcnow()
                }
            )
            
            self.db.execute(text("COMMIT"))
            
            return {
                "success": True,
                "message": "Delivery cancelled and made available again",
                "delivery_id": delivery_id
            }
            
        except Exception as e:
            self.db.execute(text("ROLLBACK"))
            raise HTTPException(500, f"Failed to cancel delivery: {str(e)}")