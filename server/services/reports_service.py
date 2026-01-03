from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.inspection import inspect
import csv
import io
import json

from repositories.reports_repository import ReportsRepository
from schemas.reports_schemas import (
    # Product Reports
    ProductPerformance, TopSellingProduct, ProductConversionRate,
    LowStockAlert, ProductRatingDistribution, ProductSalesSummary,
    ProductReviewDetail,
    
    # Sales Reports
    SalesReport, SalesByCategory, SalesByBrand, DailySalesTrend,
    OrderDetail, OrderStatusSummary, ReturnSummary, RefundSummary,
    OrderItemDetail,
    
    # Customer Reports
    CustomerReport, CustomerEngagement, CustomerFeedbackSummary,
    CustomerDetail,
    
    # Delivery Reports
    DeliveryPerformance, DeliveryPersonRanking, DeliveryIssueSummary,
    DeliveryPersonDetail, DeliveryRatingDetail,
    
    # Inventory Reports
    InventoryStatus, StockMovement, PurchaseSummary, SupplierPerformance,
    
    # Marketing Reports
    CouponUsage, OfferPerformance, PromotionalSummary,
    
    # Admin Reports
    AdminActivity, NotificationReport,
    
    # Response schemas
    ReportResponse, ReportExportResponse, ReportType, ReportFormat, DateRange
)

