import api from './api';

const REPORTS_BASE_URL = `/admin/reports`;

/* -----------------------------
   ✅ REPORTS API FUNCTIONS
------------------------------ */

// Helper function to clean params
const cleanParams = (params) => {
  const cleaned = {};
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      cleaned[key] = params[key];
    }
  }
  return cleaned;
};

// ===== PRODUCT REPORTS =====

// Get product performance report
export const getProductPerformance = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/products/performance`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Product performance report fetched successfully"
    };
  } catch (error) {
    console.error("Product Performance Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch product performance report",
      data: []
    };
  }
};

// Get top selling products
export const getTopSellingProducts = async (startDate = null, endDate = null, limit = 10) => {
  try {
    const params = { limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/products/top-selling`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Top selling products report fetched successfully"
    };
  } catch (error) {
    console.error("Top Selling Products Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch top selling products report",
      data: []
    };
  }
};

// Get product conversion rate
export const getProductConversionRate = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/products/conversion-rate`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Product conversion rate report fetched successfully"
    };
  } catch (error) {
    console.error("Product Conversion Rate Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch product conversion rate report",
      data: []
    };
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (threshold = 10) => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/products/low-stock-alerts`, {
      params: cleanParams({ threshold })
    });
    return { 
      success: true, 
      data: response.data,
      message: "Low stock alerts fetched successfully"
    };
  } catch (error) {
    console.error("Low Stock Alerts Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch low stock alerts",
      data: []
    };
  }
};

// Get product rating distribution
export const getProductRatingDistribution = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/products/rating-distribution`);
    return { 
      success: true, 
      data: response.data,
      message: "Product rating distribution fetched successfully"
    };
  } catch (error) {
    console.error("Product Rating Distribution Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch product rating distribution",
      data: []
    };
  }
};

// Get all products report
export const getAllProductsReport = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/products/all`);
    return { 
      success: true, 
      data: response.data,
      message: "All products report fetched successfully"
    };
  } catch (error) {
    console.error("All Products Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch all products report",
      data: []
    };
  }
};

// Get product sales summary
export const getProductSalesSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/products/sales-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Product sales summary fetched successfully"
    };
  } catch (error) {
    console.error("Product Sales Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch product sales summary",
      data: []
    };
  }
};

// Get product reviews report
export const getProductReviewsReport = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/products/reviews`);
    return { 
      success: true, 
      data: response.data,
      message: "Product reviews report fetched successfully"
    };
  } catch (error) {
    console.error("Product Reviews Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch product reviews report",
      data: []
    };
  }
};

// ===== SALES REPORTS =====

// Get total sales report
export const getTotalSalesReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/sales/total`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Total sales report fetched successfully"
    };
  } catch (error) {
    console.error("Total Sales Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch total sales report",
      data: null
    };
  }
};

// Get sales by category
export const getSalesByCategory = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/sales/by-category`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Sales by category report fetched successfully"
    };
  } catch (error) {
    console.error("Sales By Category Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch sales by category report",
      data: []
    };
  }
};

// Get sales by brand
export const getSalesByBrand = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/sales/by-brand`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Sales by brand report fetched successfully"
    };
  } catch (error) {
    console.error("Sales By Brand Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch sales by brand report",
      data: []
    };
  }
};

// Get daily sales trend
export const getDailySalesTrend = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      return { 
        success: false, 
        message: "Start date and end date are required",
        data: []
      };
    }
    
    const response = await api.get(`${REPORTS_BASE_URL}/sales/daily-trend`, {
      params: cleanParams({ start_date: startDate, end_date: endDate })
    });
    return { 
      success: true, 
      data: response.data,
      message: "Daily sales trend fetched successfully"
    };
  } catch (error) {
    console.error("Daily Sales Trend Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch daily sales trend",
      data: []
    };
  }
};

// Get all orders report
export const getAllOrdersReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/orders/all`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "All orders report fetched successfully"
    };
  } catch (error) {
    console.error("All Orders Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch all orders report",
      data: []
    };
  }
};

// Get order status summary
export const getOrderStatusSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/orders/status-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Order status summary fetched successfully"
    };
  } catch (error) {
    console.error("Order Status Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch order status summary",
      data: []
    };
  }
};

// Get returns summary
export const getReturnsSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/orders/returns-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Returns summary fetched successfully"
    };
  } catch (error) {
    console.error("Returns Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch returns summary",
      data: null
    };
  }
};

// Get refund summary
export const getRefundSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/orders/refund-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Refund summary fetched successfully"
    };
  } catch (error) {
    console.error("Refund Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch refund summary",
      data: null
    };
  }
};

// Get order items detail
export const getOrderItemsDetail = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/orders/items-detail`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Order items detail fetched successfully"
    };
  } catch (error) {
    console.error("Order Items Detail Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch order items detail",
      data: []
    };
  }
};

// ===== CUSTOMER REPORTS =====

// Get active user count
export const getActiveUserCount = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/customers/active-count`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Active user count fetched successfully"
    };
  } catch (error) {
    console.error("Active User Count Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch active user count",
      data: { active_users: 0 }
    };
  }
};

// Get new vs returning users
export const getNewVsReturningUsers = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      return { 
        success: false, 
        message: "Start date and end date are required",
        data: null
      };
    }
    
    const response = await api.get(`${REPORTS_BASE_URL}/customers/new-vs-returning`, {
      params: cleanParams({ start_date: startDate, end_date: endDate })
    });
    return { 
      success: true, 
      data: response.data,
      message: "New vs returning users report fetched successfully"
    };
  } catch (error) {
    console.error("New Vs Returning Users Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch new vs returning users report",
      data: null
    };
  }
};

// Get user engagement report
export const getUserEngagementReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/customers/engagement`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "User engagement report fetched successfully"
    };
  } catch (error) {
    console.error("User Engagement Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch user engagement report",
      data: []
    };
  }
};

// Get customer feedback summary
export const getCustomerFeedbackSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/customers/feedback-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Customer feedback summary fetched successfully"
    };
  } catch (error) {
    console.error("Customer Feedback Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch customer feedback summary",
      data: null
    };
  }
};

// Get all customers report
export const getAllCustomersReport = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/customers/all`);
    return { 
      success: true, 
      data: response.data,
      message: "All customers report fetched successfully"
    };
  } catch (error) {
    console.error("All Customers Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch all customers report",
      data: []
    };
  }
};

// Get customer orders report
export const getCustomerOrdersReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/customers/orders`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Customer orders report fetched successfully"
    };
  } catch (error) {
    console.error("Customer Orders Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch customer orders report",
      data: []
    };
  }
};

// ===== DELIVERY REPORTS =====

// Get delivery performance report
export const getDeliveryPerformanceReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/delivery/performance`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Delivery performance report fetched successfully"
    };
  } catch (error) {
    console.error("Delivery Performance Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch delivery performance report",
      data: null
    };
  }
};

// Get delivery person ranking
export const getDeliveryPersonRanking = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/delivery/person-ranking`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Delivery person ranking fetched successfully"
    };
  } catch (error) {
    console.error("Delivery Person Ranking Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch delivery person ranking",
      data: []
    };
  }
};

// Get delivery issue summary
export const getDeliveryIssueSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/delivery/issue-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Delivery issue summary fetched successfully"
    };
  } catch (error) {
    console.error("Delivery Issue Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch delivery issue summary",
      data: null
    };
  }
};

// Get all delivery persons report
export const getAllDeliveryPersonsReport = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/delivery/all-persons`);
    return { 
      success: true, 
      data: response.data,
      message: "All delivery persons report fetched successfully"
    };
  } catch (error) {
    console.error("All Delivery Persons Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch all delivery persons report",
      data: []
    };
  }
};

// Get delivery ratings report
export const getDeliveryRatingsReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/delivery/ratings`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Delivery ratings report fetched successfully"
    };
  } catch (error) {
    console.error("Delivery Ratings Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch delivery ratings report",
      data: []
    };
  }
};

// ===== INVENTORY REPORTS =====

// Get inventory status
export const getInventoryStatus = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/inventory/status`);
    return { 
      success: true, 
      data: response.data,
      message: "Inventory status fetched successfully"
    };
  } catch (error) {
    console.error("Inventory Status Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch inventory status",
      data: []
    };
  }
};

// Get stock movement report
export const getStockMovementReport = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      return { 
        success: false, 
        message: "Start date and end date are required",
        data: []
      };
    }
    
    const response = await api.get(`${REPORTS_BASE_URL}/inventory/stock-movement`, {
      params: cleanParams({ start_date: startDate, end_date: endDate })
    });
    return { 
      success: true, 
      data: response.data,
      message: "Stock movement report fetched successfully"
    };
  } catch (error) {
    console.error("Stock Movement Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch stock movement report",
      data: []
    };
  }
};

// Get purchase summary
export const getPurchaseSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/inventory/purchase-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Purchase summary fetched successfully"
    };
  } catch (error) {
    console.error("Purchase Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch purchase summary",
      data: []
    };
  }
};

// Get supplier performance report
export const getSupplierPerformanceReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/inventory/supplier-performance`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Supplier performance report fetched successfully"
    };
  } catch (error) {
    console.error("Supplier Performance Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch supplier performance report",
      data: []
    };
  }
};

// ===== MARKETING REPORTS =====

