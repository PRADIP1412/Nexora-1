import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const CHECKOUT_BASE_URL = `/checkout`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const checkoutAPI = {
  // Initiate checkout
  initiateCheckout: async (addressId) => {
    try {
      const response = await api.get(`${CHECKOUT_BASE_URL}/initiate/${addressId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to initiate checkout' 
      };
    }
  },

  // Confirm checkout
  confirmCheckout: async (checkoutData) => {
    try {
      const response = await api.post(`${CHECKOUT_BASE_URL}/confirm`, checkoutData);
      return { 
        success: true, 
        data: response.data,
        message: 'Order placed successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to confirm checkout' 
      };
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get(`${API_URL}/payments/methods`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch payment methods' 
      };
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await api.post(`${API_URL}/payments/process`, paymentData);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Payment processed successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to process payment' 
      };
    }
  },

  // Validate checkout
  validateCheckout: async (checkoutData) => {
    try {
      const response = await api.post(`${CHECKOUT_BASE_URL}/validate`, checkoutData);
      return { 
        success: true, 
        data: response.data.data || response.data,
        isValid: response.data.data?.is_valid || response.data.is_valid,
        errors: response.data.data?.errors || response.data.errors || []
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to validate checkout' 
      };
    }
  },

  // Get order summary
  getOrderSummary: async (orderId) => {
    try {
      const response = await api.get(`${CHECKOUT_BASE_URL}/orders/${orderId}/summary`);
      return { 
        success: true, 
        data: response.data.data || response.data
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to fetch order summary' 
      };
    }
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    try {
      const response = await api.post(`${CHECKOUT_BASE_URL}/apply-coupon`, {
        coupon_code: couponCode
      });
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Coupon applied successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to apply coupon' 
      };
    }
  },

  // Remove coupon
  removeCoupon: async () => {
    try {
      const response = await api.delete(`${CHECKOUT_BASE_URL}/remove-coupon`);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Coupon removed successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to remove coupon' 
      };
    }
  },

  // Get shipping methods
  getShippingMethods: async (addressId) => {
    try {
      const response = await api.get(`${CHECKOUT_BASE_URL}/shipping-methods/${addressId}`);
      return { 
        success: true, 
        data: response.data.data || response.data
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to fetch shipping methods' 
      };
    }
  },

  // Update shipping method
  updateShippingMethod: async (shippingMethodId) => {
    try {
      const response = await api.post(`${CHECKOUT_BASE_URL}/update-shipping`, {
        shipping_method_id: shippingMethodId
      });
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Shipping method updated successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to update shipping method' 
      };
    }
  },

  // Get checkout details
  getCheckoutDetails: async () => {
    try {
      const response = await api.get(`${CHECKOUT_BASE_URL}/details`);
      return { 
        success: true, 
        data: response.data.data || response.data
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Failed to fetch checkout details' 
      };
    }
  },

  // Update checkout address
  updateCheckoutAddress: async (addressId) => {
    try {
      const response = await api.post(`${CHECKOUT_BASE_URL}/update-address`, {
        address_id: addressId
      });
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Address updated successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || error.response?.data?.message || 'Failed to update address' 
      };
    }
  }
};