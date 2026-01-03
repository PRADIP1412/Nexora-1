import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as profileApi from '../api/profile';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const useProfileContext = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfileContext must be used within ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }) => {
    // Auth context
    const { isAuthenticated, logout, user } = useAuth();
    
    // State
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operationLogs, setOperationLogs] = useState([]);

    // Check user roles
    const isAdminUser = !!(user && Array.isArray(user.roles) && user.roles.includes('admin'));
    const isDeliveryUser = !!(user && Array.isArray(user.roles) && user.roles.includes('delivery'));

    // Utility function to add logs
    const addLog = useCallback((message, type = 'info') => {
        const log = {
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        };
        setOperationLogs(prev => [log, ...prev.slice(0, 49)]); // Keep last 50 logs
    }, []);

    // Clear error
    const clearError = useCallback(() => setError(null), []);

    // Clear all data
    const clearAllData = useCallback(() => {
        setProfile(null);
        setStats(null);
        setOperationLogs([]);
        setError(null);
        addLog('All profile data cleared', 'info');
    }, [addLog]);

    // Clear operation logs
    const clearOperationLogs = useCallback(() => {
        setOperationLogs([]);
        addLog('Profile operation logs cleared', 'info');
    }, [addLog]);

    // ===== FETCH PROFILE =====
    const fetchProfile = useCallback(async () => {
        // Skip for admin & delivery users
        if (isAdminUser || isDeliveryUser) {
            addLog('⚠️ Skipping profile fetch for non-customer role', 'warning');
            return { success: false, message: 'Profile not available for admin/delivery users' };
        }

        if (!isAuthenticated) {
            addLog('⚠️ User not authenticated, skipping profile fetch', 'warning');
            return { success: false, message: 'User not authenticated' };
        }

        setLoading(true);
        setError(null);
        addLog('Fetching profile...', 'info');
        
        try {
            const result = await profileApi.fetchProfile();
            if (result.success) {
                const profileData = result.data?.data ?? result.data;
                setProfile(profileData);
                addLog('✅ Profile fetched successfully', 'success');
                return { success: true, data: profileData };
            } else {
                setError(result.message);
                addLog(`❌ Failed to fetch profile: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const status = err.response?.status;
            let errorMsg = 'Failed to fetch profile';

            // Handle 401 error - logout
            if (status === 401) {
                errorMsg = 'Authentication failed';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 404 error - logout as requested
            if (status === 404) {
                errorMsg = 'Profile endpoint not found';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 403 error - skip profile for non-customer roles
            if (status === 403) {
                errorMsg = 'Profile not available for this user role';
                addLog(`⚠️ ${errorMsg}`, 'warning');
                return { success: false, message: errorMsg };
            }

            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Fetch profile error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isAdminUser, isDeliveryUser, logout, addLog]);

    // ===== FETCH STATS =====
    const fetchStats = useCallback(async () => {
        // Skip for admin & delivery users
        if (isAdminUser || isDeliveryUser) {
            addLog('⚠️ Skipping stats fetch for non-customer role', 'warning');
            return { success: false, message: 'Stats not available for admin/delivery users' };
        }

        if (!isAuthenticated) {
            addLog('⚠️ User not authenticated, skipping stats fetch', 'warning');
            return { success: false, message: 'User not authenticated' };
        }

        setLoading(true);
        setError(null);
        addLog('Fetching profile statistics...', 'info');
        
        try {
            const result = await profileApi.fetchProfileStats();
            if (result.success) {
                const statsData = result.data?.data ?? result.data;
                setStats(statsData);
                addLog('✅ Profile statistics fetched successfully', 'success');
                return { success: true, data: statsData };
            } else {
                setError(result.message);
                addLog(`❌ Failed to fetch stats: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const status = err.response?.status;
            let errorMsg = 'Failed to fetch profile statistics';

            // Handle 401 error - logout
            if (status === 401) {
                errorMsg = 'Authentication failed';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 404 error - logout as requested
            if (status === 404) {
                errorMsg = 'Profile stats endpoint not found';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 403 error - skip stats for non-customer roles
            if (status === 403) {
                errorMsg = 'Stats not available for this user role';
                addLog(`⚠️ ${errorMsg}`, 'warning');
                return { success: false, message: errorMsg };
            }

            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Fetch stats error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isAdminUser, isDeliveryUser, logout, addLog]);

    // ===== UPDATE PROFILE =====
    const updateProfile = useCallback(async (profileData) => {
        // Skip for admin & delivery users
        if (isAdminUser || isDeliveryUser) {
            addLog('⚠️ Profile update not available for non-customer role', 'warning');
            return { success: false, message: 'Profile update not available for admin/delivery users' };
        }

        if (!isAuthenticated) {
            addLog('⚠️ User not authenticated, cannot update profile', 'warning');
            return { success: false, message: 'User not authenticated' };
        }

        setLoading(true);
        setError(null);
        addLog('Updating profile...', 'info');
        
        try {
            const result = await profileApi.updateProfile(profileData);
            if (result.success) {
                const updatedProfile = result.data?.data ?? result.data;
                setProfile(updatedProfile);
                addLog('✅ Profile updated successfully', 'success');
                return { 
                    success: true, 
                    data: updatedProfile,
                    message: result.message 
                };
            } else {
                setError(result.message);
                addLog(`❌ Failed to update profile: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const status = err.response?.status;
            let errorMsg = 'Failed to update profile';

            // Handle 401 error - logout
            if (status === 401) {
                errorMsg = 'Authentication failed';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 404 error - logout as requested
            if (status === 404) {
                errorMsg = 'Update profile endpoint not found';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 403 error
            if (status === 403) {
                errorMsg = 'Profile update not permitted for this user role';
                addLog(`❌ ${errorMsg}`, 'error');
                return { success: false, message: errorMsg };
            }

            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Update profile error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isAdminUser, isDeliveryUser, logout, addLog]);

    // ===== CHANGE PASSWORD =====
    const changePassword = useCallback(async (passwordData) => {
        if (!isAuthenticated) {
            addLog('⚠️ User not authenticated, cannot change password', 'warning');
            return { success: false, message: 'User not authenticated' };
        }

        setLoading(true);
        setError(null);
        addLog('Changing password...', 'info');
        
        try {
            const result = await profileApi.changePassword(passwordData);
            if (result.success) {
                addLog('✅ Password changed successfully', 'success');
                return { 
                    success: true, 
                    data: result.data,
                    message: result.message 
                };
            } else {
                setError(result.message);
                addLog(`❌ Failed to change password: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const status = err.response?.status;
            let errorMsg = 'Failed to change password';

            // Handle 401 error - logout
            if (status === 401) {
                errorMsg = 'Authentication failed';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            // Handle 404 error - logout as requested
            if (status === 404) {
                errorMsg = 'Change password endpoint not found';
                addLog(`❌ ${errorMsg}, logging out...`, 'error');
                logout();
                return { success: false, message: errorMsg };
            }

            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Change password error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, logout, addLog]);

    // ===== AUTO-FETCH PROFILE AND STATS =====
    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
            fetchStats();
        } else {
            // Clear profile data when user logs out
            setProfile(null);
            setStats(null);
            setOperationLogs([]);
            setError(null);
            addLog('User logged out, profile data cleared', 'info');
        }
    }, [isAuthenticated, fetchProfile, fetchStats, addLog]);

    const value = {
        // State
        profile,
        stats,
        loading,
        error,
        operationLogs,
        
        // Profile Functions
        fetchProfile,
        fetchStats,
        updateProfile,
        changePassword,
        
        // Utility Functions
        clearError,
        clearAllData,
        clearOperationLogs,
        addLog,
        
        // User role info
        isAdminUser,
        isDeliveryUser
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};