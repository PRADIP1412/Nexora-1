import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const OFFER_BASE_URL = `${API_URL}/marketing/offers`;

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
export const getActiveOffers = async () => {
  try {
    const response = await api.get(`${OFFER_BASE_URL}/active`);
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to load active offers.";
    return { success: false, message };
  }
};

// Admin endpoints
export const getAllOffers = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(OFFER_BASE_URL, {
      params: { skip, limit }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to load offers.";
    return { success: false, message };
  }
};

export const getOfferById = async (offerId) => {
  try {
    const response = await api.get(`${OFFER_BASE_URL}/${offerId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to load offer.";
    return { success: false, message };
  }
};

export const createOffer = async (offerData) => {
  try {
    const response = await api.post(OFFER_BASE_URL, offerData);
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to create offer.";
    return { success: false, message };
  }
};

export const updateOffer = async (offerId, offerData) => {
  try {
    const response = await api.patch(`${OFFER_BASE_URL}/${offerId}`, offerData);
    return { success: true, data: response.data.data, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to update offer.";
    return { success: false, message };
  }
};

export const updateOfferStatus = async (offerId, isActive) => {
  try {
    const response = await api.patch(`${OFFER_BASE_URL}/${offerId}/status`, {
      is_active: isActive
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to update offer status.";
    return { success: false, message };
  }
};

export const deleteOffer = async (offerId) => {
  try {
    const response = await api.delete(`${OFFER_BASE_URL}/${offerId}`);
    return { success: true, message: response.data.message };
  } catch (error) {
    const message = error.response?.data?.detail || "Failed to delete offer.";
    return { success: false, message };
  }
};