import React, { createContext, useState, useContext, useCallback } from "react";
import * as mediaApi from "../api/media";

const MediaContext = createContext();

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};

export const MediaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [variants, setVariants] = useState([]);
  const [media, setMedia] = useState({
    images: [],
    videos: [],
  });
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Fetch variants
  const fetchVariants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.fetchVariants();
      
      if (result.success) {
        setVariants(result.data);
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to fetch variants";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch media for variant
  const fetchVariantMedia = useCallback(async (variantId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.fetchVariantMedia(variantId);
      
      if (result.success) {
        setMedia(result.data);
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to fetch media";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload image
  const uploadImage = useCallback(async (variantId, file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.uploadImage(variantId, file);
      
      if (result.success) {
        // Update local state
        setMedia(prev => ({
          ...prev,
          images: [...prev.images, result.data],
        }));
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to upload image";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete image
  const deleteImage = useCallback(async (imageId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.deleteImage(imageId);
      
      if (result.success) {
        // Update local state
        setMedia(prev => ({
          ...prev,
          images: prev.images.filter(img => img.image_id !== imageId),
        }));
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to delete image";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Set default image
  const setDefaultImage = useCallback(async (variantId, imageId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.setDefaultImage(variantId, imageId);
      
      if (result.success) {
        // Update local state
        setMedia(prev => ({
          ...prev,
          images: prev.images.map(img => ({
            ...img,
            is_default: img.image_id === imageId,
          })),
        }));
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to set default image";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload video
  const uploadVideo = useCallback(async (variantId, file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.uploadVideo(variantId, file);
      
      if (result.success) {
        // Update local state
        setMedia(prev => ({
          ...prev,
          videos: [...prev.videos, result.data],
        }));
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to upload video";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete video
  const deleteVideo = useCallback(async (videoId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mediaApi.deleteVideo(videoId);
      
      if (result.success) {
        // Update local state
        setMedia(prev => ({
          ...prev,
          videos: prev.videos.filter(vid => vid.video_id !== videoId),
        }));
        return result;
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to delete video";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Select variant
  const selectVariant = useCallback(async (variantId) => {
    setSelectedVariant(variantId);
    if (variantId) {
      await fetchVariantMedia(variantId);
    } else {
      setMedia({ images: [], videos: [] });
    }
  }, [fetchVariantMedia]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    loading,
    error,
    variants,
    media,
    selectedVariant,
    
    fetchVariants,
    fetchVariantMedia,
    uploadImage,
    deleteImage,
    setDefaultImage,
    uploadVideo,
    deleteVideo,
    selectVariant,
    clearError,
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};