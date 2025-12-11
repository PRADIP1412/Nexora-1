// src/context/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../api/profile';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    const { isAuthenticated, logout, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isAdminUser = !!(user && Array.isArray(user.roles) && user.roles.includes('admin'));

    const fetchProfile = async () => {
        // Skip customer profile fetch for admin
        if (isAdminUser) {
            console.log('Profile: Skipping profile fetch for admin user');
            return;
        }

        if (!isAuthenticated) {
            console.log('Profile: Skipping profile fetch - not authenticated');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('Profile: Fetching profile data');
            const response = await profileAPI.getProfile();
            const data = response.data || response;
            const payload = data?.data ?? data;

            if (data?.success === true || payload) {
                setProfile(payload);
                console.log('Profile: Profile data loaded', payload);
            }
        } catch (err) {
            const status = err.response?.status;
            const errorMsg = err.response?.data?.detail || 'Failed to fetch profile';
            setError(errorMsg);
            console.error('Profile: Error fetching profile:', err);

            // If it's an auth error, trigger logout for customers only
            if (!isAdminUser && (status === 401 || status === 403)) {
                console.log('Profile: Auth error detected for customer, logging out');
                logout();
            } else {
                console.warn('Profile: Fetch failed but not logging out (role or non-auth error).');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        // Skip stats fetch for admin users
        if (isAdminUser) {
            console.log('Profile: Skipping stats fetch for admin user');
            return;
        }

        if (!isAuthenticated) {
            console.log('Profile: Skipping stats fetch - not authenticated');
            return;
        }

        try {
            console.log('Profile: Fetching stats data');
            const response = await profileAPI.getStats();
            const data = response.data || response;
            const payload = data?.data ?? data;

            if (data?.success === true || payload) {
                setStats(payload);
                console.log('Profile: Stats data loaded', payload);
            }
        } catch (err) {
            const status = err.response?.status;
            console.error('Profile: Error fetching stats:', err);

            // For customer only: logout on auth errors
            if (!isAdminUser && (status === 401 || status === 403)) {
                console.log('Profile: Auth error detected in stats for customer, logging out');
                logout();
            } else {
                console.warn('Profile: Stats fetch failed but not logging out (role or non-auth error).');
            }
        }
    };

    const updateProfile = async (profileData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Profile: Updating profile data', profileData);
            const response = await profileAPI.updateProfile(profileData);
            const data = response.data || response;
            const payload = data?.data ?? data;

            if (data?.success === true || payload) {
                setProfile(payload);
                console.log('Profile: Profile updated successfully', payload);
            }
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to update profile';
            setError(errorMsg);
            console.error('Profile: Error updating profile:', err);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Profile: Changing password');
            const response = await profileAPI.changePassword(passwordData);
            console.log('Profile: Password changed successfully');
            return response;
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to change password';
            setError(errorMsg);
            console.error('Profile: Error changing password:', err);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Fetch profile and stats when user authenticates
    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
            fetchStats();
        } else {
            // Clear profile data when user logs out
            setProfile(null);
            setStats(null);
        }
    }, [isAuthenticated]);

    const value = {
        profile,
        stats,
        loading,
        error,
        fetchProfile,
        fetchStats,
        updateProfile,
        changePassword
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
