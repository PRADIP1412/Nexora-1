// src/context/delivery_panel/SupportContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import * as supportApi from '../../api/delivery_panel/support';

const SupportContext = createContext();

export const useSupportContext = () => {
    const context = useContext(SupportContext);
    if (!context) {
        throw new Error('useSupportContext must be used within SupportProvider');
    }
    return context;
};

export const SupportProvider = ({ children }) => {
    // State
    const [supportContactInfo, setSupportContactInfo] = useState(null);
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operationLogs, setOperationLogs] = useState([]);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

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
    const clearError = useCallback(() => {
        setError(null);
        setSubmissionSuccess(false);
    }, []);

    // Clear all data
    const clearAllData = useCallback(() => {
        setSupportContactInfo(null);
        setRecentIssues([]);
        setOperationLogs([]);
        setError(null);
        setSubmissionSuccess(false);
        addLog('All support data cleared', 'info');
    }, [addLog]);

    // Clear operation logs
    const clearOperationLogs = useCallback(() => {
        setOperationLogs([]);
        addLog('Operation logs cleared', 'info');
    }, [addLog]);

    // ===== SUBMIT SUPPORT ISSUE =====
    const submitIssue = useCallback(async (issueData) => {
        setLoading(true);
        setError(null);
        setSubmissionSuccess(false);
        addLog('Submitting support issue...', 'info');
        
        try {
            // Validate issue data
            if (!issueData.issue_type) {
                throw new Error('Issue type is required');
            }
            if (!issueData.message || issueData.message.length < 10) {
                throw new Error('Message must be at least 10 characters');
            }

            const result = await supportApi.submitSupportIssue(issueData);
            if (result.success) {
                setSubmissionSuccess(true);
                addLog('✅ Issue submitted successfully', 'success');
                
                // Refresh recent issues if needed
                if (recentIssues.length > 0) {
                    const fetchResult = await getRecentIssues();
                    if (fetchResult.success) {
                        setRecentIssues(fetchResult.data.issues || []);
                    }
                }
                
                return { success: true, data: result.data };
            } else {
                setError(result.message);
                addLog(`❌ Failed to submit issue: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to submit issue';
            setError(errorMsg);
            addLog(`❌ ${errorMsg}`, 'error');
            console.error('Submit issue error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [addLog, recentIssues.length]);

    // ===== GET SUPPORT CONTACT INFO =====
    const fetchSupportContactInfo = useCallback(async () => {
        setLoading(true);
        setError(null);
        addLog('Fetching support contact information...', 'test');
        
        try {
            const result = await supportApi.getSupportContactInfo();
            if (result.success) {
                setSupportContactInfo(result.data);
                addLog('✅ Support contact info fetched successfully', 'success');
                return { success: true, data: result.data };
            } else {
                setError(result.message);
                addLog(`❌ Failed to fetch contact info: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const errorMsg = 'Failed to fetch support contact information';
            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Fetch contact info error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [addLog]);

    // ===== GET RECENT ISSUES =====
    const getRecentIssues = useCallback(async (limit = 10) => {
        setLoading(true);
        setError(null);
        addLog(`Fetching recent issues (limit: ${limit})...`, 'test');
        
        try {
            const result = await supportApi.getRecentIssues(limit);
            if (result.success) {
                setRecentIssues(result.data.issues || []);
                addLog(`✅ Recent issues fetched: ${result.data.issues?.length || 0} issues`, 'success');
                return { success: true, data: result.data };
            } else {
                setError(result.message);
                addLog(`❌ Failed to fetch recent issues: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const errorMsg = 'Failed to fetch recent issues';
            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Fetch recent issues error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [addLog]);

    // ===== HEALTH CHECK =====
    const checkSupportServiceHealth = useCallback(async () => {
        setLoading(true);
        setError(null);
        addLog('Checking support service health...', 'test');
        
        try {
            const result = await supportApi.checkSupportHealth();
            if (result.success) {
                addLog('✅ Support service is healthy', 'success');
                return { success: true, data: result.data };
            } else {
                setError(result.message);
                addLog(`❌ Support service health check failed: ${result.message}`, 'error');
                return { success: false, message: result.message };
            }
        } catch (err) {
            const errorMsg = 'Failed to check support service health';
            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Support health check error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [addLog]);

    // ===== BATCH OPERATIONS =====
    const fetchAllSupportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        addLog('Fetching all support data...', 'test');
        
        try {
            const results = await Promise.all([
                fetchSupportContactInfo(),
                getRecentIssues(5)
            ]);
            
            const allSuccess = results.every(result => result.success);
            
            if (allSuccess) {
                addLog('✅ All support data fetched successfully', 'success');
                return { success: true, message: 'All support data fetched successfully' };
            } else {
                const errorMessages = results.filter(r => !r.success).map(r => r.message).join(', ');
                setError(`Some data failed to load: ${errorMessages}`);
                addLog(`⚠️ Some support data failed to load: ${errorMessages}`, 'warning');
                return { success: false, message: errorMessages };
            }
        } catch (err) {
            const errorMsg = 'Failed to fetch all support data';
            setError(errorMsg);
            addLog(`❌ ${errorMsg}: ${err.message}`, 'error');
            console.error('Fetch all support data error:', err);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [fetchSupportContactInfo, getRecentIssues, addLog]);

    // ===== SIMULATE ISSUE TYPES =====
    const simulateIssueTypes = useCallback(() => {
        const issueTypes = [
            { 
                type: 'DELIVERY_ISSUE', 
                message: 'Customer was not available for delivery despite multiple attempts at their address. Need guidance on next steps.',
                order_id: Math.floor(Math.random() * 1000) + 1
            },
            { 
                type: 'PAYMENT_ISSUE', 
                message: 'Payment for delivery #456 was not credited to my account. It shows as completed in app but wallet balance not updated.',
                order_id: Math.floor(Math.random() * 1000) + 1
            },
            { 
                type: 'APP_TECHNICAL_ISSUE', 
                message: 'App crashes when trying to scan QR codes for delivery confirmation. Happens on both Android and iOS versions.',
                order_id: null
            },
            { 
                type: 'VEHICLE_ISSUE', 
                message: 'Vehicle broke down during delivery route. Need assistance with alternative transportation arrangements.',
                order_id: null
            },
            { 
                type: 'OTHER', 
                message: 'Need clarification on the new delivery policy changes that were announced last week.',
                order_id: null
            }
        ];
        
        return issueTypes;
    }, []);

    const value = {
        // State
        supportContactInfo,
        recentIssues,
        loading,
        error,
        operationLogs,
        submissionSuccess,
        
        // Main Functions
        submitIssue,
        fetchSupportContactInfo,
        getRecentIssues,
        checkSupportServiceHealth,
        
        // Batch Operations
        fetchAllSupportData,
        
        // Simulation
        simulateIssueTypes,
        
        // Utility Functions
        clearError,
        clearAllData,
        clearOperationLogs,
        addLog
    };

    return (
        <SupportContext.Provider value={value}>
            {children}
        </SupportContext.Provider>
    );
};