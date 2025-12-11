import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with credentials
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for sending cookies/tokens
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear stored tokens and redirect to login
            localStorage.removeItem('access_token');
            sessionStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const accountAPI = {
    getDashboard: async () => {
        try {
            const response = await api.get('/account/dashboard');
            return response.data;
        } catch (error) {
            console.error('Account Dashboard API Error:', error);
            throw error;
        }
    },
    
    // Alternative method for testing without auth
    getDashboardTest: async () => {
        try {
            const response = await api.get('/account/dashboard');
            return response.data;
        } catch (error) {
            console.error('Account Dashboard API Error:', error);
            throw error;
        }
    }
};