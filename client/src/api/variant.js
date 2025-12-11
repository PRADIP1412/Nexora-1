import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const VARIANTS_BASE_URL = `${API_URL}/variants`;

/* -----------------------------
   ✅ ADMIN VARIANT FUNCTIONS
------------------------------ */

// Get all variants with pagination
export const fetchAllVariants = async (page = 1, perPage = 20, productId = null) => {
    try {
        const params = { page, per_page: perPage };
        if (productId) params.product_id = productId;
        
        const response = await axios.get(`${VARIANTS_BASE_URL}/`, { params });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Fetch Variants Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to fetch variants",
            data: { items: [], total: 0 }
        };
    }
};

// Get variant by ID
export const fetchVariantById = async (variantId) => {
    try {
        const response = await axios.get(`${VARIANTS_BASE_URL}/${variantId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Fetch Variant Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to fetch variant"
        };
    }
};

// Create new variant
export const createVariant = async (variantData) => {
    try {
        const response = await axios.post(`${VARIANTS_BASE_URL}/`, variantData);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Create Variant Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to create variant"
        };
    }
};

// Update variant
export const updateVariant = async (variantId, updateData) => {
    try {
        const response = await axios.put(`${VARIANTS_BASE_URL}/${variantId}`, updateData);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Update Variant Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to update variant"
        };
    }
};

// Delete variant
export const deleteVariant = async (variantId) => {
    try {
        const response = await axios.delete(`${VARIANTS_BASE_URL}/${variantId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Delete Variant Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to delete variant"
        };
    }
};

// Update variant stock
export const updateVariantStock = async (variantId, quantity) => {
    try {
        const response = await axios.patch(`${VARIANTS_BASE_URL}/${variantId}/stock`, null, {
            params: { quantity }
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Update Stock Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to update stock"
        };
    }
};

// Update variant price
export const updateVariantPrice = async (variantId, price) => {
    try {
        const response = await axios.patch(`${VARIANTS_BASE_URL}/${variantId}/price`, null, {
            params: { price }
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Update Price Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to update price"
        };
    }
};

// Set variant discount
export const setVariantDiscount = async (variantId, discountType, discountValue) => {
    try {
        const response = await axios.patch(`${VARIANTS_BASE_URL}/${variantId}/discount`, null, {
            params: { discount_type: discountType, discount_value: discountValue }
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Set Discount Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to set discount"
        };
    }
};

// Update variant status
export const updateVariantStatus = async (variantId, status) => {
    try {
        const response = await axios.patch(`${VARIANTS_BASE_URL}/${variantId}/status`, null, {
            params: { status }
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Update Status Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to update status"
        };
    }
};

// Set default variant for product
export const setDefaultVariant = async (productId, variantId) => {
    try {
        const response = await axios.patch(
            `${VARIANTS_BASE_URL}/product/${productId}/default/${variantId}`
        );
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Set Default Variant Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to set default variant"
        };
    }
};