// Get coupon usage report
export const getCouponUsageReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/marketing/coupon-usage`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Coupon usage report fetched successfully"
    };
  } catch (error) {
    console.error("Coupon Usage Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch coupon usage report",
      data: []
    };
  }
};

// Get offer performance report
export const getOfferPerformanceReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/marketing/offer-performance`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Offer performance report fetched successfully"
    };
  } catch (error) {
    console.error("Offer Performance Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch offer performance report",
      data: []
    };
  }
};

// Get promotional summary
export const getPromotionalSummary = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/marketing/promotional-summary`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Promotional summary fetched successfully"
    };
  } catch (error) {
    console.error("Promotional Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch promotional summary",
      data: null
    };
  }
};

// ===== ADMIN REPORTS =====

// Get admin activity report
export const getAdminActivityReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/admin/activity`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Admin activity report fetched successfully"
    };
  } catch (error) {
    console.error("Admin Activity Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch admin activity report",
      data: []
    };
  }
};

// Get notifications sent report
export const getNotificationsSentReport = async (startDate = null, endDate = null) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const cleanedParams = cleanParams(params);
    const response = await api.get(`${REPORTS_BASE_URL}/admin/notifications`, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Notifications sent report fetched successfully"
    };
  } catch (error) {
    console.error("Notifications Sent Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch notifications sent report",
      data: []
    };
  }
};

// ===== GENERAL REPORT FUNCTIONS =====

// Generate report with filters
export const generateReport = async (reportType, startDate = null, endDate = null, filters = {}) => {
  try {
    const params = {
      report_type: reportType,
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
      ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) })
    };
    
    const cleanedParams = cleanParams(params);
    const response = await api.post(`${REPORTS_BASE_URL}/generate`, null, { params: cleanedParams });
    return { 
      success: true, 
      data: response.data,
      message: "Report generated successfully"
    };
  } catch (error) {
    console.error("Generate Report Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to generate report",
      data: null
    };
  }
};
// src/api/reports.js
export const exportReport = async (
  reportType,
  format,
  startDate,
  endDate
) => {
  try {
    const params = {
      format,
      _t: Date.now(), // Cache busting
    };
    
    // FIX: Only pass dates if they are strings in YYYY-MM-DD format
    if (startDate && typeof startDate === 'string') {
      params.start_date = startDate;
    } else if (startDate instanceof Date) {
      // Convert Date object to YYYY-MM-DD
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      params.start_date = `${year}-${month}-${day}`;
    } else if (startDate) {
      console.warn('Invalid startDate format:', startDate);
    }
    
    if (endDate && typeof endDate === 'string') {
      params.end_date = endDate;
    } else if (endDate instanceof Date) {
      // Convert Date object to YYYY-MM-DD
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, '0');
      const day = String(endDate.getDate()).padStart(2, '0');
      params.end_date = `${year}-${month}-${day}`;
    } else if (endDate) {
      console.warn('Invalid endDate format:', endDate);
    }
    
    console.log('Export request params (fixed):', { reportType, ...params });
    
    const response = await api.get(
      `/admin/reports/export/${reportType}`,
      {
        params,
        responseType: 'blob',
        timeout: 60000, // 60 seconds for export
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );

    // Check if response is empty
    if (!response.data || response.data.size === 0) {
      throw new Error('No data received from server');
    }

    const contentDisposition = response.headers['content-disposition'];
    let filename = `${reportType}_report.${format}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        filename = match[1].replace(/['"]/g, '');
      }
    }

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream'
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return { success: true, filename };
  } catch (error) {
    console.error('Export Report Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    });
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('No data available for export');
    } else if (error.response?.status === 422) {
      // Handle validation errors from backend
      const errorDetail = error.response?.data?.detail || 'Invalid parameters';
      throw new Error(`Validation error: ${errorDetail}. Please check date format.`);
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized - Please login again');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error(`Network error - Cannot connect to server. Please check if backend is running at ${api.defaults.baseURL}`);
    } else if (error.message.includes('timeout')) {
      throw new Error('Request timeout - Try with a smaller date range');
    } else if (error.message === 'No data received from server') {
      throw new Error('No data to export for the selected criteria');
    } else {
      throw new Error(error.message || 'Export failed');
    }
  }
};  


// Get reports summary
export const getReportsSummary = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/summary`);
    return { 
      success: true, 
      data: response.data,
      message: "Reports summary fetched successfully"
    };
  } catch (error) {
    console.error("Reports Summary Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Failed to fetch reports summary",
      data: null
    };
  }
};

// Health check
export const getReportsHealthCheck = async () => {
  try {
    const response = await api.get(`${REPORTS_BASE_URL}/health`);
    return { 
      success: true, 
      data: response.data,
      message: "Reports module is healthy"
    };
  } catch (error) {
    console.error("Reports Health Check Error:", error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.detail || error.response?.data?.message || "Reports module health check failed",
      data: null
    };
  }
};