import React from "react";
import VariantMediaItem from "./VariantMediaItem";
import './VariantMediaGrid.css';

const VariantMediaGrid = ({ 
  images = [], 
  videos = [], 
  onDeleteMedia, 
  onSetDefaultImage,
  variantId 
}) => {
  const allMedia = [
    ...images.map(img => ({ ...img, type: 'image' })),
    ...videos.map(vid => ({ ...vid, type: 'video' }))
  ];

  if (allMedia.length === 0) {
    return (
      <div className="vmg-empty-state">
        <div className="vmg-empty-icon">🖼️</div>
        <p className="vmg-empty-text">No media uploaded yet</p>
        <p className="vmg-empty-subtext">Upload images or videos to display here</p>
      </div>
    );
  }

  return (
    <div className="vmg-grid">
      {images.map((image) => (
        <div key={image.image_id} className="vmg-media-item-wrapper">
          <VariantMediaItem
            item={image}
            type="image"
            onDelete={(id) => onDeleteMedia(id, 'image')}
            onSetDefault={(id) => onSetDefaultImage(variantId, id)}
            isDefault={image.is_default}
          />
        </div>
      ))}
      
      {videos.map((video) => (
        <div key={video.video_id} className="vmg-media-item-wrapper">
          <VariantMediaItem
            item={video}
            type="video"
            onDelete={(id) => onDeleteMedia(id, 'video')}
          />
        </div>
      ))}
    </div>
  );
};

export default VariantMediaGrid;