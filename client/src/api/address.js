import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const ADDRESS_BASE_URL = `${API_URL}/address`;

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

export const addressAPI = {
  // Get all states
  getStates: async () => {
    try {
      const response = await api.get(`${ADDRESS_BASE_URL}/states`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch states' 
      };
    }
  },

  // Get cities by state
  getCitiesByState: async (stateId) => {
    try {
      const response = await api.get(`${ADDRESS_BASE_URL}/cities/${stateId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch cities' 
      };
    }
  },

  // Get areas by city
  getAreasByCity: async (cityId) => {
    try {
      const response = await api.get(`${ADDRESS_BASE_URL}/areas/${cityId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch areas' 
      };
    }
  },

  // Get user addresses
  getUserAddresses: async () => {
    try {
      const response = await api.get(`${ADDRESS_BASE_URL}/`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch addresses' 
      };
    }
  },

  // Get address by ID
  getAddressById: async (addressId) => {
    try {
      const response = await api.get(`${ADDRESS_BASE_URL}/${addressId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch address' 
      };
    }
  },

  // Create address
  createAddress: async (addressData) => {
    try {
      const response = await api.post(`${ADDRESS_BASE_URL}/`, addressData);
      return { 
        success: true, 
        data: response.data.data,
        message: 'Address created successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create address' 
      };
    }
  },

  // Update address
  updateAddress: async (addressId, updateData) => {
    try {
      const response = await api.put(`${ADDRESS_BASE_URL}/${addressId}`, updateData);
      return { 
        success: true, 
        data: response.data.data,
        message: 'Address updated successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update address' 
      };
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`${ADDRESS_BASE_URL}/${addressId}`);
      return { 
        success: true, 
        message: response.data.message || 'Address deleted successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete address' 
      };
    }
  },

  // Set default address
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.patch(`${ADDRESS_BASE_URL}/${addressId}/default`);
      return { 
        success: true, 
        data: response.data.data,
        message: 'Default address set successfully'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to set default address' 
      };
    }
  }
};