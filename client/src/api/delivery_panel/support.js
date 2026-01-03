// src/api/dp/support.js
import api from '../api';

const DELIVERY_SUPPORT_BASE_URL = `/delivery_panel/support`;

/* -----------------------------
   ✅ DELIVERY SUPPORT API FUNCTIONS
------------------------------ */

// Submit a support issue
export const submitSupportIssue = async (issueData) => {
    try {
        const response = await api.post(`${DELIVERY_SUPPORT_BASE_URL}/issue`, issueData);
        return { 
            success: true, 
            data: response.data,
            message: response.data.message || "Issue submitted successfully"
        };
    } catch (error) {
        console.error("Submit Support Issue Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || error.response?.data?.message || "Failed to submit issue",
            data: null
        };
    }
};

// Get support contact information
export const getSupportContactInfo = async () => {
    try {
        const response = await api.get(`${DELIVERY_SUPPORT_BASE_URL}/contact-info`);
        return { 
            success: true, 
            data: response.data,
            message: "Support contact info fetched successfully"
        };
    } catch (error) {
        console.error("Get Support Contact Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to fetch support contact information",
            data: {
                contact_methods: [
                    {
                        "method": "phone",
                        "label": "Call Support",
                        "description": "Available 24/7",
                        "contact": "1800-123-456",
                        "action_url": "tel:+911800123456"
                    },
                    {
                        "method": "chat",
                        "label": "Chat Support",
                        "description": "Live chat available",
                        "contact": "Start Chat",
                        "action_type": "button"
                    },
                    {
                        "method": "email",
                        "label": "Email Support",
                        "description": "Response within 2 hours",
                        "contact": "support@nexora.com",
                        "action_url": "mailto:support@nexora.com"
                    }
                ],
                "quick_topics": [
                    "How to mark delivery?",
                    "Payment issues",
                    "Route navigation help",
                    "App technical issues"
                ]
            }
        };
    }
};

// Health check for support service
export const checkSupportHealth = async () => {
    try {
        const response = await api.get(`${DELIVERY_SUPPORT_BASE_URL}/health`);
        return { 
            success: true, 
            data: response.data,
            message: "Support service is healthy"
        };
    } catch (error) {
        console.error("Support Health Check Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Support service health check failed",
            data: null
        };
    }
};

// Get recent issues (if endpoint exists - this would be a new endpoint)
export const getRecentIssues = async (limit = 10) => {
    try {
        // Note: This endpoint might not exist in your backend yet
        // You could create it or handle differently
        const response = await api.get(`${DELIVERY_SUPPORT_BASE_URL}/issues/recent?limit=${limit}`);
        return { 
            success: true, 
            data: response.data,
            message: "Recent issues fetched successfully"
        };
    } catch (error) {
        // If endpoint doesn't exist, return empty array
        console.log("Get Recent Issues Error (endpoint might not exist):", error.response?.data || error.message);
        return { 
            success: true, 
            data: { issues: [], total: 0 },
            message: "Using mock data for recent issues"
        };
    }
};