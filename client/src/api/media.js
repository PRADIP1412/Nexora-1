import api from "./api";

const MEDIA_BASE_URL = "/media";

// Upload product image
export const uploadImage = async (variantId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post(`${MEDIA_BASE_URL}/image/upload`, formData, {
      params: { variant_id: variantId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to upload image",
      data: null,
    };
  }
};

// Delete product image
export const deleteImage = async (imageId) => {
  try {
    const response = await api.delete(`${MEDIA_BASE_URL}/image/${imageId}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to delete image",
      data: null,
    };
  }
};

// Set default image
export const setDefaultImage = async (variantId, imageId) => {
  try {
    const response = await api.put(`${MEDIA_BASE_URL}/image/default`, null, {
      params: {
        variant_id: variantId,
        image_id: imageId,
      },
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to set default image",
      data: null,
    };
  }
};

// Upload product video
export const uploadVideo = async (variantId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post(`${MEDIA_BASE_URL}/video/upload`, formData, {
      params: { variant_id: variantId },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to upload video",
      data: null,
    };
  }
};

// Delete product video
export const deleteVideo = async (videoId) => {
  try {
    const response = await api.delete(`${MEDIA_BASE_URL}/video/${videoId}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to delete video",
      data: null,
    };
  }
};

// Fetch variants (you'll need to create this endpoint or get from existing API)
export const fetchVariants = async () => {
  try {
    // This endpoint needs to be created or use existing one
    const response = await api.get("/products/variants");
    
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to fetch variants",
      data: [],
    };
  }
};

// Fetch media for a variant (you might want to add this endpoint to backend)
export const fetchVariantMedia = async (variantId) => {
  try {
    const response = await api.get(`${MEDIA_BASE_URL}/variant/${variantId}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to fetch media",
      data: { images: [], videos: [] },
    };
  }
};