import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const COUPON_BASE_URL = `${API_URL}/marketing/coupons`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Public endpoints
export const getActiveCoupons = async () => {
  try {
    const response = await api.get(`${COUPON_BASE_URL}/active`);
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to load active coupons.";
    return { success: false, message };
  }
};

export const validateCoupon = async (couponCode, variantIds, orderTotal) => {
  try {
    const response = await api.post(`${COUPON_BASE_URL}/validate`, {
      coupon_code: couponCode,
      variant_ids: variantIds,
      order_total: parseFloat(orderTotal)
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Coupon validation failed.";
    return { success: false, message };
  }
};

// Admin endpoints
export const getAllCoupons = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(COUPON_BASE_URL, {
      params: { skip, limit }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to load coupons.";
    return { success: false, message };
  }
};

export const getCouponById = async (couponId) => {
  try {
    const response = await api.get(`${COUPON_BASE_URL}/${couponId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to load coupon.";
    return { success: false, message };
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await api.post(COUPON_BASE_URL, couponData);
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to create coupon.";
    return { success: false, message };
  }
};

export const updateCoupon = async (couponId, couponData) => {
  try {
    const response = await api.patch(`${COUPON_BASE_URL}/${couponId}`, couponData);
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to update coupon.";
    return { success: false, message };
  }
};

export const updateCouponStatus = async (couponId, isActive) => {
  try {
    const response = await api.patch(`${COUPON_BASE_URL}/${couponId}/status`, {
      is_active: isActive
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to update coupon status.";
    return { success: false, message };
  }
};

export const deleteCoupon = async (couponId) => {
  try {
    const response = await api.delete(`${COUPON_BASE_URL}/${couponId}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to delete coupon.";
    return { success: false, message };
  }
};