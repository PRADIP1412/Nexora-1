import React, { createContext, useContext, useState, useCallback } from 'react';
import * as reportsApi from '../api/reports';

// Date formatting helper - ONLY date part (YYYY-MM-DD)
const toDateOnly = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  // Get YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Error normalization helper
const normalizeError = (err) => {
  if (err?.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (Array.isArray(detail)) {
      return detail
        .map(e => {
          const loc = e.loc?.slice(1).join('.') || '';
          const msg = e.msg || 'Validation error';
          return loc ? `${loc}: ${msg}` : msg;
        })
        .filter(msg => msg.trim())
        .join('; ');
    }
    if (typeof detail === 'string') {
      return detail;
    }
    if (typeof detail === 'object') {
      return JSON.stringify(detail);
    }
    return 'Validation error occurred';
  }
  
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  
  if (err?.message) {
    return err.message;
  }
  
  return 'An unexpected error occurred';
};

const ReportsContext = createContext();

export const useReportsContext = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReportsContext must be used within ReportsProvider');
  }
  return context;
};

export const ReportsProvider = ({ children }) => {
  // State for different report types
  const [productReports, setProductReports] = useState({
    performance: [],
    topSelling: [],
    conversionRate: [],
    lowStockAlerts: [],
    ratingDistribution: [],
    allProducts: [],
    salesSummary: [],
    reviews: []
  });
  
  const [salesReports, setSalesReports] = useState({
    totalSales: null,
    byCategory: [],
    byBrand: [],
    dailyTrend: [],
    allOrders: [],
    statusSummary: [],
    returnsSummary: null,
    refundSummary: null,
    itemsDetail: []
  });
  
  const [customerReports, setCustomerReports] = useState({
    activeUserCount: { active_users: 0 },
    newVsReturning: null,
    engagement: [],
    feedbackSummary: null,
    allCustomers: [],
    customerOrders: []
  });
  
  const [deliveryReports, setDeliveryReports] = useState({
    performance: null,
    personRanking: [],
    issueSummary: null,
    allPersons: [],
    ratings: []
  });
  
  const [inventoryReports, setInventoryReports] = useState({
    status: [],
    stockMovement: [],
    purchaseSummary: [],
    supplierPerformance: []
  });
  
  const [marketingReports, setMarketingReports] = useState({
    couponUsage: [],
    offerPerformance: [],
    promotionalSummary: null
  });
  
  const [adminReports, setAdminReports] = useState({
    activity: [],
    notifications: []
  });
  
  const [reportsSummary, setReportsSummary] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Clear current report
  const clearCurrentReport = useCallback(() => setCurrentReport(null), []);

  // Clear all reports data
  const clearAllReports = useCallback(() => {
    setProductReports({
      performance: [],
      topSelling: [],
      conversionRate: [],
      lowStockAlerts: [],
      ratingDistribution: [],
      allProducts: [],
      salesSummary: [],
      reviews: []
    });
    setSalesReports({
      totalSales: null,
      byCategory: [],
      byBrand: [],
      dailyTrend: [],
      allOrders: [],
      statusSummary: [],
      returnsSummary: null,
      refundSummary: null,
      itemsDetail: []
    });
    setCustomerReports({
      activeUserCount: { active_users: 0 },
      newVsReturning: null,
      engagement: [],
      feedbackSummary: null,
      allCustomers: [],
      customerOrders: []
    });
    setDeliveryReports({
      performance: null,
      personRanking: [],
      issueSummary: null,
      allPersons: [],
      ratings: []
    });
    setInventoryReports({
      status: [],
      stockMovement: [],
      purchaseSummary: [],
      supplierPerformance: []
    });
    setMarketingReports({
      couponUsage: [],
      offerPerformance: [],
      promotionalSummary: null
    });
    setAdminReports({
      activity: [],
      notifications: []
    });
    setReportsSummary(null);
    setCurrentReport(null);
    setError(null);
  }, []);

  // ===== PRODUCT REPORTS =====

  const getProductPerformance = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getProductPerformance(formattedStartDate, formattedEndDate);
      if (result.success) {
        setProductReports(prev => ({ ...prev, performance: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Product performance error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopSellingProducts = useCallback(async (startDate = null, endDate = null, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getTopSellingProducts(formattedStartDate, formattedEndDate, limit);
      if (result.success) {
        setProductReports(prev => ({ ...prev, topSelling: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Top selling products error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductConversionRate = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getProductConversionRate(formattedStartDate, formattedEndDate);
      if (result.success) {
        setProductReports(prev => ({ ...prev, conversionRate: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Product conversion rate error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getLowStockAlerts = useCallback(async (threshold = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getLowStockAlerts(threshold);
      if (result.success) {
        setProductReports(prev => ({ ...prev, lowStockAlerts: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Low stock alerts error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductRatingDistribution = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getProductRatingDistribution();
      if (result.success) {
        setProductReports(prev => ({ ...prev, ratingDistribution: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Product rating distribution error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllProductsReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getAllProductsReport();
      if (result.success) {
        setProductReports(prev => ({ ...prev, allProducts: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('All products report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductSalesSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getProductSalesSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setProductReports(prev => ({ ...prev, salesSummary: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Product sales summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductReviewsReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getProductReviewsReport();
      if (result.success) {
        setProductReports(prev => ({ ...prev, reviews: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Product reviews report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== SALES REPORTS =====

  const getTotalSalesReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getTotalSalesReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, totalSales: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Total sales report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSalesByCategory = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getSalesByCategory(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, byCategory: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Sales by category error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSalesByBrand = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getSalesByBrand(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, byBrand: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Sales by brand error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDailySalesTrend = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getDailySalesTrend(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, dailyTrend: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Daily sales trend error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllOrdersReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getAllOrdersReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, allOrders: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('All orders report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderStatusSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getOrderStatusSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, statusSummary: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Order status summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getReturnsSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getReturnsSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, returnsSummary: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Returns summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getRefundSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getRefundSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, refundSummary: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Refund summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderItemsDetail = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getOrderItemsDetail(formattedStartDate, formattedEndDate);
      if (result.success) {
        setSalesReports(prev => ({ ...prev, itemsDetail: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Order items detail error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== CUSTOMER REPORTS =====

  const getActiveUserCount = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getActiveUserCount(formattedStartDate, formattedEndDate);
      if (result.success) {
        setCustomerReports(prev => ({ ...prev, activeUserCount: result.data || { active_users: 0 } }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Active user count error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getNewVsReturningUsers = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getNewVsReturningUsers(formattedStartDate, formattedEndDate);
      if (result.success) {
        setCustomerReports(prev => ({ ...prev, newVsReturning: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('New vs returning users error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserEngagementReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getUserEngagementReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setCustomerReports(prev => ({ ...prev, engagement: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('User engagement report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerFeedbackSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getCustomerFeedbackSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setCustomerReports(prev => ({ ...prev, feedbackSummary: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Customer feedback summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCustomersReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getAllCustomersReport();
      if (result.success) {
        setCustomerReports(prev => ({ ...prev, allCustomers: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('All customers report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerOrdersReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getCustomerOrdersReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setCustomerReports(prev => ({ ...prev, customerOrders: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Customer orders report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== DELIVERY REPORTS =====

  const getDeliveryPerformanceReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getDeliveryPerformanceReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setDeliveryReports(prev => ({ ...prev, performance: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Delivery performance report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeliveryPersonRanking = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getDeliveryPersonRanking(formattedStartDate, formattedEndDate);
      if (result.success) {
        setDeliveryReports(prev => ({ ...prev, personRanking: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Delivery person ranking error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeliveryIssueSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getDeliveryIssueSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setDeliveryReports(prev => ({ ...prev, issueSummary: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Delivery issue summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllDeliveryPersonsReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getAllDeliveryPersonsReport();
      if (result.success) {
        setDeliveryReports(prev => ({ ...prev, allPersons: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('All delivery persons report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeliveryRatingsReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getDeliveryRatingsReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setDeliveryReports(prev => ({ ...prev, ratings: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Delivery ratings report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== INVENTORY REPORTS =====

  const getInventoryStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getInventoryStatus();
      if (result.success) {
        setInventoryReports(prev => ({ ...prev, status: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Inventory status error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockMovementReport = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getStockMovementReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setInventoryReports(prev => ({ ...prev, stockMovement: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Stock movement report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPurchaseSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getPurchaseSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setInventoryReports(prev => ({ ...prev, purchaseSummary: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Purchase summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getSupplierPerformanceReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getSupplierPerformanceReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setInventoryReports(prev => ({ ...prev, supplierPerformance: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Supplier performance report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== MARKETING REPORTS =====

  const getCouponUsageReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getCouponUsageReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setMarketingReports(prev => ({ ...prev, couponUsage: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Coupon usage report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getOfferPerformanceReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getOfferPerformanceReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setMarketingReports(prev => ({ ...prev, offerPerformance: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Offer performance report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPromotionalSummary = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getPromotionalSummary(formattedStartDate, formattedEndDate);
      if (result.success) {
        setMarketingReports(prev => ({ ...prev, promotionalSummary: result.data }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Promotional summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== ADMIN REPORTS =====

  const getAdminActivityReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getAdminActivityReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setAdminReports(prev => ({ ...prev, activity: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Admin activity report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotificationsSentReport = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.getNotificationsSentReport(formattedStartDate, formattedEndDate);
      if (result.success) {
        setAdminReports(prev => ({ ...prev, notifications: result.data || [] }));
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Notifications sent report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== GENERAL FUNCTIONS =====

  const generateReport = useCallback(async (reportType, startDate = null, endDate = null, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const formattedStartDate = toDateOnly(startDate);
      const formattedEndDate = toDateOnly(endDate);
      const result = await reportsApi.generateReport(reportType, formattedStartDate, formattedEndDate, filters);
      if (result.success) {
        setCurrentReport(result.data);
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Generate report error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const exportReport = useCallback(
    async (reportType, format = 'csv', startDate = null, endDate = null) => {
      setLoading(true);
      setError(null);

      try {
        console.log('Exporting report from context:', {
          reportType,
          format,
          startDate,
          endDate
        });

        const result = await reportsApi.exportReport(
          reportType,
          format,
          startDate,
          endDate
        );

        // Use console.log instead of toast for now
        console.log('Report exported successfully!');
        
        return { success: true, message: 'Export completed', filename: result.filename };
      } catch (err) {
        console.error('Export report error:', err);
        const errorMsg = err.message || 'Export failed';
        setError(errorMsg);
        
        return { success: false, message: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );


  const getReportsSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getReportsSummary();
      if (result.success) {
        setReportsSummary(result.data);
        return { success: true, data: result.data };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Reports summary error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const getReportsHealthCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getReportsHealthCheck();
      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        const errorMsg = normalizeError({ message: result.message });
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = normalizeError(err);
      setError(errorMsg);
      console.error('Reports health check error:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    productReports,
    salesReports,
    customerReports,
    deliveryReports,
    inventoryReports,
    marketingReports,
    adminReports,
    reportsSummary,
    currentReport,
    loading,
    error,
    
    // Product Reports Actions
    getProductPerformance,
    getTopSellingProducts,
    getProductConversionRate,
    getLowStockAlerts,
    getProductRatingDistribution,
    getAllProductsReport,
    getProductSalesSummary,
    getProductReviewsReport,
    
    // Sales Reports Actions
    getTotalSalesReport,
    getSalesByCategory,
    getSalesByBrand,
    getDailySalesTrend,
    getAllOrdersReport,
    getOrderStatusSummary,
    getReturnsSummary,
    getRefundSummary,
    getOrderItemsDetail,
    
    // Customer Reports Actions
    getActiveUserCount,
    getNewVsReturningUsers,
    getUserEngagementReport,
    getCustomerFeedbackSummary,
    getAllCustomersReport,
    getCustomerOrdersReport,
    
    // Delivery Reports Actions
    getDeliveryPerformanceReport,
    getDeliveryPersonRanking,
    getDeliveryIssueSummary,
    getAllDeliveryPersonsReport,
    getDeliveryRatingsReport,
    
    // Inventory Reports Actions
    getInventoryStatus,
    getStockMovementReport,
    getPurchaseSummary,
    getSupplierPerformanceReport,
    
    // Marketing Reports Actions
    getCouponUsageReport,
    getOfferPerformanceReport,
    getPromotionalSummary,
    
    // Admin Reports Actions
    getAdminActivityReport,
    getNotificationsSentReport,
    
    // General Actions
    generateReport,
    exportReport,
    getReportsSummary,
    getReportsHealthCheck,
    
    // Utility Actions
    clearError,
    clearCurrentReport,
    clearAllReports
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};