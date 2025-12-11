import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const CART_BASE_URL = `${API_URL}/cart`;

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

export const fetchCart = async () => {
  try {
    const response = await api.get(`${CART_BASE_URL}/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to view your cart", unauthorized: true };
    }
    const message = error.response?.data?.detail || "Failed to load cart.";
    return { success: false, message };
  }
};

export const addToCart = async (variantId, quantity = 1) => {
  try {
    const response = await api.post(`${CART_BASE_URL}/add`, null, { 
      params: { variant_id: variantId, quantity } 
    });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to add items to cart", unauthorized: true };
    }
    const message = error.response?.data?.detail || 'Failed to add item to cart.';
    return { success: false, message };
  }
};

export const updateCartItem = async (variantId, quantity) => {
  try {
    const response = await api.put(`${CART_BASE_URL}/update`, null, {
      params: { variant_id: variantId, quantity }
    });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to update cart", unauthorized: true };
    }
    const message = error.response?.data?.detail || 'Failed to update quantity.';
    return { success: false, message };
  }
};

export const removeFromCart = async (variantId) => {
  try {
    const response = await api.delete(`${CART_BASE_URL}/remove/${variantId}`);
    return { success: true, message: response.data.message || "Item removed from cart" };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to remove items", unauthorized: true };
    }
    
    // Handle 404 as success since the item is no longer in cart
    if (error.response?.status === 404) {
      return { success: true, message: "Item removed from cart" };
    }
    
    const message = error.response?.data?.detail || 'Failed to remove item.';
    return { success: false, message };
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete(`${CART_BASE_URL}/clear`);
    const message = response.data?.message || "Cart cleared successfully";
    return { success: true, message };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to clear cart", unauthorized: true };
    }
    const message = error.response?.data?.detail || "Failed to clear cart.";
    return { success: false, message };
  }
};