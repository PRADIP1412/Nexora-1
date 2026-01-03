from sqlalchemy.orm import Session
from fastapi import HTTPException
from repositories.customer_repository import CustomerRepository


class CustomerService:

    @staticmethod
    def get_all_customers(db: Session):
        return CustomerRepository.get_all_customers(db)

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int):
        customer = CustomerRepository.get_customer_by_id(db, customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer

    @staticmethod
    def update_customer(db: Session, customer_id: int, data: dict):
        customer = CustomerService.get_customer_by_id(db, customer_id)
        return CustomerRepository.update_customer(db, customer, data)

    @staticmethod
    def delete_customer(db: Session, customer_id: int):
        customer = CustomerService.get_customer_by_id(db, customer_id)
        CustomerRepository.delete_customer(db, customer)

    @staticmethod
    def get_customer_orders(db: Session, customer_id: int):
        CustomerService.get_customer_by_id(db, customer_id)
        return CustomerRepository.get_customer_orders(db, customer_id)

    @staticmethod
    def get_customer_stats(db: Session, customer_id: int):
        CustomerService.get_customer_by_id(db, customer_id)
        return CustomerRepository.get_customer_stats(db, customer_id)