class ReportsService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = ReportsRepository()
    
    # ===== PRODUCT REPORTS =====
    
    def get_product_performance(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[ProductPerformance]:
        """Get product performance report"""
        data = self.repository.get_product_performance(self.db, start_date, end_date)
        return [ProductPerformance(**item) for item in data]
    
    def get_top_selling_products(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 10
    ) -> List[TopSellingProduct]:
        """Get top selling products"""
        data = self.repository.get_top_selling_products(self.db, start_date, end_date, limit)
        return [TopSellingProduct(**item) for item in data]
    
    def get_product_conversion_rate(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[ProductConversionRate]:
        """Get product conversion rates"""
        data = self.repository.get_product_conversion_rate(self.db, start_date, end_date)
        return [ProductConversionRate(**item) for item in data]
    
    def get_low_stock_alerts(self, threshold: int = 10) -> List[LowStockAlert]:
        """Get low stock alerts"""
        data = self.repository.get_low_stock_alerts(self.db, threshold)
        return [LowStockAlert(**item) for item in data]
    
    def get_product_rating_distribution(self) -> List[ProductRatingDistribution]:
        """Get product rating distribution"""
        data = self.repository.get_product_rating_distribution(self.db)
        return [ProductRatingDistribution(**item) for item in data]
    
    def report_all_products(self) -> List[Dict]:
        """Get all products report"""
        return self.repository.report_all_products(self.db)
    
    def report_product_sales_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[ProductSalesSummary]:
        """Get product sales summary"""
        data = self.repository.report_product_sales_summary(self.db, start_date, end_date)
        return [ProductSalesSummary(**item) for item in data]
    
    def report_product_reviews(self) -> List[ProductReviewDetail]:
        """Get all product reviews"""
        data = self.repository.report_product_reviews(self.db)
        return [ProductReviewDetail(**item) for item in data]
    
    # ===== SALES REPORTS =====
    
    def get_total_sales_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> SalesReport:
        """Get total sales report"""
        data = self.repository.get_total_sales_report(self.db, start_date, end_date)
        return SalesReport(**data)
    
    def get_sales_by_category(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[SalesByCategory]:
        """Get sales by category"""
        data = self.repository.get_sales_by_category(self.db, start_date, end_date)
        return [SalesByCategory(**item) for item in data]
    
    def get_sales_by_brand(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[SalesByBrand]:
        """Get sales by brand"""
        data = self.repository.get_sales_by_brand(self.db, start_date, end_date)
        return [SalesByBrand(**item) for item in data]
    
    def get_daily_sales_trend(
        self,
        start_date: date,
        end_date: date
    ) -> List[DailySalesTrend]:
        """Get daily sales trend"""
        data = self.repository.get_daily_sales_trend(self.db, start_date, end_date)
        return [DailySalesTrend(**item) for item in data]
    
    def report_all_orders(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[OrderDetail]:
        """Get all orders report"""
        data = self.repository.report_all_orders(self.db, start_date, end_date)
        return [OrderDetail(**item) for item in data]
    
    def get_order_status_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[OrderStatusSummary]:
        """Get order status summary"""
        data = self.repository.get_order_status_summary(self.db, start_date, end_date)
        return [OrderStatusSummary(**item) for item in data]
    
    def get_returns_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> ReturnSummary:
        """Get returns summary"""
        data = self.repository.get_returns_summary(self.db, start_date, end_date)
        return ReturnSummary(**data)
    
    def get_refund_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> RefundSummary:
        """Get refund summary"""
        data = self.repository.get_refund_summary(self.db, start_date, end_date)
        return RefundSummary(**data)
    
    def report_order_items_detail(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[OrderItemDetail]:
        """Get order items detail"""
        data = self.repository.report_order_items_detail(self.db, start_date, end_date)
        return [OrderItemDetail(**item) for item in data]
    
    # ===== CUSTOMER REPORTS =====
    
    def get_active_user_count(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> int:
        """Get active user count"""
        return self.repository.get_active_user_count(self.db, start_date, end_date)
    
    def get_new_vs_returning_users(
        self,
        start_date: date,
        end_date: date
    ) -> Dict:
        """Get new vs returning users"""
        return self.repository.get_new_vs_returning_users(self.db, start_date, end_date)
    
    def get_user_engagement_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[CustomerEngagement]:
        """Get user engagement report"""
        data = self.repository.get_user_engagement_report(self.db, start_date, end_date)
        return [CustomerEngagement(**item) for item in data]
    
    def get_customer_feedback_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> CustomerFeedbackSummary:
        """Get customer feedback summary"""
        data = self.repository.get_customer_feedback_summary(self.db, start_date, end_date)
        return CustomerFeedbackSummary(**data)
    
    def report_all_customers(self) -> List[CustomerDetail]:
        """Get all customers report"""
        data = self.repository.report_all_customers(self.db)
        return [CustomerDetail(**item) for item in data]
    
    def report_customer_orders(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict]:
        """Get customer orders report"""
        return self.repository.report_customer_orders(self.db, start_date, end_date)
    
    # ===== DELIVERY REPORTS =====
    
    def get_delivery_performance_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> DeliveryPerformance:
        """Get delivery performance report"""
        data = self.repository.get_delivery_performance_report(self.db, start_date, end_date)
        return DeliveryPerformance(**data)
    
    def get_delivery_person_ranking(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[DeliveryPersonRanking]:
        """Get delivery person ranking"""
        data = self.repository.get_delivery_person_ranking(self.db, start_date, end_date)
        return [DeliveryPersonRanking(**item) for item in data]
    
    def get_delivery_issue_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> DeliveryIssueSummary:
        """Get delivery issue summary"""
        data = self.repository.get_delivery_issue_summary(self.db, start_date, end_date)
        return DeliveryIssueSummary(**data)
    
    def report_all_delivery_persons(self) -> List[DeliveryPersonDetail]:
        """Get all delivery persons"""
        data = self.repository.report_all_delivery_persons(self.db)
        return [DeliveryPersonDetail(**item) for item in data]
    
    def report_delivery_ratings(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[DeliveryRatingDetail]:
        """Get delivery ratings"""
        data = self.repository.report_delivery_ratings(self.db, start_date, end_date)
        return [DeliveryRatingDetail(**item) for item in data]
    
    # ===== INVENTORY REPORTS =====
    
    def get_inventory_status(self) -> List[InventoryStatus]:
        """Get inventory status"""
        data = self.repository.get_inventory_status(self.db)
        return [InventoryStatus(**item) for item in data]
    
    def get_stock_movement(
        self,
        start_date: date,
        end_date: date
    ) -> List[StockMovement]:
        """Get stock movement"""
        data = self.repository.get_stock_movement(self.db, start_date, end_date)
        return [StockMovement(**item) for item in data]
    
    def get_purchase_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[PurchaseSummary]:
        """Get purchase summary"""
        data = self.repository.get_purchase_summary(self.db, start_date, end_date)
        return [PurchaseSummary(**item) for item in data]
    
    def get_supplier_performance(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[SupplierPerformance]:
        """Get supplier performance"""
        data = self.repository.get_supplier_performance(self.db, start_date, end_date)
        return [SupplierPerformance(**item) for item in data]
    
    # ===== MARKETING REPORTS =====
    
    def get_coupon_usage_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[CouponUsage]:
        """Get coupon usage report"""
        data = self.repository.get_coupon_usage_report(self.db, start_date, end_date)
        return [CouponUsage(**item) for item in data]
    
    def get_offer_performance_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[OfferPerformance]:
        """Get offer performance report"""
        data = self.repository.get_offer_performance_report(self.db, start_date, end_date)
        return [OfferPerformance(**item) for item in data]
    
    def report_promotional_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> PromotionalSummary:
        """Get promotional summary"""
        data = self.repository.report_promotional_summary(self.db, start_date, end_date)
        return PromotionalSummary(**data)
    
    # ===== ADMIN REPORTS =====
    
    def report_admin_activity(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[AdminActivity]:
        """Get admin activity report"""
        data = self.repository.report_admin_activity(self.db, start_date, end_date)
        return [AdminActivity(**item) for item in data]
    
    def report_notifications_sent(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[NotificationReport]:
        """Get notifications sent report"""
        data = self.repository.report_notifications_sent(self.db, start_date, end_date)
        return [NotificationReport(**item) for item in data]
    
    # ===== EXPORT METHODS =====
    
    def get_data(self, report_type, db, start_date=None, end_date=None):
        if report_type == ReportType.PRODUCT:
            return ReportsRepository.get_products(db)
        if report_type == ReportType.SALES:
            return ReportsRepository.get_sales(db, start_date, end_date)
        if report_type == ReportType.CUSTOMER:
            return ReportsRepository.get_customers(db)
        if report_type == ReportType.DELIVERY:
            return ReportsRepository.get_delivery_persons(db)
        if report_type == ReportType.INVENTORY:
            return ReportsRepository.get_inventory(db)
        return []

    def normalize(self, data):
        if not data:
            return []

        first = data[0]

        # ✅ Pydantic models
        if hasattr(first, "dict"):
            return [item.dict() for item in data]

        # ✅ SQLAlchemy ORM models
        if hasattr(first, "__table__"):
            return [
                {
                    column.key: getattr(item, column.key)
                    for column in inspect(item).mapper.column_attrs
                }
                for item in data
            ]

        # ✅ Already dict
        if isinstance(first, dict):
            return data

        # ❌ Unknown type
        raise ValueError("Unsupported data type for export")

    def export(self, report_type, format, db, start_date=None, end_date=None):
        raw_data = self.get_data(report_type, db, start_date, end_date)
        data = self.normalize(raw_data)

        if not data:
            return None, None

        if format == ReportFormat.CSV:
            return self._to_csv(data), "text/csv"

        return self._to_json(data), "application/json"

    def _to_csv(self, data):
        if not data:
            return b""

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue().encode("utf-8")

    def _to_json(self, data: List[Dict]) -> bytes:
        return json.dumps(data, indent=2, default=str).encode("utf-8")