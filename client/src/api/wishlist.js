import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const WISHLIST_BASE_URL = `${API_URL}/wishlist`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
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
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const fetchWishlist = async () => {
  try {
    const response = await api.get(`${WISHLIST_BASE_URL}/`);
    return { success: true, data: response.data.data };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to view wishlist", unauthorized: true };
    }
    const message = error.response?.data?.detail || "Failed to load wishlist.";
    return { success: false, message };
  }
};

export const addToWishlist = async (variantId) => {
  try {
    const response = await api.post(`${WISHLIST_BASE_URL}/add`, null, {
      params: { variant_id: variantId },
    });
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to add to wishlist", unauthorized: true };
    }
    const message = error.response?.data?.detail || "Failed to add to wishlist.";
    return { success: false, message };
  }
};

export const removeFromWishlist = async (variantId) => {
  try {
    const response = await api.delete(`${WISHLIST_BASE_URL}/remove/${variantId}`);
    return { success: true, message: response.data.message || "Item removed from wishlist" };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: false, message: "Please log in to remove from wishlist", unauthorized: true };
    }
    
    // Handle 404 as success since the item is no longer in wishlist
    if (error.response?.status === 404) {
      return { success: true, message: "Item removed from wishlist" };
    }
    
    const message = error.response?.data?.detail || "Failed to remove wishlist item.";
    return { success: false, message };
  }
};