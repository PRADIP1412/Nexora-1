import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const ORDER_BASE_URL = `${API_URL}/orders`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
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

// Validation function for order data
const validateOrderData = (orderData) => {
  const errors = [];
  
  if (!orderData.address_id) {
    errors.push('Address ID is required');
  }
  
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Order must contain at least one item');
  }
  
  // Validate individual items
  if (orderData.items && Array.isArray(orderData.items)) {
    orderData.items.forEach((item, index) => {
      if (!item.variant_id && !item.id) {
        errors.push(`Item ${index + 1}: variant_id is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: quantity must be a positive number`);
      }
    });
  }
  
  return errors;
};

// Transform order data to match backend expectations
const transformOrderData = (orderData) => {
  // Ensure items have the correct structure - ONLY what backend expects
  const transformedItems = orderData.items.map(item => ({
    variant_id: item.variant_id || item.id,
    quantity: item.quantity || 1,
    price: item.price || item.unit_price || 0
    // REMOVE product_name, variant_name - backend will fetch these
  }));

  // Calculate subtotal if not provided
  const subtotal = orderData.subtotal || transformedItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0);
  
  const delivery_fee = orderData.delivery_fee || 0;
  const tax_amount = orderData.tax_amount || 0;
  const discount_amount = orderData.discount_amount || 0;
  
  // Calculate total
  const total_amount = subtotal + delivery_fee + tax_amount - discount_amount;

  return {
    address_id: orderData.address_id,
    subtotal: parseFloat(subtotal).toFixed(2),
    delivery_fee: parseFloat(delivery_fee).toFixed(2),
    tax_amount: parseFloat(tax_amount).toFixed(2),
    discount_amount: parseFloat(discount_amount).toFixed(2),
    total_amount: parseFloat(total_amount).toFixed(2),
    coupon_code: orderData.coupon_code || null,
    items: transformedItems
    // REMOVE: payment_method, shipping_method, order_notes - not in schema
  };
};

export const orderAPI = {
  // Create order - IMPROVED VERSION
  createOrder: async (orderData) => {
    try {
      console.log('Original order data:', orderData);
      
      // Validate order data
      const validationErrors = validateOrderData(orderData);
      if (validationErrors.length > 0) {
        console.error('Order validation errors:', validationErrors);
        return { 
          success: false, 
          message: `Validation failed: ${validationErrors.join(', ')}`,
          validationErrors 
        };
      }
      
      // Transform order data for backend
      const transformedData = transformOrderData(orderData);
      console.log('Transformed order data for API:', transformedData);
      
      const response = await api.post(`${ORDER_BASE_URL}/`, transformedData);
      
      console.log('Order creation successful:', response.data);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Order created successfully'
      };
      
    } catch (error) {
      console.error('Order creation failed:', error);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create order';
      let validationErrors = [];
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const responseData = error.response.data;
        
        console.error('Error response:', {
          status,
          data: responseData,
          headers: error.response.headers
        });
        
        if (status === 422) {
          // Unprocessable Entity - Validation errors
          errorMessage = 'Please check your order information';
          validationErrors = Object.entries(responseData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
          
          console.error('Validation errors from server:', validationErrors);
        } else if (status === 400) {
          errorMessage = responseData.detail || 'Bad request - please check your data';
        } else if (status === 401) {
          errorMessage = 'Please log in to complete your order';
        } else if (status === 500) {
          errorMessage = 'Server error - please try again later';
        } else {
          errorMessage = responseData.detail || responseData.message || `Error: ${status}`;
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage = 'Network error - please check your connection';
      } else {
        // Other errors
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage,
        validationErrors,
        originalError: error
      };
    }
  },

  // Get user orders
  getUserOrders: async (page = 1, perPage = 20, status = null) => {
    try {
      const params = { page, per_page: perPage };
      if (status) params.status = status;
      
      console.log(`📋 API: Fetching /orders/my with params:`, params);
      
      const response = await api.get(`${ORDER_BASE_URL}/my`, { params });
      
      console.log(`✅ API: Response received:`, response.data);
      
      // Backend returns { success, message, data }
      // where data is already the orders array
      const ordersData = response.data.data || [];
      
      return { 
        success: true, 
        data: ordersData,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('❌ API: Error fetching orders:', error);
      
      // Check if it's a 500 error
      if (error.response?.status === 500) {
        console.error('🔥 API: Server 500 error:', error.response.data);
      }
      
      // Return mock data for development if API fails
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('🔄 API: Returning mock data for development');
        const mockOrders = generateMockOrders();
        return { success: true, data: mockOrders, isMock: true };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch orders' 
      };
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      // Make sure orderId is numeric
      const numericOrderId = parseInt(orderId);
      if (isNaN(numericOrderId)) {
        console.error('Invalid order ID format:', orderId);
        return { 
          success: false, 
          message: 'Invalid order ID format. Must be a number.' 
        };
      }
      
      const response = await api.get(`${ORDER_BASE_URL}/${numericOrderId}`);
      return { 
        success: true, 
        data: response.data.data || response.data 
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      
      // Return mock data for development if API fails
      if (error.response?.status === 404 || error.response?.status === 500) {
        const mockOrder = generateMockOrder(orderId);
        return { success: true, data: mockOrder, isMock: true };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch order details' 
      };
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.patch(`${ORDER_BASE_URL}/${orderId}/cancel`);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Order cancelled successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to cancel order' 
      };
    }
  },

  // Create return request
  createReturnRequest: async (orderId, returnData) => {
    try {
      const response = await api.post(`${ORDER_BASE_URL}/${orderId}/return`, returnData);
      return { 
        success: true, 
        data: response.data.data || response.data,
        message: response.data.message || 'Return request submitted successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.response?.data?.detail || 'Failed to create return request' 
      };
    }
  }
};

// Mock data generators for development
const generateMockOrders = () => {
  return [
    {
      order_id: 'ORD_001',
      placed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      order_status: 'DELIVERED',
      total_amount: 149.97,
      items: [
        {
          variant_id: 1,
          product_name: 'Wireless Headphones',
          quantity: 1,
          price: 99.99,
          variant_name: 'Black'
        },
        {
          variant_id: 2,
          product_name: 'Phone Case',
          quantity: 2,
          price: 24.99,
          variant_name: 'Clear'
        }
      ],
      tracking_number: 'TRK_123456789',
      delivery_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

const generateMockOrder = (orderId) => {
  return {
    order_id: orderId,
    placed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    order_status: 'DELIVERED',
    total_amount: 149.97,
    subtotal: 149.97,
    delivery_fee: 0,
    tax_amount: 12.50,
    items: [
      {
        variant_id: 1,
        product_name: 'Wireless Headphones',
        quantity: 1,
        price: 99.99,
        variant_name: 'Black'
      }
    ],
    address: {
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city_name: 'New York',
      state_name: 'NY',
      pincode: '10001'
    },
    tracking_number: 'TRK_123456789',
    delivery_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    payment_status: 'PAID'
  };
};