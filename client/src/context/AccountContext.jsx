// src/context/AccountContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { accountAPI } from '../api/account';
import { useAuth } from './AuthContext';

const AccountContext = createContext();

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within a AccountProvider');
    }
    return context;
};

export const AccountProvider = ({ children }) => {
    const { isAuthenticated, serverStatus = 'online', logout, user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isAdminUser = !!(user && Array.isArray(user.roles) && user.roles.includes('admin'));

    const fetchDashboard = async () => {
        // Skip customer account fetch for admin users
        if (isAdminUser) {
            console.log('Account: Skipping account dashboard fetch for admin user');
            return;
        }

        // Only fetch if user is authenticated and server is online
        if (!isAuthenticated || serverStatus !== 'online') {
            console.log('Account: Skipping dashboard fetch - not authenticated or server offline');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('Account: Fetching dashboard data');
            const response = await accountAPI.getDashboard();
            // accountAPI should return { success, message, data } or axios response
            const data = response.data || response;
            const payload = data?.data ?? data;
            setDashboard(payload);
        } catch (err) {
            const status = err.response?.status;
            const errorMsg = err.response?.data?.detail || 'Failed to fetch account dashboard';
            setError(errorMsg);
            console.error('Account: Error fetching dashboard:', err);

            // For customers, if it's an auth error, trigger logout
            if (!isAdminUser && (status === 401 || status === 403)) {
                console.log('Account: Auth error detected for customer, logging out');
                logout();
            } else {
                // For admin or other non-auth issues, do not logout automatically
                console.warn('Account: Fetch failed but not logging out (role or non-auth error).', status);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [isAuthenticated, serverStatus]);

    const value = {
        dashboard,
        loading,
        error,
        refetchDashboard: fetchDashboard
    };

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    );
};
