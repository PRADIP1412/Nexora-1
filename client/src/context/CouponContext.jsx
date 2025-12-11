import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  getActiveCoupons, 
  validateCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon 
} from '../api/coupon';
import { useAuth } from './AuthContext';

const CouponContext = createContext();

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};

export const CouponProvider = ({ children }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [allCoupons, setAllCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [couponStats, setCouponStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });

  // Load active coupons (public)
  const loadActiveCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getActiveCoupons();
      if (response.success) {
        setActiveCoupons(response.data || []);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Load active coupons error:', error);
      setError('Failed to load active coupons');
      return { success: false, message: 'Failed to load active coupons' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all coupons (admin only)
  const loadAllCoupons = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      const response = await getAllCoupons(skip, limit);
      if (response.success) {
        setAllCoupons(response.data || []);
        setCurrentPage(page);
        
        // Calculate stats
        const now = new Date();
        const stats = {
          total: response.data.length,
          active: response.data.filter(c => 
            c.is_active && 
            new Date(c.start_date) <= now && 
            new Date(c.end_date) >= now
          ).length,
          expired: response.data.filter(c => new Date(c.end_date) < now).length,
          upcoming: response.data.filter(c => new Date(c.start_date) > now).length
        };
        setCouponStats(stats);
        
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Load all coupons error:', error);
      setError('Failed to load coupons');
      return { success: false, message: 'Failed to load coupons' };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Validate coupon
  const validateCouponCode = async (couponCode, variantIds, orderTotal) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await validateCoupon(couponCode, variantIds, orderTotal);
      if (response.success) {
        setValidationResult(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        setValidationResult(null);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Validate coupon error:', error);
      setError('Failed to validate coupon');
      setValidationResult(null);
      return { success: false, message: 'Failed to validate coupon' };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear validation result
  const clearValidation = () => {
    setValidationResult(null);
    setError(null);
  };

  // Get coupon by ID
  const loadCouponById = async (couponId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCouponById(couponId);
      if (response.success) {
        setSelectedCoupon(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Load coupon by ID error:', error);
      setError('Failed to load coupon');
      return { success: false, message: 'Failed to load coupon' };
    } finally {
      setIsLoading(false);
    }
  };

  // Create coupon (admin only)
  const createNewCoupon = async (couponData) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await createCoupon(couponData);
      if (response.success) {
        // Refresh the list
        await loadAllCoupons(currentPage);
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Create coupon error:', error);
      setError('Failed to create coupon');
      return { success: false, message: 'Failed to create coupon' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update coupon (admin only)
  const updateExistingCoupon = async (couponId, couponData) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateCoupon(couponId, couponData);
      if (response.success) {
        // Refresh the list and selected coupon
        await loadAllCoupons(currentPage);
        if (selectedCoupon?.coupon_id === couponId) {
          await loadCouponById(couponId);
        }
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update coupon error:', error);
      setError('Failed to update coupon');
      return { success: false, message: 'Failed to update coupon' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update coupon status (admin only)
  const updateCouponActiveStatus = async (couponId, isActive) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateCouponStatus(couponId, isActive);
      if (response.success) {
        // Refresh the list
        await loadAllCoupons(currentPage);
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update coupon status error:', error);
      setError('Failed to update coupon status');
      return { success: false, message: 'Failed to update coupon status' };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete coupon (admin only)
  const deleteExistingCoupon = async (couponId) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteCoupon(couponId);
      if (response.success) {
        // Refresh the list
        await loadAllCoupons(currentPage);
        setSelectedCoupon(null);
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Delete coupon error:', error);
      setError('Failed to delete coupon');
      return { success: false, message: 'Failed to delete coupon' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get coupon by code
  const getCouponByCode = (code) => {
    return activeCoupons.find(coupon => coupon.code === code) || 
           allCoupons.find(coupon => coupon.code === code);
  };

  // Format discount text
  const formatDiscountText = (coupon) => {
    if (!coupon) return '';
    
    if (coupon.discount_type === 'PERCENT') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `$${coupon.discount_value} OFF`;
    }
  };

  // Check if coupon is applicable to variants
  const isCouponApplicable = (coupon, variantIds) => {
    if (!coupon || !variantIds || variantIds.length === 0) return true;
    
    if (!coupon.variants || coupon.variants.length === 0) return true;
    
    return variantIds.some(variantId => coupon.variants.includes(variantId));
  };

  // Load active coupons on mount
  useEffect(() => {
    loadActiveCoupons();
  }, [loadActiveCoupons]);

  // Load all coupons if admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAllCoupons();
    }
  }, [isAuthenticated, isAdmin, loadAllCoupons]);

  const contextValue = {
    // State
    activeCoupons,
    allCoupons,
    selectedCoupon,
    validationResult,
    isLoading,
    error,
    currentPage,
    totalPages,
    couponStats,
    
    // Actions
    loadActiveCoupons,
    loadAllCoupons,
    validateCouponCode,
    clearValidation,
    loadCouponById,
    createNewCoupon,
    updateExistingCoupon,
    updateCouponActiveStatus,
    deleteExistingCoupon,
    getCouponByCode,
    formatDiscountText,
    isCouponApplicable,
    
    // Getters
    isAdmin: isAdmin,
  };

  return (
    <CouponContext.Provider value={contextValue}>
      {children}
    </CouponContext.Provider>
  );
};