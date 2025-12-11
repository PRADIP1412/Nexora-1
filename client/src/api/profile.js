import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with auth
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
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

export const profileAPI = {
    // Get current user profile - NEW ENDPOINT
    getProfile: async () => {
        try {
            const response = await api.get('/profile/me');
            return response.data;
        } catch (error) {
            console.error('Profile API Error:', error);
            throw error;
        }
    },

    // Update current user profile - NEW ENDPOINT
    updateProfile: async (profileData) => {
        try {
            // Backend expects: first_name, last_name, phone, gender, dob, profile_img_url
            const backendData = {
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                phone: profileData.phone,
                gender: profileData.gender,
                dob: profileData.dob,
                profile_img_url: profileData.profile_img_url
            };
            
            // Remove undefined/null values
            Object.keys(backendData).forEach(key => {
                if (backendData[key] === undefined || backendData[key] === null || backendData[key] === '') {
                    delete backendData[key];
                }
            });
            
            const response = await api.put('/profile/me', backendData);
            return response.data;
        } catch (error) {
            console.error('Update Profile API Error:', error);
            throw error;
        }
    },

    // Change password - NEW ENDPOINT
    changePassword: async (passwordData) => {
        try {
            const backendData = {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
                confirm_password: passwordData.confirmPassword
            };
            
            const response = await api.post('/profile/change-password', backendData);
            return response.data;
        } catch (error) {
            console.error('Change Password API Error:', error);
            throw error;
        }
    },

    // Get user statistics - NEW ENDPOINT
    getStats: async () => {
        try {
            const response = await api.get('/profile/stats');
            return response.data;
        } catch (error) {
            console.error('Stats API Error:', error);
            throw error;
        }
    }
};