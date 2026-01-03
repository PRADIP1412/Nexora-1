from fastapi import APIRouter, Depends, Query, HTTPException, status, Response
from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
import json
from fastapi.responses import StreamingResponse

from config.dependencies import get_current_user, is_admin
from controllers.reports_controller import ReportsController
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
from config.dependencies import get_db
router = APIRouter(prefix="/api/v1/admin/reports", tags=["Admin Reports"])

# ===== PRODUCT REPORTS ENDPOINTS =====

@router.get("/products/performance", response_model=List[ProductPerformance])
def get_product_performance(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get product performance report (views, wishlist, cart, purchases)
    """
    return controller.get_product_performance(start_date, end_date, current_user)

@router.get("/products/top-selling", response_model=List[TopSellingProduct])
def get_top_selling_products(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(10, ge=1, le=100, description="Number of products to return"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get top selling products by quantity and revenue
    """
    return controller.get_top_selling_products(start_date, end_date, limit, current_user)

@router.get("/products/conversion-rate", response_model=List[ProductConversionRate])
def get_product_conversion_rate(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get product conversion rates (view → cart → purchase)
    """
    return controller.get_product_conversion_rate(start_date, end_date, current_user)

@router.get("/products/low-stock-alerts", response_model=List[LowStockAlert])
def get_low_stock_alerts(
    threshold: int = Query(10, ge=1, description="Stock threshold for alerts"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get low stock alerts for products
    """
    return controller.get_low_stock_alerts(threshold, current_user)

@router.get("/products/rating-distribution", response_model=List[ProductRatingDistribution])
def get_product_rating_distribution(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get product rating distribution
    """
    return controller.get_product_rating_distribution(current_user)

@router.get("/products/all")
def report_all_products(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get complete product list with details
    """
    return controller.report_all_products(current_user)

@router.get("/products/sales-summary", response_model=List[ProductSalesSummary])
def report_product_sales_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get product sales summary (quantity & revenue per product)
    """
    return controller.report_product_sales_summary(start_date, end_date, current_user)

@router.get("/products/reviews", response_model=List[ProductReviewDetail])
def report_product_reviews(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get all product reviews with details
    """
    return controller.report_product_reviews(current_user)

# ===== SALES REPORTS ENDPOINTS =====

@router.get("/sales/total", response_model=SalesReport)
def get_total_sales_report(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get total sales report with revenue, orders, discounts, etc.
    """
    return controller.get_total_sales_report(start_date, end_date, current_user)

@router.get("/sales/by-category", response_model=List[SalesByCategory])
def get_sales_by_category(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get sales breakdown by category
    """
    return controller.get_sales_by_category(start_date, end_date, current_user)

@router.get("/sales/by-brand", response_model=List[SalesByBrand])
def get_sales_by_brand(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get sales breakdown by brand
    """
    return controller.get_sales_by_brand(start_date, end_date, current_user)

@router.get("/sales/daily-trend", response_model=List[DailySalesTrend])
def get_daily_sales_trend(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get daily sales trend for the specified period
    """
    return controller.get_daily_sales_trend(start_date, end_date, current_user)

@router.get("/orders/all", response_model=List[OrderDetail])
def report_all_orders(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get all orders with complete details
    """
    return controller.report_all_orders(start_date, end_date, current_user)

@router.get("/orders/status-summary", response_model=List[OrderStatusSummary])
def get_order_status_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get order status summary (counts by status)
    """
    return controller.get_order_status_summary(start_date, end_date, current_user)

@router.get("/orders/returns-summary", response_model=ReturnSummary)
def get_returns_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get returns summary with reasons and amounts
    """
    return controller.get_returns_summary(start_date, end_date, current_user)

@router.get("/orders/refund-summary", response_model=RefundSummary)
def get_refund_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get refund summary (processed and pending)
    """
    return controller.get_refund_summary(start_date, end_date, current_user)

@router.get("/orders/items-detail", response_model=List[OrderItemDetail])
def report_order_items_detail(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get detailed order items information
    """
    return controller.report_order_items_detail(start_date, end_date, current_user)

# ===== CUSTOMER REPORTS ENDPOINTS =====

@router.get("/customers/active-count")
def get_active_user_count(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get count of active users
    """
    count = controller.get_active_user_count(start_date, end_date, current_user)
    return {"active_users": count}

@router.get("/customers/new-vs-returning")
def get_new_vs_returning_users(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get new vs returning users report
    """
    return controller.get_new_vs_returning_users(start_date, end_date, current_user)

@router.get("/customers/engagement", response_model=List[CustomerEngagement])
def get_user_engagement_report(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get user engagement report (carts, wishlists, orders per user)
    """
    return controller.get_user_engagement_report(start_date, end_date, current_user)

@router.get("/customers/feedback-summary", response_model=CustomerFeedbackSummary)
def get_customer_feedback_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get customer feedback summary (complaints, suggestions, ratings)
    """
    return controller.get_customer_feedback_summary(start_date, end_date, current_user)

@router.get("/customers/all", response_model=List[CustomerDetail])
def report_all_customers(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get complete customer list with details
    """
    return controller.report_all_customers(current_user)

@router.get("/customers/orders")
def report_customer_orders(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get customer orders report (orders per customer with spending)
    """
    return controller.report_customer_orders(start_date, end_date, current_user)

# ===== DELIVERY REPORTS ENDPOINTS =====

@router.get("/delivery/performance", response_model=DeliveryPerformance)
def get_delivery_performance_report(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get delivery performance report
    """
    return controller.get_delivery_performance_report(start_date, end_date, current_user)

@router.get("/delivery/person-ranking", response_model=List[DeliveryPersonRanking])
def get_delivery_person_ranking(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get delivery person performance ranking
    """
    return controller.get_delivery_person_ranking(start_date, end_date, current_user)

@router.get("/delivery/issue-summary", response_model=DeliveryIssueSummary)
def get_delivery_issue_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get delivery issue summary
    """
    return controller.get_delivery_issue_summary(start_date, end_date, current_user)

@router.get("/delivery/all-persons", response_model=List[DeliveryPersonDetail])
def report_all_delivery_persons(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get all delivery persons with details
    """
    return controller.report_all_delivery_persons(current_user)

@router.get("/delivery/ratings", response_model=List[DeliveryRatingDetail])
def report_delivery_ratings(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get delivery ratings from customers
    """
    return controller.report_delivery_ratings(start_date, end_date, current_user)

# ===== INVENTORY REPORTS ENDPOINTS =====

@router.get("/inventory/status", response_model=List[InventoryStatus])
def get_inventory_status(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get inventory status with stock levels
    """
    return controller.get_inventory_status(current_user)

@router.get("/inventory/stock-movement", response_model=List[StockMovement])
def get_stock_movement(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get stock movement report for the period
    """
    return controller.get_stock_movement(start_date, end_date, current_user)

@router.get("/inventory/purchase-summary", response_model=List[PurchaseSummary])
def get_purchase_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get purchase summary from suppliers
    """
    return controller.get_purchase_summary(start_date, end_date, current_user)

@router.get("/inventory/supplier-performance", response_model=List[SupplierPerformance])
def get_supplier_performance(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get supplier performance report
    """
    return controller.get_supplier_performance(start_date, end_date, current_user)

# ===== MARKETING REPORTS ENDPOINTS =====

@router.get("/marketing/coupon-usage", response_model=List[CouponUsage])
def get_coupon_usage_report(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get coupon usage report
    """
    return controller.get_coupon_usage_report(start_date, end_date, current_user)

@router.get("/marketing/offer-performance", response_model=List[OfferPerformance])
def get_offer_performance_report(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get offer performance report
    """
    return controller.get_offer_performance_report(start_date, end_date, current_user)

@router.get("/marketing/promotional-summary", response_model=PromotionalSummary)
def report_promotional_summary(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get promotional summary (coupons + offers)
    """
    return controller.report_promotional_summary(start_date, end_date, current_user)

# ===== ADMIN REPORTS ENDPOINTS =====

@router.get("/admin/activity", response_model=List[AdminActivity])
def report_admin_activity(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get admin activity log report
    """
    return controller.report_admin_activity(start_date, end_date, current_user)

@router.get("/admin/notifications", response_model=List[NotificationReport])
def report_notifications_sent(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get notifications sent report
    """
    return controller.report_notifications_sent(start_date, end_date, current_user)

# ===== GENERAL REPORT ENDPOINTS =====

@router.post("/generate", response_model=ReportResponse)
def generate_report(
    report_type: ReportType,
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    filters: Optional[str] = Query(None, description="JSON filters as string"),
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Generate comprehensive report based on type and filters
    """
    filter_dict = None
    if filters:
        try:
            filter_dict = json.loads(filters)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filters JSON format"
            )
    
    return controller.generate_report(
        report_type, start_date, end_date, filter_dict, current_user
    )

@router.get("/export/{report_type}")
def export_report(
    report_type: ReportType,
    format: ReportFormat = Query(ReportFormat.CSV),
    start_date: date | None = None,
    end_date: date | None = None,
    current_user=Depends(is_admin),
    db=Depends(get_db),
    controller: ReportsController = Depends()
):
    content, media_type = controller.export_report(
        report_type=report_type,
        format=format,
        db=db,
        start_date=start_date,
        end_date=end_date
    )

    if not content:
        raise HTTPException(status_code=404, detail="No data to export")

    filename = f"{report_type.value}_report_{datetime.now().date()}.{format.value}"

    return StreamingResponse(
        iter([content]),
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
# ===== HEALTH CHECK =====

@router.get("/health")
def reports_health_check(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Health check for reports module
    """
    try:
        # Test a simple query
        test_count = controller.get_active_user_count(None, None, current_user)
        return {
            "status": "healthy",
            "message": "Reports module is working correctly",
            "test_query_success": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Reports module health check failed: {str(e)}"
        )

# ===== SUMMARY DASHBOARD =====

@router.get("/summary")
def get_reports_summary(
    current_user: User = Depends(is_admin),
    controller: ReportsController = Depends()
):
    """
    Get summary of all report types and counts
    """
    try:
        # Get counts for different report types
        total_products = len(controller.report_all_products(current_user))
        total_customers = len(controller.report_all_customers(current_user))
        total_orders = len(controller.report_all_orders(None, None, current_user))
        total_delivery_persons = len(controller.report_all_delivery_persons(current_user))
        
        # Get low stock count
        low_stock_items = len(controller.get_low_stock_alerts(10, current_user))
        
        # Get pending returns
        returns_summary = controller.get_returns_summary(None, None, current_user)
        
        # Get recent sales
        today = datetime.now().date()
        week_ago = today - timedelta(days=7)
        weekly_sales = controller.get_total_sales_report(week_ago, today, current_user)
        
        return {
            "summary": {
                "total_products": total_products,
                "total_customers": total_customers,
                "total_orders": total_orders,
                "total_delivery_persons": total_delivery_persons,
                "low_stock_items": low_stock_items,
                "pending_returns": returns_summary.total_returns,
                "weekly_revenue": weekly_sales.total_revenue,
                "weekly_orders": weekly_sales.total_orders
            },
            "available_reports": [
                {"type": "product", "endpoints": 8},
                {"type": "sales", "endpoints": 9},
                {"type": "customer", "endpoints": 6},
                {"type": "delivery", "endpoints": 5},
                {"type": "inventory", "endpoints": 4},
                {"type": "marketing", "endpoints": 3},
                {"type": "admin", "endpoints": 2}
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate reports summary: {str(e)}"
        )