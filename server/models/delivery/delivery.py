from sqlalchemy import Column, Integer, ForeignKey, String, TIMESTAMP, func
from sqlalchemy.orm import relationship
from config.database import Base

class Delivery(Base):
    __tablename__ = "delivery"

    delivery_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order.order_id", ondelete="CASCADE"))
    delivery_person_id = Column(Integer, ForeignKey("delivery_person.delivery_person_id", ondelete="SET NULL"))
    status = Column(String(50), default="ASSIGNED")
    assigned_at = Column(TIMESTAMP, server_default=func.now())
    delivered_at = Column(TIMESTAMP)

    order = relationship("Order", back_populates="delivery")
    delivery_person = relationship("DeliveryPerson", back_populates="deliveries")
    earnings = relationship("DeliveryEarnings", back_populates="delivery")
    issues = relationship("UserIssue", back_populates="delivery")