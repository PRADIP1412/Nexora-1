import React, { useState, useEffect } from "react";
import { useMedia } from "../../../../context/MediaContext";
import VariantMediaGrid from "./VariantMediaGrid";
import VariantMediaUploader from "./VariantMediaUploader";
import { fetchVariantImages, fetchVariantVideos } from "../../../../api/variants";
import './VariantMediaSection.css';

const VariantMediaSection = ({ variantId }) => {
  const { 
    uploadImage, 
    uploadVideo, 
    deleteImage, 
    deleteVideo, 
    setDefaultImage,
    loading: mediaLoading,
    error: mediaError,
    clearError
  } = useMedia();
  
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMedia = async () => {
    if (!variantId) return;
    
    setLoading(true);
    try {
      const [imagesResult, videosResult] = await Promise.all([
        fetchVariantImages(variantId),
        fetchVariantVideos(variantId)
      ]);

      if (imagesResult.success) setImages(imagesResult.data);
      if (videosResult.success) setVideos(videosResult.data);
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [variantId]);

  const handleUploadImage = async (variantId, file) => {
    const result = await uploadImage(variantId, file);
    if (result.success) {
      await loadMedia();
    }
  };

  const handleUploadVideo = async (variantId, file) => {
    const result = await uploadVideo(variantId, file);
    if (result.success) {
      await loadMedia();
    }
  };

  const handleDeleteMedia = async (mediaId, type) => {
    if (type === 'image') {
      const result = await deleteImage(mediaId);
      if (result.success) {
        setImages(prev => prev.filter(img => img.image_id !== mediaId));
      }
    } else {
      const result = await deleteVideo(mediaId);
      if (result.success) {
        setVideos(prev => prev.filter(vid => vid.video_id !== mediaId));
      }
    }
  };

  const handleSetDefaultImage = async (variantId, imageId) => {
    const result = await setDefaultImage(variantId, imageId);
    if (result.success) {
      setImages(prev => prev.map(img => ({
        ...img,
        is_default: img.image_id === imageId
      })));
    }
  };

  if (loading) {
    return (
      <div className="vms-loading">
        <div className="vms-loading-content">
          <div className="vms-loading-spinner" />
          <p className="vms-loading-text">Loading media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vms-container">
      {/* Error Display */}
      {mediaError && (
        <div className="vms-error-container">
          <div className="vms-error-content">
            <span className="vms-error-text">{mediaError}</span>
            <button 
              onClick={clearError}
              className="vms-error-close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="vms-gallery-section">
        <div className="vms-section-header">
          <h3 className="vms-section-title">Media Gallery</h3>
        </div>
        <VariantMediaGrid
          images={images}
          videos={videos}
          onDeleteMedia={handleDeleteMedia}
          onSetDefaultImage={handleSetDefaultImage}
          variantId={variantId}
        />
      </div>

      {/* Upload Section */}
      <div className="vms-upload-section">
        <div className="vms-upload-header">
          <h3 className="vms-upload-title">Upload New Media</h3>
        </div>
        <VariantMediaUploader
          variantId={variantId}
          onUploadImage={handleUploadImage}
          onUploadVideo={handleUploadVideo}
          loading={mediaLoading}
        />
      </div>

      {/* Stats */}
      <div className="vms-stats-section">
        <div className="vms-stats-header">
          <h4 className="vms-stats-title">Media Statistics</h4>
        </div>
        <div className="vms-stats-grid">
          <div className="vms-stat-card vms-stat-card-images">
            <div className="vms-stat-value vms-stat-value-images">{images.length}</div>
            <div className="vms-stat-label">
              <span className="vms-stat-icon vms-stat-icon-images">🖼️</span>
              Images
            </div>
          </div>
          <div className="vms-stat-card vms-stat-card-videos">
            <div className="vms-stat-value vms-stat-value-videos">{videos.length}</div>
            <div className="vms-stat-label">
              <span className="vms-stat-icon vms-stat-icon-videos">🎬</span>
              Videos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantMediaSection;