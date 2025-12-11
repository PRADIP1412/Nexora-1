import api from './api';

const CATEGORIES_BASE_URL = "/categories";

/* -----------------------------
   ✅ ADMIN CATEGORY FUNCTIONS
------------------------------ */

// Get all categories
export const fetchAllCategories = async () => {
    try {
        console.log("🔍 CATEGORY API: Fetching all categories");
        const response = await api.get(`${CATEGORIES_BASE_URL}/`);
        console.log("🔍 CATEGORY API: Successfully fetched categories:", response.data.data?.length || 0);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 CATEGORY API Fetch Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to fetch categories",
            data: []
        };
    }
};

// Get category by ID
export const fetchCategoryById = async (categoryId) => {
    try {
        console.log(`🔍 CATEGORY API: Fetching category ID: ${categoryId}`);
        const response = await api.get(`${CATEGORIES_BASE_URL}/${categoryId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 CATEGORY API Fetch by ID Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to fetch category"
        };
    }
};

// Get category with subcategories
export const fetchCategoryWithSubcategories = async (categoryId) => {
    try {
        console.log(`🔍 CATEGORY API: Fetching category ${categoryId} with subcategories`);
        const response = await api.get(`${CATEGORIES_BASE_URL}/${categoryId}/subcategories`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 CATEGORY API Fetch with Subs Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to fetch category with subcategories"
        };
    }
};

// Create new category (Admin only)
export const createCategory = async (categoryData) => {
    try {
        console.log("🔍 CATEGORY API: Creating new category:", categoryData);
        const response = await api.post(`${CATEGORIES_BASE_URL}/`, categoryData);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 CATEGORY API Create Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to create category"
        };
    }
};

// Update category (Admin only)
export const updateCategory = async (categoryId, updateData) => {
    try {
        console.log(`🔍 CATEGORY API: Updating category ${categoryId}:`, updateData);
        const response = await api.put(`${CATEGORIES_BASE_URL}/${categoryId}`, updateData);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 CATEGORY API Update Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to update category"
        };
    }
};

// Delete category (Admin only)
export const deleteCategory = async (categoryId) => {
    try {
        console.log(`🔍 CATEGORY API: Deleting category ${categoryId}`);
        const response = await api.delete(`${CATEGORIES_BASE_URL}/${categoryId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 CATEGORY API Delete Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to delete category"
        };
    }
};

/* -----------------------------
   ✅ ADMIN SUBCATEGORY FUNCTIONS
------------------------------ */

// Get all subcategories
export const fetchAllSubcategories = async () => {
    try {
        console.log("🔍 SUBCATEGORY API: Fetching all subcategories");
        const response = await api.get(`${CATEGORIES_BASE_URL}/subcategories`);
        
        if (response.data && response.data.success) {
            return { 
                success: true, 
                data: response.data.data || [],
                message: response.data.message 
            };
        }
        
        return { 
            success: false, 
            message: "Invalid response format",
            data: []
        };
    } catch (error) {
        console.error("🔍 SUBCATEGORY API Fetch All Error:", error.response?.data || error.message);
        
        if (error.response?.data?.detail) {
            const errorDetail = error.response.data.detail;
            let errorMessage = "Validation error";
            
            if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map(err => 
                    `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
                ).join(', ');
            } else if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            }
            
            return { 
                success: false, 
                message: errorMessage,
                data: []
            };
        }
        
        return { 
            success: false, 
            message: error.response?.data?.message || error.message || "Failed to fetch subcategories",
            data: []
        };
    }
};

// Get subcategory by ID
export const fetchSubcategoryById = async (subcategoryId) => {
    try {
        console.log(`🔍 SUBCATEGORY API: Fetching subcategory ID: ${subcategoryId}`);
        const response = await api.get(`${CATEGORIES_BASE_URL}/subcategory/${subcategoryId}`);
        
        if (response.data && response.data.success) {
            return { 
                success: true, 
                data: response.data.data,
                message: response.data.message 
            };
        }
        
        return { 
            success: false, 
            message: "Invalid response format"
        };
    } catch (error) {
        console.error("🔍 SUBCATEGORY API Fetch by ID Error:", error.response?.data || error.message);
        
        if (error.response?.data?.detail) {
            const errorDetail = error.response.data.detail;
            let errorMessage = "Validation error";
            
            if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map(err => 
                    `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
                ).join(', ');
            } else if (typeof errorDetail === 'string') {
                errorMessage = errorDetail;
            }
            
            return { 
                success: false, 
                message: errorMessage
            };
        }
        
        return { 
            success: false, 
            message: error.response?.data?.message || error.message || "Failed to fetch subcategory"
        };
    }
};
// Create subcategory (Admin only)
export const createSubcategory = async (subcategoryData) => {
    try {
        console.log("🔍 SUBCATEGORY API: Creating subcategory:", subcategoryData);
        const response = await api.post(`${CATEGORIES_BASE_URL}/subcategory`, subcategoryData);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 SUBCATEGORY API Create Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to create subcategory"
        };
    }
};

// Update subcategory (Admin only)
export const updateSubcategory = async (subcategoryId, updateData) => {
    try {
        console.log(`🔍 SUBCATEGORY API: Updating subcategory ${subcategoryId}:`, updateData);
        const response = await api.put(`${CATEGORIES_BASE_URL}/subcategory/${subcategoryId}`, updateData);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 SUBCATEGORY API Update Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to update subcategory"
        };
    }
};

// Delete subcategory (Admin only)
export const deleteSubcategory = async (subcategoryId) => {
    try {
        console.log(`🔍 SUBCATEGORY API: Deleting subcategory ${subcategoryId}`);
        const response = await api.delete(`${CATEGORIES_BASE_URL}/subcategory/${subcategoryId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("🔍 SUBCATEGORY API Delete Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to delete subcategory"
        };
    }
};

/* -----------------------------
   ✅ AUTH HELPER
------------------------------ */

// Check if user has admin role
export const isUserAdmin = () => {
    try {
        const user = localStorage.getItem('user');
        if (!user) return false;
        
        const parsedUser = JSON.parse(user);
        return Array.isArray(parsedUser.roles) && parsedUser.roles.includes('admin');
    } catch (error) {
        console.error("🔍 Error checking admin status:", error);
        return false;
    }
};

// Get current user info
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("🔍 Error getting current user:", error);
        return null;
    }
};

export default {
    fetchAllCategories,
    fetchCategoryById,
    fetchCategoryWithSubcategories,
    fetchAllSubcategories,
    fetchSubcategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    isUserAdmin,
    getCurrentUser
};