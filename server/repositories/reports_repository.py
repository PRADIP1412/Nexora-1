from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, desc, asc, and_, or_, case, text, cast, Date, distinct
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal

# Import models
from models.product_catalog.product import Product
from models.product_catalog.product_variant import ProductVariant
from models.product_catalog.product_brand import ProductBrand
from models.product_catalog.category import Category
from models.product_catalog.sub_category import SubCategory
from models.product_catalog.product_review import ProductReview
from models.analytics.product_analytics import ProductAnalytics
from models.order.order import Order
from models.order.order_item import OrderItem
from models.order.order_return import OrderReturn
from models.order.order_refund import OrderRefund
from models.order.return_product import ReturnProduct
from models.user import User
from models.delivery.delivery import Delivery
from models.delivery.delivery_person import DeliveryPerson
from models.delivery.delivery_earnings import DeliveryEarnings
from models.feedback.feedback import Feedback, FeedbackType, FeedbackStatus
from models.feedback.user_issue import UserIssue
from models.inventory.stock_movement import StockMovement
from models.inventory.purchase import Purchase
from models.inventory.purchase_item import PurchaseItem
from models.inventory.supplier import Supplier
from models.inventory.company import Company
from models.inventory.purchase_return import PurchaseReturn, PurchaseReturnItem
from models.marketing.coupon import Coupon
from models.marketing.offer import Offer
from models.analytics.admin_activity_log import AdminActivityLog
from models.notification import Notification
from models.payment import Payment
from models.address import Address
from models.cart import Cart
from models.wishlist import Wishlist

