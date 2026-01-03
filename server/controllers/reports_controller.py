from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from config.dependencies import get_db, get_current_user, is_admin
from services.reports_service import ReportsService
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
    CustomerEngagement, CustomerFeedbackSummary, CustomerDetail,
    
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
from models.user import User

class ReportsController:
    
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.service = ReportsService(db)
    
    # ===== PRODUCT REPORTS =====
    
    def get_product_performance(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[ProductPerformance]:
        """Get product performance report"""
        try:
            return self.service.get_product_performance(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate product performance report: {str(e)}"
            )
    
    def get_top_selling_products(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 10,
        current_user: User = None
    ) -> List[TopSellingProduct]:
        """Get top selling products"""
        try:
            return self.service.get_top_selling_products(start_date, end_date, limit)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate top selling products report: {str(e)}"
            )
    
    def get_product_conversion_rate(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[ProductConversionRate]:
        """Get product conversion rates"""
        try:
            return self.service.get_product_conversion_rate(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate product conversion rate report: {str(e)}"
            )
    
    def get_low_stock_alerts(
        self,
        threshold: int = 10,
        current_user: User = None
    ) -> List[LowStockAlert]:
        """Get low stock alerts"""
        try:
            return self.service.get_low_stock_alerts(threshold)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate low stock alerts: {str(e)}"
            )
    
    def get_product_rating_distribution(
        self,
        current_user: User = None
    ) -> List[ProductRatingDistribution]:
        """Get product rating distribution"""
        try:
            return self.service.get_product_rating_distribution()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate product rating distribution: {str(e)}"
            )
    
    def report_all_products(
        self,
        current_user: User = None
    ) -> List[Dict]:
        """Get all products report"""
        try:
            return self.service.report_all_products()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate all products report: {str(e)}"
            )
    
    def report_product_sales_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[ProductSalesSummary]:
        """Get product sales summary"""
        try:
            return self.service.report_product_sales_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate product sales summary: {str(e)}"
            )
    
    def report_product_reviews(
        self,
        current_user: User = None
    ) -> List[ProductReviewDetail]:
        """Get all product reviews"""
        try:
            return self.service.report_product_reviews()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate product reviews report: {str(e)}"
            )
    
    # ===== SALES REPORTS =====
    
    def get_total_sales_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> SalesReport:
        """Get total sales report"""
        try:
            return self.service.get_total_sales_report(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate total sales report: {str(e)}"
            )
    
    def get_sales_by_category(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[SalesByCategory]:
        """Get sales by category"""
        try:
            return self.service.get_sales_by_category(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate sales by category report: {str(e)}"
            )
    
    def get_sales_by_brand(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[SalesByBrand]:
        """Get sales by brand"""
        try:
            return self.service.get_sales_by_brand(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate sales by brand report: {str(e)}"
            )
    
    def get_daily_sales_trend(
        self,
        start_date: date,
        end_date: date,
        current_user: User = None
    ) -> List[DailySalesTrend]:
        """Get daily sales trend"""
        try:
            return self.service.get_daily_sales_trend(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate daily sales trend: {str(e)}"
            )
    
    def report_all_orders(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[OrderDetail]:
        """Get all orders report"""
        try:
            return self.service.report_all_orders(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate all orders report: {str(e)}"
            )
    
    def get_order_status_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[OrderStatusSummary]:
        """Get order status summary"""
        try:
            return self.service.get_order_status_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate order status summary: {str(e)}"
            )
    
    def get_returns_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> ReturnSummary:
        """Get returns summary"""
        try:
            return self.service.get_returns_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate returns summary: {str(e)}"
            )
    
    def get_refund_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> RefundSummary:
        """Get refund summary"""
        try:
            return self.service.get_refund_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate refund summary: {str(e)}"
            )
    
    def report_order_items_detail(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[OrderItemDetail]:
        """Get order items detail"""
        try:
            return self.service.report_order_items_detail(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate order items detail: {str(e)}"
            )
    
    # ===== CUSTOMER REPORTS =====
    
    def get_active_user_count(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> int:
        """Get active user count"""
        try:
            return self.service.get_active_user_count(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get active user count: {str(e)}"
            )
    
    def get_new_vs_returning_users(
        self,
        start_date: date,
        end_date: date,
        current_user: User = None
    ) -> Dict:
        """Get new vs returning users"""
        try:
            return self.service.get_new_vs_returning_users(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate new vs returning users report: {str(e)}"
            )
    
    def get_user_engagement_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[CustomerEngagement]:
        """Get user engagement report"""
        try:
            return self.service.get_user_engagement_report(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate user engagement report: {str(e)}"
            )
    
    def get_customer_feedback_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> CustomerFeedbackSummary:
        """Get customer feedback summary"""
        try:
            return self.service.get_customer_feedback_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate customer feedback summary: {str(e)}"
            )
    
    def report_all_customers(
        self,
        current_user: User = None
    ) -> List[CustomerDetail]:
        """Get all customers report"""
        try:
            return self.service.report_all_customers()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate all customers report: {str(e)}"
            )
    
    def report_customer_orders(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[Dict]:
        """Get customer orders report"""
        try:
            return self.service.report_customer_orders(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate customer orders report: {str(e)}"
            )
    
    # ===== DELIVERY REPORTS =====
    
    def get_delivery_performance_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> DeliveryPerformance:
        """Get delivery performance report"""
        try:
            return self.service.get_delivery_performance_report(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate delivery performance report: {str(e)}"
            )
    
    def get_delivery_person_ranking(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[DeliveryPersonRanking]:
        """Get delivery person ranking"""
        try:
            return self.service.get_delivery_person_ranking(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate delivery person ranking: {str(e)}"
            )
    
    def get_delivery_issue_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> DeliveryIssueSummary:
        """Get delivery issue summary"""
        try:
            return self.service.get_delivery_issue_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate delivery issue summary: {str(e)}"
            )
    
    def report_all_delivery_persons(
        self,
        current_user: User = None
    ) -> List[DeliveryPersonDetail]:
        """Get all delivery persons"""
        try:
            return self.service.report_all_delivery_persons()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate all delivery persons report: {str(e)}"
            )
    
    def report_delivery_ratings(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[DeliveryRatingDetail]:
        """Get delivery ratings"""
        try:
            return self.service.report_delivery_ratings(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate delivery ratings report: {str(e)}"
            )
    
    # ===== INVENTORY REPORTS =====
    
    def get_inventory_status(
        self,
        current_user: User = None
    ) -> List[InventoryStatus]:
        """Get inventory status"""
        try:
            return self.service.get_inventory_status()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate inventory status report: {str(e)}"
            )
    
    def get_stock_movement(
        self,
        start_date: date,
        end_date: date,
        current_user: User = None
    ) -> List[StockMovement]:
        """Get stock movement"""
        try:
            return self.service.get_stock_movement(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate stock movement report: {str(e)}"
            )
    
    def get_purchase_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[PurchaseSummary]:
        """Get purchase summary"""
        try:
            return self.service.get_purchase_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate purchase summary: {str(e)}"
            )
    
    def get_supplier_performance(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[SupplierPerformance]:
        """Get supplier performance"""
        try:
            return self.service.get_supplier_performance(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate supplier performance report: {str(e)}"
            )
    
    # ===== MARKETING REPORTS =====
    
    def get_coupon_usage_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[CouponUsage]:
        """Get coupon usage report"""
        try:
            return self.service.get_coupon_usage_report(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate coupon usage report: {str(e)}"
            )
    
    def get_offer_performance_report(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[OfferPerformance]:
        """Get offer performance report"""
        try:
            return self.service.get_offer_performance_report(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate offer performance report: {str(e)}"
            )
    
    def report_promotional_summary(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> PromotionalSummary:
        """Get promotional summary"""
        try:
            return self.service.report_promotional_summary(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate promotional summary: {str(e)}"
            )
    
    # ===== ADMIN REPORTS =====
    
    def report_admin_activity(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[AdminActivity]:
        """Get admin activity report"""
        try:
            return self.service.report_admin_activity(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate admin activity report: {str(e)}"
            )
    
    def report_notifications_sent(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        current_user: User = None
    ) -> List[NotificationReport]:
        """Get notifications sent report"""
        try:
            return self.service.report_notifications_sent(start_date, end_date)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate notifications sent report: {str(e)}"
            )
    
    # ===== GENERAL REPORT METHODS =====
    
    def generate_report(
        self,
        report_type: ReportType,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        filters: Optional[Dict] = None,
        current_user: User = None
    ) -> ReportResponse:
        """Generate comprehensive report based on type"""
        try:
            data = None
            summary = None
            
            if report_type == ReportType.PRODUCT:
                if filters and filters.get("subtype") == "performance":
                    data = self.service.get_product_performance(start_date, end_date)
                elif filters and filters.get("subtype") == "top_selling":
                    limit = filters.get("limit", 10)
                    data = self.service.get_top_selling_products(start_date, end_date, limit)
                elif filters and filters.get("subtype") == "conversion":
                    data = self.service.get_product_conversion_rate(start_date, end_date)
                elif filters and filters.get("subtype") == "low_stock":
                    threshold = filters.get("threshold", 10)
                    data = self.service.get_low_stock_alerts(threshold)
                else:
                    data = self.service.report_all_products()
            
            elif report_type == ReportType.SALES:
                if filters and filters.get("subtype") == "total":
                    data = self.service.get_total_sales_report(start_date, end_date)
                elif filters and filters.get("subtype") == "category":
                    data = self.service.get_sales_by_category(start_date, end_date)
                elif filters and filters.get("subtype") == "brand":
                    data = self.service.get_sales_by_brand(start_date, end_date)
                elif filters and filters.get("subtype") == "daily_trend":
                    if not start_date or not end_date:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Start date and end date are required for daily trend"
                        )
                    data = self.service.get_daily_sales_trend(start_date, end_date)
                else:
                    data = self.service.report_all_orders(start_date, end_date)
            
            elif report_type == ReportType.CUSTOMER:
                if filters and filters.get("subtype") == "engagement":
                    data = self.service.get_user_engagement_report(start_date, end_date)
                elif filters and filters.get("subtype") == "feedback":
                    data = self.service.get_customer_feedback_summary(start_date, end_date)
                else:
                    data = self.service.report_all_customers()
            
            elif report_type == ReportType.DELIVERY:
                if filters and filters.get("subtype") == "performance":
                    data = self.service.get_delivery_performance_report(start_date, end_date)
                elif filters and filters.get("subtype") == "ranking":
                    data = self.service.get_delivery_person_ranking(start_date, end_date)
                else:
                    data = self.service.report_all_delivery_persons()
            
            elif report_type == ReportType.INVENTORY:
                if filters and filters.get("subtype") == "status":
                    data = self.service.get_inventory_status()
                elif filters and filters.get("subtype") == "movement":
                    if not start_date or not end_date:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Start date and end date are required for stock movement"
                        )
                    data = self.service.get_stock_movement(start_date, end_date)
                elif filters and filters.get("subtype") == "supplier":
                    data = self.service.get_supplier_performance(start_date, end_date)
                else:
                    data = self.service.get_purchase_summary(start_date, end_date)
            
            elif report_type == ReportType.MARKETING:
                if filters and filters.get("subtype") == "coupon":
                    data = self.service.get_coupon_usage_report(start_date, end_date)
                elif filters and filters.get("subtype") == "offer":
                    data = self.service.get_offer_performance_report(start_date, end_date)
                else:
                    data = self.service.report_promotional_summary(start_date, end_date)
            
            elif report_type == ReportType.ADMIN:
                if filters and filters.get("subtype") == "activity":
                    data = self.service.report_admin_activity(start_date, end_date)
                else:
                    data = self.service.report_notifications_sent(start_date, end_date)
            
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported report type: {report_type}"
                )
            
            return ReportResponse(
                success=True,
                report_type=report_type,
                generated_at=datetime.now(),
                data=data,
                summary=summary,
                message=f"Report generated successfully"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate report: {str(e)}"
            )
    
    def export_report(self, report_type, format, db, start_date=None, end_date=None):
        return self.service.export(
            report_type=report_type,
            format=format,
            db=db,
            start_date=start_date,
            end_date=end_date
        )