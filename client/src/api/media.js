import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const MEDIA_BASE_URL = `${API_URL}/media`;

/* -----------------------------
   ✅ ADMIN MEDIA FUNCTIONS
------------------------------ */

// Upload product image
export const uploadProductImage = async (variantId, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(
            `${MEDIA_BASE_URL}/image/upload?variant_id=${variantId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Upload Image Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to upload image"
        };
    }
};

// Delete product image
export const deleteProductImage = async (imageId) => {
    try {
        const response = await axios.delete(`${MEDIA_BASE_URL}/image/${imageId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Delete Image Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to delete image"
        };
    }
};

// Set default image for variant
export const setDefaultImage = async (variantId, imageId) => {
    try {
        const response = await axios.put(`${MEDIA_BASE_URL}/image/default`, null, {
            params: { variant_id: variantId, image_id: imageId }
        });
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Set Default Image Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to set default image"
        };
    }
};

// Upload product video
export const uploadProductVideo = async (variantId, file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(
            `${MEDIA_BASE_URL}/video/upload?variant_id=${variantId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Upload Video Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to upload video"
        };
    }
};

// Delete product video
export const deleteProductVideo = async (videoId) => {
    try {
        const response = await axios.delete(`${MEDIA_BASE_URL}/video/${videoId}`);
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Delete Video Error:", error.response?.data || error.message);
        return { 
            success: false, 
            message: error.response?.data?.detail || "Failed to delete video"
        };
    }
};