class ReportsRepository:
    
    # ===== PRODUCT REPORTS =====
    
    @staticmethod
    def get_product_performance(
        db: Session, 
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get product performance analytics"""
        # Subquery for sales data
        sales_subquery = db.query(
            OrderItem.variant_id,
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.quantity * OrderItem.price).label('total_revenue')
        ).join(Order, Order.order_id == OrderItem.order_id).filter(
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            sales_subquery = sales_subquery.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        sales_subquery = sales_subquery.group_by(OrderItem.variant_id).subquery()
        
        results = db.query(
            ProductVariant.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            Category.category_name,
            ProductBrand.brand_name,
            func.coalesce(ProductAnalytics.view_count, 0).label('views'),
            func.coalesce(ProductAnalytics.wishlist_add_count, 0).label('wishlist_adds'),
            func.coalesce(ProductAnalytics.cart_add_count, 0).label('cart_adds'),
            func.coalesce(ProductAnalytics.purchase_count, 0).label('purchases'),
            func.coalesce(sales_subquery.c.total_sold, 0).label('total_sold'),
            func.coalesce(sales_subquery.c.total_revenue, 0).label('total_revenue'),
            case(
                (func.coalesce(ProductAnalytics.view_count, 0) > 0, 
                 (func.coalesce(ProductAnalytics.purchase_count, 0) * 100.0) / ProductAnalytics.view_count),
                else_=0.0
            ).label('conversion_rate'),
            ProductVariant.stock_quantity
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).outerjoin(
            ProductAnalytics, ProductAnalytics.variant_id == ProductVariant.variant_id
        ).outerjoin(
            SubCategory, SubCategory.sub_category_id == Product.sub_category_id
        ).outerjoin(
            Category, Category.category_id == SubCategory.category_id
        ).outerjoin(
            ProductBrand, ProductBrand.brand_id == Product.brand_id
        ).outerjoin(
            sales_subquery, sales_subquery.c.variant_id == ProductVariant.variant_id
        ).group_by(
            ProductVariant.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            Category.category_name,
            ProductBrand.brand_name,
            ProductAnalytics.view_count,
            ProductAnalytics.wishlist_add_count,
            ProductAnalytics.cart_add_count,
            ProductAnalytics.purchase_count,
            ProductVariant.stock_quantity,
            sales_subquery.c.total_sold,
            sales_subquery.c.total_revenue
        ).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "variant_name": r.variant_name,
                "category_name": r.category_name,
                "brand_name": r.brand_name,
                "views": r.views or 0,
                "wishlist_adds": r.wishlist_adds or 0,
                "cart_adds": r.cart_adds or 0,
                "purchases": r.purchases or 0,
                "total_sold": r.total_sold or 0,
                "total_revenue": float(r.total_revenue or 0),
                "conversion_rate": float(r.conversion_rate or 0),
                "stock_quantity": r.stock_quantity
            }
            for r in results
        ]
    
    @staticmethod
    def get_top_selling_products(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Get top selling products by quantity and revenue"""
        query = db.query(
            ProductVariant.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            Category.category_name,
            ProductBrand.brand_name,
            func.sum(OrderItem.quantity).label('total_sold'),
            func.sum(OrderItem.quantity * OrderItem.price).label('total_revenue'),
            ProductVariant.stock_quantity
        ).join(
            OrderItem, OrderItem.variant_id == ProductVariant.variant_id
        ).join(
            Order, Order.order_id == OrderItem.order_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).outerjoin(
            SubCategory, SubCategory.sub_category_id == Product.sub_category_id
        ).outerjoin(
            Category, Category.category_id == SubCategory.category_id
        ).outerjoin(
            ProductBrand, ProductBrand.brand_id == Product.brand_id
        ).filter(
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.group_by(
            ProductVariant.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            Category.category_name,
            ProductBrand.brand_name,
            ProductVariant.stock_quantity
        ).order_by(
            desc('total_sold')
        ).limit(limit).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "variant_name": r.variant_name,
                "category_name": r.category_name,
                "brand_name": r.brand_name,
                "total_sold": r.total_sold or 0,
                "total_revenue": float(r.total_revenue or 0),
                "stock_quantity": r.stock_quantity
            }
            for r in results
        ]
    
    @staticmethod
    def get_product_conversion_rate(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get product conversion rates"""
        results = db.query(
            ProductVariant.variant_id,
            Product.product_name,
            func.coalesce(ProductAnalytics.view_count, 0).label('views'),
            func.coalesce(ProductAnalytics.cart_add_count, 0).label('cart_adds'),
            func.coalesce(ProductAnalytics.purchase_count, 0).label('purchases'),
            case(
                (func.coalesce(ProductAnalytics.view_count, 0) > 0,
                 (func.coalesce(ProductAnalytics.cart_add_count, 0) * 100.0) / ProductAnalytics.view_count),
                else_=0.0
            ).label('view_to_cart_rate'),
            case(
                (func.coalesce(ProductAnalytics.cart_add_count, 0) > 0,
                 (func.coalesce(ProductAnalytics.purchase_count, 0) * 100.0) / ProductAnalytics.cart_add_count),
                else_=0.0
            ).label('cart_to_purchase_rate'),
            case(
                (func.coalesce(ProductAnalytics.view_count, 0) > 0,
                 (func.coalesce(ProductAnalytics.purchase_count, 0) * 100.0) / ProductAnalytics.view_count),
                else_=0.0
            ).label('overall_conversion_rate')
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).outerjoin(
            ProductAnalytics, ProductAnalytics.variant_id == ProductVariant.variant_id
        ).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "views": r.views or 0,
                "cart_adds": r.cart_adds or 0,
                "purchases": r.purchases or 0,
                "view_to_cart_rate": float(r.view_to_cart_rate or 0),
                "cart_to_purchase_rate": float(r.cart_to_purchase_rate or 0),
                "overall_conversion_rate": float(r.overall_conversion_rate or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def get_low_stock_alerts(db: Session, threshold: int = 10) -> List[Dict]:
        """Get low stock alerts"""
        results = db.query(
            ProductVariant.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            ProductVariant.stock_quantity,
            case(
                (ProductVariant.stock_quantity == 0, "OUT_OF_STOCK"),
                (ProductVariant.stock_quantity <= threshold, "LOW_STOCK"),
                else_="IN_STOCK"
            ).label('status')
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).filter(
            or_(
                ProductVariant.stock_quantity == 0,
                ProductVariant.stock_quantity <= threshold
            )
        ).order_by(ProductVariant.stock_quantity).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "variant_name": r.variant_name,
                "current_stock": r.stock_quantity,
                "threshold": threshold,
                "status": r.status
            }
            for r in results
        ]
    
    @staticmethod
    def get_product_rating_distribution(db: Session) -> List[Dict]:
        """Get product rating distribution"""
        rating_counts = db.query(
            ProductReview.variant_id,
            Product.product_name,
            func.avg(ProductReview.rating).label('average_rating'),
            func.count(ProductReview.review_id).label('total_reviews'),
            func.sum(case((ProductReview.rating == 1, 1), else_=0)).label('rating_1'),
            func.sum(case((ProductReview.rating == 2, 1), else_=0)).label('rating_2'),
            func.sum(case((ProductReview.rating == 3, 1), else_=0)).label('rating_3'),
            func.sum(case((ProductReview.rating == 4, 1), else_=0)).label('rating_4'),
            func.sum(case((ProductReview.rating == 5, 1), else_=0)).label('rating_5')
        ).join(
            ProductVariant, ProductVariant.variant_id == ProductReview.variant_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).group_by(
            ProductReview.variant_id, Product.product_name
        ).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "average_rating": float(r.average_rating or 0),
                "total_reviews": r.total_reviews,
                "rating_1": r.rating_1 or 0,
                "rating_2": r.rating_2 or 0,
                "rating_3": r.rating_3 or 0,
                "rating_4": r.rating_4 or 0,
                "rating_5": r.rating_5 or 0
            }
            for r in rating_counts
        ]
    
    @staticmethod
    def report_all_products(db: Session) -> List[Dict]:
        """Get full product list with details"""
        results = db.query(
            Product.product_id,
            Product.product_name,
            Product.description,
            Category.category_name,
            SubCategory.sub_category_name,
            ProductBrand.brand_name,
            Product.created_at,
            func.count(ProductVariant.variant_id).label('variant_count'),
            func.min(ProductVariant.price).label('min_price'),
            func.max(ProductVariant.price).label('max_price'),
            func.sum(ProductVariant.stock_quantity).label('total_stock')
        ).outerjoin(
            ProductVariant, ProductVariant.product_id == Product.product_id
        ).outerjoin(
            SubCategory, SubCategory.sub_category_id == Product.sub_category_id
        ).outerjoin(
            Category, Category.category_id == SubCategory.category_id
        ).outerjoin(
            ProductBrand, ProductBrand.brand_id == Product.brand_id
        ).group_by(
            Product.product_id,
            Product.product_name,
            Product.description,
            Category.category_name,
            SubCategory.sub_category_name,
            ProductBrand.brand_name,
            Product.created_at
        ).all()
        
        return [
            {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "description": r.description,
                "category": r.category_name,
                "sub_category": r.sub_category_name,
                "brand": r.brand_name,
                "created_at": r.created_at,
                "variant_count": r.variant_count or 0,
                "min_price": float(r.min_price or 0),
                "max_price": float(r.max_price or 0),
                "total_stock": r.total_stock or 0
            }
            for r in results
        ]
    
    @staticmethod
    def report_product_sales_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get product sales summary"""
        query = db.query(
            ProductVariant.variant_id,
            Product.product_name,
            Category.category_name,
            ProductBrand.brand_name,
            func.sum(OrderItem.quantity).label('quantity_sold'),
            func.sum(OrderItem.quantity * OrderItem.price).label('revenue'),
            func.avg(OrderItem.price).label('average_price')
        ).join(
            OrderItem, OrderItem.variant_id == ProductVariant.variant_id
        ).join(
            Order, Order.order_id == OrderItem.order_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).outerjoin(
            SubCategory, SubCategory.sub_category_id == Product.sub_category_id
        ).outerjoin(
            Category, Category.category_id == SubCategory.category_id
        ).outerjoin(
            ProductBrand, ProductBrand.brand_id == Product.brand_id
        ).filter(
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.group_by(
            ProductVariant.variant_id,
            Product.product_name,
            Category.category_name,
            ProductBrand.brand_name
        ).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "category_name": r.category_name,
                "brand_name": r.brand_name,
                "quantity_sold": r.quantity_sold or 0,
                "revenue": float(r.revenue or 0),
                "average_price": float(r.average_price or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def report_product_reviews(db: Session) -> List[Dict]:
        """Get all product reviews"""
        results = db.query(
            ProductReview.review_id,
            ProductReview.variant_id,
            Product.product_name,
            func.concat(User.first_name, ' ', User.last_name).label('user_name'),
            ProductReview.rating,
            ProductReview.title,
            ProductReview.body,
            ProductReview.created_at
        ).join(
            ProductVariant, ProductVariant.variant_id == ProductReview.variant_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).join(
            User, User.user_id == ProductReview.user_id
        ).order_by(desc(ProductReview.created_at)).all()
        
        return [
            {
                "review_id": r.review_id,
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "user_name": r.user_name,
                "rating": r.rating,
                "title": r.title,
                "body": r.body,
                "created_at": r.created_at
            }
            for r in results
        ]
    
    # ===== SALES REPORTS =====
    
    @staticmethod
    def get_total_sales_report(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get total sales report"""
        query = db.query(Order).filter(Order.order_status == "DELIVERED")
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        total_orders = query.count()
        
        # Calculate totals
        totals = query.with_entities(
            func.sum(Order.total_amount).label('total_revenue'),
            func.sum(Order.discount_amount).label('total_discount'),
            func.sum(
                Order.total_amount - Order.discount_amount
            ).label('net_sales')
        ).first()
        
        # Count items sold
        items_query = db.query(func.sum(OrderItem.quantity)).join(
            Order, Order.order_id == OrderItem.order_id
        ).filter(Order.order_status == "DELIVERED")
        
        if start_date and end_date:
            items_query = items_query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        total_items_sold = items_query.scalar() or 0
        
        # Calculate refunds
        refund_query = db.query(func.sum(OrderRefund.amount)).join(
            OrderReturn, OrderReturn.return_id == OrderRefund.return_id
        ).join(Order, Order.order_id == OrderReturn.order_id)
        
        if start_date and end_date:
            refund_query = refund_query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        refund_amount = refund_query.scalar() or 0
        
        # Average order value
        avg_order_value = totals.total_revenue / total_orders if total_orders > 0 else 0
        
        return {
            "total_revenue": float(totals.total_revenue or 0),
            "total_orders": total_orders,
            "total_items_sold": total_items_sold,
            "average_order_value": float(avg_order_value),
            "total_discount": float(totals.total_discount or 0),
            "net_sales": float(totals.net_sales or 0),
            "refund_amount": float(refund_amount)
        }
    
    @staticmethod
    def get_sales_by_category(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get sales by category"""
        query = db.query(
            Category.category_id,
            Category.category_name,
            func.sum(OrderItem.quantity * OrderItem.price).label('revenue'),
            func.count(distinct(Order.order_id)).label('order_count'),
            func.sum(OrderItem.quantity).label('item_count')
        ).join(
            ProductVariant, ProductVariant.variant_id == OrderItem.variant_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).join(
            SubCategory, SubCategory.sub_category_id == Product.sub_category_id
        ).join(
            Category, Category.category_id == SubCategory.category_id
        ).join(
            Order, Order.order_id == OrderItem.order_id
        ).filter(
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.group_by(
            Category.category_id, Category.category_name
        ).order_by(desc('revenue')).all()
        
        return [
            {
                "category_id": r.category_id,
                "category_name": r.category_name,
                "revenue": float(r.revenue or 0),
                "order_count": r.order_count,
                "item_count": r.item_count or 0
            }
            for r in results
        ]
    
    @staticmethod
    def get_sales_by_brand(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get sales by brand"""
        query = db.query(
            ProductBrand.brand_id,
            ProductBrand.brand_name,
            func.sum(OrderItem.quantity * OrderItem.price).label('revenue'),
            func.count(distinct(Order.order_id)).label('order_count'),
            func.sum(OrderItem.quantity).label('item_count')
        ).join(
            Product, Product.brand_id == ProductBrand.brand_id
        ).join(
            ProductVariant, ProductVariant.product_id == Product.product_id
        ).join(
            OrderItem, OrderItem.variant_id == ProductVariant.variant_id
        ).join(
            Order, Order.order_id == OrderItem.order_id
        ).filter(
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.group_by(
            ProductBrand.brand_id, ProductBrand.brand_name
        ).order_by(desc('revenue')).all()
        
        return [
            {
                "brand_id": r.brand_id,
                "brand_name": r.brand_name,
                "revenue": float(r.revenue or 0),
                "order_count": r.order_count,
                "item_count": r.item_count or 0
            }
            for r in results
        ]
    
    @staticmethod
    def get_daily_sales_trend(
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Dict]:
        """Get daily sales trend"""
        results = db.query(
            func.date(Order.placed_at).label('date'),
            func.sum(Order.total_amount).label('revenue'),
            func.count(Order.order_id).label('order_count'),
            func.sum(
                db.query(func.sum(OrderItem.quantity))
                .filter(OrderItem.order_id == Order.order_id)
                .correlate(Order)
                .scalar_subquery()
            ).label('item_count'),
            func.avg(Order.total_amount).label('average_order_value')
        ).filter(
            Order.order_status == "DELIVERED",
            Order.placed_at >= start_date,
            Order.placed_at <= end_date
        ).group_by(
            func.date(Order.placed_at)
        ).order_by(
            func.date(Order.placed_at)
        ).all()
        
        return [
            {
                "date": r.date,
                "revenue": float(r.revenue or 0),
                "order_count": r.order_count,
                "item_count": r.item_count or 0,
                "average_order_value": float(r.average_order_value or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def report_all_orders(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get all orders with details"""
        # Subquery for items count
        items_subquery = db.query(
            OrderItem.order_id,
            func.count(OrderItem.variant_id).label('items_count')
        ).group_by(OrderItem.order_id).subquery()
        
        query = db.query(
            Order.order_id,
            Order.placed_at.label('order_date'),
            func.concat(User.first_name, ' ', User.last_name).label('customer_name'),
            User.email.label('customer_email'),
            Order.order_status,
            Order.payment_status,
            Order.subtotal,
            Order.discount_amount.label('discount'),
            Order.delivery_fee,
            Order.tax_amount.label('tax'),
            Order.total_amount,
            func.coalesce(items_subquery.c.items_count, 0).label('items_count')
        ).join(
            User, User.user_id == Order.user_id
        ).outerjoin(
            items_subquery, items_subquery.c.order_id == Order.order_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.order_by(desc(Order.placed_at)).all()
        
        return [
            {
                "order_id": r.order_id,
                "order_date": r.order_date,
                "customer_name": r.customer_name,
                "customer_email": r.customer_email,
                "order_status": r.order_status,
                "payment_status": r.payment_status,
                "subtotal": float(r.subtotal),
                "discount": float(r.discount or 0),
                "delivery_fee": float(r.delivery_fee or 0),
                "tax": float(r.tax or 0),
                "total_amount": float(r.total_amount),
                "items_count": r.items_count or 0
            }
            for r in results
        ]
    
    @staticmethod
    def get_order_status_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get order status summary"""
        query = db.query(
            Order.order_status,
            func.count(Order.order_id).label('count'),
            func.sum(Order.total_amount).label('total_amount')
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.group_by(Order.order_status).all()
        
        total_orders = sum(r.count for r in results)
        
        return [
            {
                "status": r.order_status,
                "count": r.count,
                "percentage": (r.count / total_orders * 100) if total_orders > 0 else 0,
                "total_amount": float(r.total_amount or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def get_returns_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get returns summary"""
        query = db.query(OrderReturn).join(
            Order, Order.order_id == OrderReturn.order_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        total_returns = query.count()
        
        # Returned items count
        items_query = db.query(func.sum(ReturnProduct.quantity)).join(
            OrderReturn, OrderReturn.return_id == ReturnProduct.return_id
        ).join(Order, Order.order_id == OrderReturn.order_id)
        
        if start_date and end_date:
            items_query = items_query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        returned_items = items_query.scalar() or 0
        
        # Refund amount
        refund_query = db.query(func.sum(OrderRefund.amount)).join(
            OrderReturn, OrderReturn.return_id == OrderRefund.return_id
        ).join(Order, Order.order_id == OrderReturn.order_id)
        
        if start_date and end_date:
            refund_query = refund_query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        refund_amount = refund_query.scalar() or 0
        
        # Reasons breakdown
        reasons_query = db.query(
            OrderReturn.reason,
            func.count(OrderReturn.return_id).label('count')
        ).join(Order, Order.order_id == OrderReturn.order_id)
        
        if start_date and end_date:
            reasons_query = reasons_query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        reasons_results = reasons_query.group_by(OrderReturn.reason).all()
        reasons = {r.reason or "No reason provided": r.count for r in reasons_results}
        
        return {
            "total_returns": total_returns,
            "returned_items": returned_items,
            "refund_amount": float(refund_amount),
            "reasons": reasons
        }
    
    @staticmethod
    def get_refund_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get refund summary"""
        query = db.query(OrderRefund)
        
        if start_date and end_date:
            query = query.filter(
                OrderRefund.created_at >= start_date,
                OrderRefund.created_at <= end_date
            )
        
        total_refunds = query.count()
        
        # Total refund amount
        total_amount = query.with_entities(
            func.sum(OrderRefund.amount)
        ).scalar() or 0
        
        # Pending refunds
        pending_query = db.query(OrderRefund).filter(
            OrderRefund.status == "PENDING"
        )
        
        if start_date and end_date:
            pending_query = pending_query.filter(
                OrderRefund.created_at >= start_date,
                OrderRefund.created_at <= end_date
            )
        
        pending_refunds = pending_query.count()
        pending_amount = pending_query.with_entities(
            func.sum(OrderRefund.amount)
        ).scalar() or 0
        
        return {
            "total_refunds": total_refunds,
            "refund_amount": float(total_amount),
            "pending_refunds": pending_refunds,
            "pending_amount": float(pending_amount)
        }
    
    @staticmethod
    def report_order_items_detail(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get detailed order items"""
        query = db.query(
            OrderItem.order_id,
            OrderItem.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            OrderItem.quantity,
            OrderItem.price.label('unit_price'),
            OrderItem.discount_per_unit,  # Add this
            OrderItem.total.label('total_price')
        ).join(
            Order, Order.order_id == OrderItem.order_id
        ).join(
            ProductVariant, ProductVariant.variant_id == OrderItem.variant_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.all()
        
        return [
            {
                "order_id": r.order_id,
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "variant_name": r.variant_name,
                "quantity": r.quantity,
                "unit_price": float(r.unit_price),
                "discount_per_unit": float(r.discount_per_unit) if r.discount_per_unit else 0.0,  # Add this
                "total_price": float(r.total_price)
            }
            for r in results
        ]
    
    # ===== CUSTOMER REPORTS =====
    
    @staticmethod
    def get_active_user_count(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        """Get active user count"""
        query = db.query(User).filter(User.is_active == True)
        
        if start_date and end_date:
            # Users who logged in during the period
            query = query.filter(
                User.last_login >= start_date,
                User.last_login <= end_date
            )
        
        return query.count()
    
    @staticmethod
    def get_new_vs_returning_users(
        db: Session,
        start_date: date,
        end_date: date
    ) -> Dict:
        """Get new vs returning users"""
        # New users (first order in period)
        new_users_query = db.query(distinct(Order.user_id)).filter(
            Order.placed_at >= start_date,
            Order.placed_at <= end_date,
            Order.order_status == "DELIVERED"
        )
        
        new_users = new_users_query.count()
        
        # Total unique customers in period
        total_customers = new_users
        
        # Note: For accurate returning users, we'd need to check if they had orders before the period
        # This is simplified - returning users are those with multiple orders
        returning_query = db.query(Order.user_id).filter(
            Order.placed_at >= start_date,
            Order.placed_at <= end_date,
            Order.order_status == "DELIVERED"
        ).group_by(Order.user_id).having(func.count(Order.order_id) > 1)
        
        returning_users = returning_query.count()
        
        return {
            "new_users": new_users,
            "returning_users": returning_users,
            "total_customers": total_customers
        }
    
    @staticmethod
    def get_user_engagement_report(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get user engagement report"""
        # Subquery for user orders
        order_subq = db.query(
            Order.user_id,
            func.count(Order.order_id).label('total_orders'),
            func.sum(Order.total_amount).label('total_spent')
        )
        
        if start_date and end_date:
            order_subq = order_subq.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        order_subq = order_subq.group_by(Order.user_id).subquery()
        
        # Main query
        results = db.query(
            User.user_id,
            func.concat(User.first_name, ' ', User.last_name).label('customer_name'),
            func.coalesce(order_subq.c.total_orders, 0).label('total_orders'),
            func.coalesce(order_subq.c.total_spent, 0).label('total_spent'),
            func.count(distinct(Cart.variant_id)).label('cart_items'),
            func.count(distinct(Wishlist.variant_id)).label('wishlist_items'),
            func.count(ProductReview.review_id).label('reviews_count'),
            User.last_login
        ).outerjoin(
            order_subq, order_subq.c.user_id == User.user_id
        ).outerjoin(
            Cart, Cart.user_id == User.user_id
        ).outerjoin(
            Wishlist, Wishlist.user_id == User.user_id
        ).outerjoin(
            ProductReview, ProductReview.user_id == User.user_id
        ).group_by(
            User.user_id,
            User.first_name,
            User.last_name,
            order_subq.c.total_orders,
            order_subq.c.total_spent,
            User.last_login
        ).all()
        
        return [
            {
                "user_id": r.user_id,
                "customer_name": r.customer_name,
                "total_orders": r.total_orders,
                "total_spent": float(r.total_spent or 0),
                "cart_items": r.cart_items,
                "wishlist_items": r.wishlist_items,
                "reviews_count": r.reviews_count,
                "last_login": r.last_login
            }
            for r in results
        ]
    
    @staticmethod
    def get_customer_feedback_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get customer feedback summary"""
        query = db.query(Feedback)
        
        if start_date and end_date:
            query = query.filter(
                Feedback.created_at >= start_date,
                Feedback.created_at <= end_date
            )
        
        total_feedback = query.count()
        
        # Feedback type breakdown
        type_counts = db.query(
            Feedback.feedback_type,
            func.count(Feedback.feedback_id).label('count'),
            func.avg(Feedback.rating).label('avg_rating')
        )
        
        if start_date and end_date:
            type_counts = type_counts.filter(
                Feedback.created_at >= start_date,
                Feedback.created_at <= end_date
            )
        
        type_counts = type_counts.group_by(Feedback.feedback_type).all()
        
        feedback_types = {}
        for r in type_counts:
            feedback_types[r.feedback_type.value] = {
                "count": r.count,
                "avg_rating": float(r.avg_rating or 0) if r.feedback_type in [FeedbackType.APP_FEEDBACK, FeedbackType.DELIVERY_FEEDBACK] else None
            }
        
        # Unresolved feedback
        unresolved = query.filter(
            Feedback.feedback_status == FeedbackStatus.OPEN
        ).count()
        
        # Average rating (for feedback types that have ratings)
        avg_rating_query = db.query(func.avg(Feedback.rating)).filter(
            Feedback.rating.isnot(None)
        )
        
        if start_date and end_date:
            avg_rating_query = avg_rating_query.filter(
                Feedback.created_at >= start_date,
                Feedback.created_at <= end_date
            )
        
        average_rating = avg_rating_query.scalar() or 0
        
        return {
            "total_feedback": total_feedback,
            "complaints": feedback_types.get(FeedbackType.COMPLAINT.value, {}).get("count", 0),
            "suggestions": feedback_types.get(FeedbackType.SUGGESTION.value, {}).get("count", 0),
            "app_feedback": feedback_types.get(FeedbackType.APP_FEEDBACK.value, {}).get("count", 0),
            "delivery_feedback": feedback_types.get(FeedbackType.DELIVERY_FEEDBACK.value, {}).get("count", 0),
            "average_rating": float(average_rating),
            "unresolved_count": unresolved
        }
    
    @staticmethod
    def report_all_customers(db: Session) -> List[Dict]:
        """Get all customers with details"""
        results = db.query(
            User.user_id,
            User.username,
            User.email,
            User.first_name,
            User.last_name,
            User.phone,
            User.created_at.label('registration_date'),
            User.last_login,
            func.count(Order.order_id).label('total_orders'),
            func.sum(Order.total_amount).label('total_spent'),
            User.is_active
        ).outerjoin(
            Order, Order.user_id == User.user_id
        ).group_by(
            User.user_id,
            User.username,
            User.email,
            User.first_name,
            User.last_name,
            User.phone,
            User.created_at,
            User.last_login,
            User.is_active
        ).order_by(User.created_at.desc()).all()
        
        return [
            {
                "user_id": r.user_id,
                "username": r.username,
                "email": r.email,
                "first_name": r.first_name,
                "last_name": r.last_name,
                "phone": r.phone,
                "registration_date": r.registration_date,
                "last_login": r.last_login,
                "total_orders": r.total_orders or 0,
                "total_spent": float(r.total_spent or 0),
                "is_active": r.is_active
            }
            for r in results
        ]
    
    @staticmethod
    def report_customer_orders(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get customer orders report"""
        query = db.query(
            User.user_id,
            func.concat(User.first_name, ' ', User.last_name).label('customer_name'),
            User.email,
            func.count(Order.order_id).label('order_count'),
            func.sum(Order.total_amount).label('total_spent'),
            func.min(Order.placed_at).label('first_order'),
            func.max(Order.placed_at).label('last_order')
        ).join(
            Order, Order.user_id == User.user_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        results = query.group_by(
            User.user_id, User.first_name, User.last_name, User.email
        ).order_by(desc('total_spent')).all()
        
        return [
            {
                "user_id": r.user_id,
                "customer_name": r.customer_name,
                "email": r.email,
                "order_count": r.order_count,
                "total_spent": float(r.total_spent or 0),
                "first_order": r.first_order,
                "last_order": r.last_order
            }
            for r in results
        ]
    
    # ===== DELIVERY REPORTS =====
    
    @staticmethod
    def get_delivery_performance_report(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get delivery performance report"""
        query = db.query(Delivery)
        
        if start_date and end_date:
            query = query.filter(
                Delivery.assigned_at >= start_date,
                Delivery.assigned_at <= end_date
            )
        
        total_deliveries = query.count()
        
        # Status breakdown
        status_counts = db.query(
            Delivery.status,
            func.count(Delivery.delivery_id).label('count')
        )
        
        if start_date and end_date:
            status_counts = status_counts.filter(
                Delivery.assigned_at >= start_date,
                Delivery.assigned_at <= end_date
            )
        
        status_counts = status_counts.group_by(Delivery.status).all()
        
        status_map = {r.status: r.count for r in status_counts}
        
        # Calculate on-time rate (assuming DELIVERED status means on-time)
        on_time_deliveries = status_map.get("DELIVERED", 0)
        on_time_rate = (on_time_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0
        
        # Average delivery time (for completed deliveries)
        avg_time = db.query(
            func.avg(
                func.extract('epoch', Delivery.delivered_at - Delivery.assigned_at) / 3600
            )
        ).filter(
            Delivery.status == "DELIVERED",
            Delivery.delivered_at.isnot(None)
        )
        
        if start_date and end_date:
            avg_time = avg_time.filter(
                Delivery.assigned_at >= start_date,
                Delivery.assigned_at <= end_date
            )
        
        average_delivery_time = avg_time.scalar()
        
        return {
            "total_deliveries": total_deliveries,
            "completed_deliveries": status_map.get("DELIVERED", 0),
            "pending_deliveries": status_map.get("ASSIGNED", 0) + status_map.get("PICKED_UP", 0),
            "delayed_deliveries": status_map.get("DELAYED", 0),
            "failed_deliveries": status_map.get("FAILED", 0) + status_map.get("CANCELLED", 0),
            "on_time_rate": float(on_time_rate),
            "average_delivery_time": float(average_delivery_time) if average_delivery_time else None
        }
    
    @staticmethod
    def get_delivery_person_ranking(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get delivery person ranking"""
        query = db.query(
            DeliveryPerson.delivery_person_id,
            func.concat(User.first_name, ' ', User.last_name).label('delivery_person_name'),
            func.count(Delivery.delivery_id).label('total_deliveries'),
            func.sum(case((Delivery.status == "DELIVERED", 1), else_=0)).label('completed_deliveries'),
            func.sum(case((Delivery.status == "DELAYED", 1), else_=0)).label('delayed_deliveries'),
            func.sum(case((Delivery.status.in_(["FAILED", "CANCELLED"]), 1), else_=0)).label('failed_deliveries'),
            func.avg(DeliveryPerson.rating).label('average_rating'),
            func.sum(DeliveryEarnings.amount).label('total_earnings')
        ).join(
            User, User.user_id == DeliveryPerson.user_id
        ).outerjoin(
            Delivery, Delivery.delivery_person_id == DeliveryPerson.delivery_person_id
        ).outerjoin(
            DeliveryEarnings, DeliveryEarnings.delivery_person_id == DeliveryPerson.delivery_person_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Delivery.assigned_at >= start_date,
                Delivery.assigned_at <= end_date
            )
        
        results = query.group_by(
            DeliveryPerson.delivery_person_id,
            User.first_name,
            User.last_name
        ).order_by(desc('completed_deliveries')).all()
        
        return [
            {
                "delivery_person_id": r.delivery_person_id,
                "delivery_person_name": r.delivery_person_name,
                "total_deliveries": r.total_deliveries or 0,
                "completed_deliveries": r.completed_deliveries or 0,
                "delayed_deliveries": r.delayed_deliveries or 0,
                "failed_deliveries": r.failed_deliveries or 0,
                "average_rating": float(r.average_rating or 0),
                "total_earnings": float(r.total_earnings or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def get_delivery_issue_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get delivery issue summary"""
        query = db.query(UserIssue).filter(
            UserIssue.issue_type.ilike("%delivery%")
        )
        
        if start_date and end_date:
            query = query.filter(
                UserIssue.created_at >= start_date,
                UserIssue.created_at <= end_date
            )
        
        total_issues = query.count()
        
        # Status breakdown
        status_counts = db.query(
            UserIssue.status,
            func.count(UserIssue.issue_id).label('count')
        ).filter(UserIssue.issue_type.ilike("%delivery%"))
        
        if start_date and end_date:
            status_counts = status_counts.filter(
                UserIssue.created_at >= start_date,
                UserIssue.created_at <= end_date
            )
        
        status_counts = status_counts.group_by(UserIssue.status).all()
        status_map = {r.status: r.count for r in status_counts}
        
        # Issue type breakdown
        type_counts = db.query(
            UserIssue.issue_type,
            func.count(UserIssue.issue_id).label('count')
        ).filter(UserIssue.issue_type.ilike("%delivery%"))
        
        if start_date and end_date:
            type_counts = type_counts.filter(
                UserIssue.created_at >= start_date,
                UserIssue.created_at <= end_date
            )
        
        type_counts = type_counts.group_by(UserIssue.issue_type).all()
        type_map = {r.issue_type: r.count for r in type_counts}
        
        # Priority breakdown
        priority_counts = db.query(
            UserIssue.priority,
            func.count(UserIssue.issue_id).label('count')
        ).filter(UserIssue.issue_type.ilike("%delivery%"))
        
        if start_date and end_date:
            priority_counts = priority_counts.filter(
                UserIssue.created_at >= start_date,
                UserIssue.created_at <= end_date
            )
        
        priority_counts = priority_counts.group_by(UserIssue.priority).all()
        priority_map = {r.priority: r.count for r in priority_counts}
        
        return {
            "total_issues": total_issues,
            "resolved_issues": status_map.get("RESOLVED", 0),
            "pending_issues": total_issues - status_map.get("RESOLVED", 0),
            "issue_types": type_map,
            "priority_breakdown": priority_map
        }
    
    @staticmethod
    def report_all_delivery_persons(db: Session) -> List[Dict]:
        """Get all delivery persons"""
        results = db.query(
            DeliveryPerson.delivery_person_id,
            DeliveryPerson.user_id,
            func.concat(User.first_name, ' ', User.last_name).label('user_name'),
            DeliveryPerson.license_number,
            DeliveryPerson.status,
            DeliveryPerson.rating,
            DeliveryPerson.joined_at,
            func.count(Delivery.delivery_id).label('total_deliveries'),
            func.sum(DeliveryEarnings.amount).label('total_earnings')
        ).join(
            User, User.user_id == DeliveryPerson.user_id
        ).outerjoin(
            Delivery, Delivery.delivery_person_id == DeliveryPerson.delivery_person_id
        ).outerjoin(
            DeliveryEarnings, DeliveryEarnings.delivery_person_id == DeliveryPerson.delivery_person_id
        ).group_by(
            DeliveryPerson.delivery_person_id,
            DeliveryPerson.user_id,
            User.first_name,
            User.last_name,
            DeliveryPerson.license_number,
            DeliveryPerson.status,
            DeliveryPerson.rating,
            DeliveryPerson.joined_at
        ).order_by(DeliveryPerson.joined_at.desc()).all()
        
        return [
            {
                "delivery_person_id": r.delivery_person_id,
                "user_id": r.user_id,
                "user_name": r.user_name,
                "license_number": r.license_number,
                "status": r.status,
                "rating": float(r.rating or 0),
                "joined_at": r.joined_at,
                "total_deliveries": r.total_deliveries or 0,
                "total_earnings": float(r.total_earnings or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def report_delivery_ratings(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get delivery ratings"""
        # Create aliases for the User table
        DeliveryPersonUser = aliased(User)
        CustomerUser = aliased(User)
        
        query = db.query(
            Delivery.delivery_id,
            DeliveryPerson.delivery_person_id,
            func.concat(DeliveryPersonUser.first_name, ' ', DeliveryPersonUser.last_name).label('delivery_person_name'),
            Order.order_id,
            func.concat(CustomerUser.first_name, ' ', CustomerUser.last_name).label('customer_name'),
            Feedback.rating,
            Feedback.feedback_type,
            Feedback.created_at.label('feedback_date')
        ).join(
            DeliveryPerson, DeliveryPerson.delivery_person_id == Delivery.delivery_person_id
        ).join(
            DeliveryPersonUser, DeliveryPersonUser.user_id == DeliveryPerson.user_id
        ).join(
            Order, Order.order_id == Delivery.order_id
        ).join(
            CustomerUser, CustomerUser.user_id == Order.user_id
        ).outerjoin(
            Feedback, and_(
                Feedback.order_id == Order.order_id,
                Feedback.feedback_type == FeedbackType.DELIVERY_FEEDBACK
            )
        ).filter(
            Delivery.status == "DELIVERED"
        )
        
        if start_date and end_date:
            query = query.filter(
                Delivery.delivered_at >= start_date,
                Delivery.delivered_at <= end_date
            )
        
        results = query.order_by(desc(Feedback.created_at)).all()
        
        return [
            {
                "delivery_id": r.delivery_id,
                "delivery_person_id": r.delivery_person_id,
                "delivery_person_name": r.delivery_person_name,
                "order_id": r.order_id,
                "customer_name": r.customer_name,
                "rating": r.rating if r.rating is not None else None,
                "feedback_type": r.feedback_type.value if r.feedback_type else None,
                "feedback_date": r.feedback_date
            }
            for r in results
        ]
    
    # ===== INVENTORY REPORTS =====
    
    @staticmethod
    def get_inventory_status(db: Session) -> List[Dict]:
        """Get inventory status"""
        # Calculate reserved stock from carts
        cart_reserved = db.query(
            Cart.variant_id,
            func.sum(Cart.quantity).label('reserved_qty')
        ).group_by(Cart.variant_id).subquery()
        
        results = db.query(
            ProductVariant.variant_id,
            Product.product_name,
            ProductVariant.variant_name,
            Category.category_name,
            ProductVariant.stock_quantity.label('current_stock'),
            func.coalesce(cart_reserved.c.reserved_qty, 0).label('reserved_stock'),
            (ProductVariant.stock_quantity - func.coalesce(cart_reserved.c.reserved_qty, 0)).label('available_stock'),
            case(
                (ProductVariant.stock_quantity == 0, "OUT_OF_STOCK"),
                ((ProductVariant.stock_quantity - func.coalesce(cart_reserved.c.reserved_qty, 0)) <= 0, "RESERVED"),
                ((ProductVariant.stock_quantity - func.coalesce(cart_reserved.c.reserved_qty, 0)) <= 5, "LOW_STOCK"),
                else_="IN_STOCK"
            ).label('status')
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).outerjoin(
            SubCategory, SubCategory.sub_category_id == Product.sub_category_id
        ).outerjoin(
            Category, Category.category_id == SubCategory.category_id
        ).outerjoin(
            cart_reserved, cart_reserved.c.variant_id == ProductVariant.variant_id
        ).order_by(ProductVariant.stock_quantity).all()
        
        return [
            {
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "variant_name": r.variant_name,
                "category_name": r.category_name,
                "current_stock": r.current_stock,
                "reserved_stock": r.reserved_stock,
                "available_stock": r.available_stock,
                "status": r.status
            }
            for r in results
        ]
    
    @staticmethod
    def get_stock_movement(
        db: Session,
        start_date: date,
        end_date: date
    ) -> List[Dict]:
        """Get stock movement report"""
        results = db.query(
            StockMovement.movement_id,
            StockMovement.variant_id,
            Product.product_name,
            StockMovement.movement_type,
            StockMovement.quantity,
            StockMovement.unit_cost,
            StockMovement.reference_type,
            StockMovement.reference_id,
            StockMovement.moved_at,
            StockMovement.remark
        ).join(
            ProductVariant, ProductVariant.variant_id == StockMovement.variant_id
        ).join(
            Product, Product.product_id == ProductVariant.product_id
        ).filter(
            StockMovement.moved_at >= start_date,
            StockMovement.moved_at <= end_date
        ).order_by(desc(StockMovement.moved_at)).all()
        
        return [
            {
                "movement_id": r.movement_id,
                "variant_id": r.variant_id,
                "product_name": r.product_name,
                "movement_type": r.movement_type,
                "quantity": r.quantity,
                "unit_cost": float(r.unit_cost or 0),
                "reference_type": r.reference_type,
                "reference_id": r.reference_id,
                "moved_at": r.moved_at,
                "remark": r.remark
            }
            for r in results
        ]
    
    @staticmethod
    def get_purchase_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get purchase summary"""
        query = db.query(
            Purchase.purchase_id,
            Supplier.name.label('supplier_name'),
            Company.name.label('company_name'),
            Purchase.invoice_number,
            Purchase.total_cost,
            func.sum(PurchaseItem.quantity).label('total_quantity'),
            Purchase.purchase_date,
            Purchase.status
        ).join(
            Supplier, Supplier.supplier_id == Purchase.supplier_id
        ).join(
            Company, Company.company_id == Supplier.company_id
        ).outerjoin(
            PurchaseItem, PurchaseItem.purchase_id == Purchase.purchase_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Purchase.purchase_date >= start_date,
                Purchase.purchase_date <= end_date
            )
        
        results = query.group_by(
            Purchase.purchase_id,
            Supplier.name,
            Company.name,
            Purchase.invoice_number,
            Purchase.total_cost,
            Purchase.purchase_date,
            Purchase.status
        ).order_by(desc(Purchase.purchase_date)).all()
        
        return [
            {
                "purchase_id": r.purchase_id,
                "supplier_name": f"{r.supplier_name} - {r.company_name}",
                "invoice_number": r.invoice_number,
                "total_cost": float(r.total_cost),
                "total_quantity": r.total_quantity or 0,
                "purchase_date": r.purchase_date,
                "status": r.status
            }
            for r in results
        ]
    
    @staticmethod
    def get_supplier_performance(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get supplier performance"""
        # Purchase data
        purchase_subq = db.query(
            Purchase.supplier_id,
            func.count(Purchase.purchase_id).label('purchase_count'),
            func.sum(Purchase.total_cost).label('total_purchases'),
            func.sum(PurchaseItem.quantity).label('total_quantity'),
            func.avg(PurchaseItem.cost_per_unit).label('average_cost'),
            func.max(Purchase.purchase_date).label('last_purchase_date')
        ).join(
            PurchaseItem, PurchaseItem.purchase_id == Purchase.purchase_id
        )
        
        if start_date and end_date:
            purchase_subq = purchase_subq.filter(
                Purchase.purchase_date >= start_date,
                Purchase.purchase_date <= end_date
            )
        
        purchase_subq = purchase_subq.group_by(Purchase.supplier_id).subquery()
        
        # Return data
        return_subq = db.query(
            Supplier.supplier_id,
            func.count(PurchaseReturn.return_id).label('return_count'),
            func.sum(PurchaseReturnItem.quantity).label('returned_quantity')
        ).join(
            Purchase, Purchase.supplier_id == Supplier.supplier_id
        ).outerjoin(
            PurchaseReturn, PurchaseReturn.purchase_id == Purchase.purchase_id
        ).outerjoin(
            PurchaseReturnItem, PurchaseReturnItem.return_id == PurchaseReturn.return_id
        )
        
        if start_date and end_date:
            return_subq = return_subq.filter(
                Purchase.purchase_date >= start_date,
                Purchase.purchase_date <= end_date
            )
        
        return_subq = return_subq.group_by(Supplier.supplier_id).subquery()
        
        # Main query
        results = db.query(
            Supplier.supplier_id,
            Supplier.name.label('supplier_name'),
            Company.name.label('company_name'),
            func.coalesce(purchase_subq.c.total_purchases, 0).label('total_purchases'),
            func.coalesce(purchase_subq.c.total_quantity, 0).label('total_quantity'),
            func.coalesce(purchase_subq.c.average_cost, 0).label('average_cost'),
            purchase_subq.c.last_purchase_date,
            case(
                (purchase_subq.c.total_quantity > 0,
                 (func.coalesce(return_subq.c.returned_quantity, 0) * 100.0) / purchase_subq.c.total_quantity),
                else_=0.0
            ).label('return_rate')
        ).join(
            Company, Company.company_id == Supplier.company_id
        ).outerjoin(
            purchase_subq, purchase_subq.c.supplier_id == Supplier.supplier_id
        ).outerjoin(
            return_subq, return_subq.c.supplier_id == Supplier.supplier_id
        ).order_by(desc('total_purchases')).all()
        
        return [
            {
                "supplier_id": r.supplier_id,
                "supplier_name": r.supplier_name,
                "company_name": r.company_name,
                "total_purchases": float(r.total_purchases),
                "total_quantity": r.total_quantity,
                "average_cost": float(r.average_cost),
                "last_purchase_date": r.last_purchase_date,
                "return_rate": float(r.return_rate or 0)
            }
            for r in results
        ]
    
    # ===== MARKETING REPORTS =====
    
    @staticmethod
    def get_coupon_usage_report(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get coupon usage report"""
        # Subquery for order counts with coupon
        order_subq = db.query(
            Order.coupon_code,
            func.count(Order.order_id).label('order_count'),
            func.sum(Order.discount_amount).label('total_discount')
        ).filter(
            Order.coupon_code.isnot(None),
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            order_subq = order_subq.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        order_subq = order_subq.group_by(Order.coupon_code).subquery()
        
        results = db.query(
            Coupon.coupon_id,
            Coupon.code.label('coupon_code'),
            func.coalesce(order_subq.c.order_count, 0).label('total_usage'),
            func.coalesce(order_subq.c.total_discount, 0).label('total_discount'),
            func.coalesce(order_subq.c.order_count, 0).label('total_orders'),
            case(
                (func.coalesce(order_subq.c.order_count, 0) > 0,
                 func.coalesce(order_subq.c.total_discount, 0) / order_subq.c.order_count),
                else_=0.0
            ).label('average_discount'),
            case(
                (Coupon.usage_limit > 0,
                 (func.coalesce(order_subq.c.order_count, 0) * 100.0) / Coupon.usage_limit),
                else_=0.0
            ).label('redemption_rate')
        ).outerjoin(
            order_subq, order_subq.c.coupon_code == Coupon.code
        ).all()
        
        return [
            {
                "coupon_id": r.coupon_id,
                "coupon_code": r.coupon_code,
                "total_usage": r.total_usage,
                "total_discount": float(r.total_discount or 0),
                "total_orders": r.total_orders,
                "average_discount": float(r.average_discount or 0),
                "redemption_rate": float(r.redemption_rate or 0)
            }
            for r in results
        ]
    
    @staticmethod
    def get_offer_performance_report(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get offer performance report"""
        # Note: This is simplified as we don't have direct offer-order tracking
        results = db.query(
            Offer.offer_id,
            Offer.title.label('offer_title'),
            Offer.start_date,
            Offer.end_date,
            Offer.is_active,
            Offer.discount_value,
            Offer.discount_type
        ).all()
        
        return [
            {
                "offer_id": r.offer_id,
                "offer_title": r.offer_title,
                "start_date": r.start_date,
                "end_date": r.end_date,
                "is_active": r.is_active,
                "total_discount": float(r.discount_value),
                "revenue_influenced": 0.0,  # Would need tracking
                "affected_products": 0,  # Would need tracking
                "affected_orders": 0  # Would need tracking
            }
            for r in results
        ]
    
    @staticmethod
    def report_promotional_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict:
        """Get promotional summary"""
        # Coupon stats
        coupon_stats = db.query(
            func.count(Coupon.coupon_id).label('total_coupons'),
            func.sum(case((Coupon.is_active == True, 1), else_=0)).label('active_coupons'),
            func.sum(
                db.query(func.sum(Order.discount_amount))
                .filter(Order.coupon_code == Coupon.code)
                .correlate(Coupon)
                .scalar_subquery()
            ).label('total_coupon_discount')
        ).first()
        
        # Offer stats
        offer_stats = db.query(
            func.count(Offer.offer_id).label('total_offers'),
            func.sum(case((Offer.is_active == True, 1), else_=0)).label('active_offers')
        ).first()
        
        # Orders with promotions
        orders_with_promo = db.query(func.count(Order.order_id)).filter(
            Order.coupon_code.isnot(None),
            Order.order_status == "DELIVERED"
        )
        
        if start_date and end_date:
            orders_with_promo = orders_with_promo.filter(
                Order.placed_at >= start_date,
                Order.placed_at <= end_date
            )
        
        promo_orders_count = orders_with_promo.scalar() or 0
        
        return {
            "total_coupons": coupon_stats.total_coupons or 0,
            "active_coupons": coupon_stats.active_coupons or 0,
            "total_offers": offer_stats.total_offers or 0,
            "active_offers": offer_stats.active_offers or 0,
            "total_discount_given": float(coupon_stats.total_coupon_discount or 0),
            "orders_with_promotions": promo_orders_count
        }
    
    # ===== ADMIN REPORTS =====
    
    @staticmethod
    def report_admin_activity(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get admin activity report"""
        query = db.query(
            AdminActivityLog.log_id,
            AdminActivityLog.admin_id,
            func.concat(User.first_name, ' ', User.last_name).label('admin_name'),
            AdminActivityLog.action,
            AdminActivityLog.entity_type,
            AdminActivityLog.entity_id,
            AdminActivityLog.old_value,
            AdminActivityLog.new_value,
            AdminActivityLog.created_at,
            AdminActivityLog.ip_address
        ).join(
            User, User.user_id == AdminActivityLog.admin_id
        )
        
        if start_date and end_date:
            query = query.filter(
                AdminActivityLog.created_at >= start_date,
                AdminActivityLog.created_at <= end_date
            )
        
        results = query.order_by(desc(AdminActivityLog.created_at)).all()
        
        return [
            {
                "log_id": r.log_id,
                "admin_id": r.admin_id,
                "admin_name": r.admin_name,
                "action": r.action,
                "entity_type": r.entity_type,
                "entity_id": r.entity_id,
                "old_value": r.old_value,
                "new_value": r.new_value,
                "created_at": r.created_at,
                "ip_address": r.ip_address
            }
            for r in results
        ]
    
    @staticmethod
    def report_notifications_sent(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get notifications sent report"""
        query = db.query(
            Notification.notification_id,
            Notification.user_id,
            func.concat(User.first_name, ' ', User.last_name).label('user_name'),
            Notification.title,
            Notification.type,
            Notification.is_read,
            Notification.created_at,
            Notification.read_at
        ).join(
            User, User.user_id == Notification.user_id
        )
        
        if start_date and end_date:
            query = query.filter(
                Notification.created_at >= start_date,
                Notification.created_at <= end_date
            )
        
        results = query.order_by(desc(Notification.created_at)).all()
        
        return [
            {
                "notification_id": r.notification_id,
                "user_id": r.user_id,
                "user_name": r.user_name,
                "title": r.title,
                "type": r.type.value if r.type else None,
                "is_read": r.is_read,
                "created_at": r.created_at,
                "read_at": r.read_at
            }
            for r in results
        ]
    @staticmethod
    def get_products(db):
        return db.query(Product).all()

    @staticmethod
    def get_sales(db, start_date=None, end_date=None):
        query = db.query(Order)
        return query.all()

    @staticmethod
    def get_customers(db):
        return db.query(User).filter(User.role == "customer").all()

    @staticmethod
    def get_delivery_persons(db):
        return db.query(User).filter(User.role == "delivery").all()

    @staticmethod
    def get_inventory(db):
        return db.query(Inventory).all()