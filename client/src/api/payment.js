import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PAYMENT_BASE_URL = `${API_URL}/payments`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Add this for CORS with credentials
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add CORS headers
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
    config.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
    config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
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

export const paymentAPI = {
  // Initiate payment
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post(`${PAYMENT_BASE_URL}/initiate`, paymentData);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: 'Payment initiated successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to initiate payment' 
      };
    }
  },

  // Verify payment
  verifyPayment: async (verifyData) => {
    try {
      const response = await api.post(`${PAYMENT_BASE_URL}/verify`, verifyData);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Payment verified successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Payment verification failed' 
      };
    }
  },

  // Get payment history
  getPaymentHistory: async (page = 1, perPage = 20) => {
    try {
      const response = await api.get(`${PAYMENT_BASE_URL}/history`, {
        params: { page, per_page: perPage }
      });
      return { 
        success: true, 
        data: response.data.data || response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch payment history' 
      };
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await api.get(`${PAYMENT_BASE_URL}/${paymentId}`);
      return { 
        success: true, 
        data: response.data.data || response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch payment details' 
      };
    }
  },

  // Confirm payment
  confirmPayment: async (paymentId, gatewayData) => {
    try {
      const response = await api.post(`${PAYMENT_BASE_URL}/${paymentId}/confirm`, {
        gateway_data: gatewayData
      });
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Payment confirmed successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to confirm payment' 
      };
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`${PAYMENT_BASE_URL}/${paymentId}/status`);
      return { 
        success: true, 
        data: response.data.data || response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch payment status' 
      };
    }
  },

  // Get available payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get(`${PAYMENT_BASE_URL}/methods`);
      return { 
        success: true, 
        data: response.data.data || response.data 
      };
    } catch (error) {
      // Return mock data if API fails (for development)
      const mockMethods = [
        {
          id: 1,
          method: 'card',
          name: 'Credit/Debit Card',
          icon: 'fa-credit-card',
          description: 'Pay securely with your credit or debit card',
          supported_cards: ['visa', 'mastercard', 'amex']
        },
        {
          id: 2,
          method: 'paypal',
          name: 'PayPal',
          icon: 'fa-paypal',
          description: 'Pay with your PayPal account',
          supported_cards: []
        },
        {
          id: 3,
          method: 'upi',
          name: 'UPI Payment',
          icon: 'fa-mobile-alt',
          description: 'Instant payment using UPI',
          supported_cards: []
        },
        {
          id: 4,
          method: 'netbanking',
          name: 'Net Banking',
          icon: 'fa-university',
          description: 'Pay using your bank account',
          supported_cards: []
        }
      ];
      return { 
        success: true, 
        data: mockMethods,
        isMock: true 
      };
    }
  }
};