import React from "react";
import { Trash2, Star, Video } from "lucide-react";
import './VariantMediaItem.css';

const VariantMediaItem = ({ 
  item, 
  type = "image", 
  onDelete, 
  onSetDefault, 
  isDefault 
}) => {
  const isVideo = type === "video";

  return (
    <div className="vmi-container">
      {/* Media Preview */}
      <div className="vmi-preview">
        {isVideo ? (
          <div className="vmi-video-container">
            <Video className="vmi-video-icon" />
            <span className="vmi-video-label">Video</span>
          </div>
        ) : (
          <div className="vmi-image-container">
            <img
              src={item.url}
              alt={`Variant ${type}`}
              className="vmi-image"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x300?text=Image+Not+Found";
              }}
            />
          </div>
        )}
      </div>

      {/* Overlay with actions */}
      <div className="vmi-action-overlay">
        <div className="vmi-action-buttons">
          {!isVideo && (
            <button
              onClick={() => onSetDefault(item[isVideo ? 'video_id' : 'image_id'])}
              className={`vmi-action-btn vmi-action-btn-default ${
                isDefault ? 'vmi-action-btn-default-active' : ''
              }`}
              title={isDefault ? "Default Image" : "Set as Default"}
            >
              <Star className={`vmi-action-icon ${isDefault ? 'vmi-fill-current' : ''}`} />
              <div className="vmi-tooltip">
                {isDefault ? "Default Image" : "Set as Default"}
              </div>
            </button>
          )}
          <button
            onClick={() => onDelete(item[isVideo ? 'video_id' : 'image_id'], type)}
            className="vmi-action-btn vmi-action-btn-delete"
            title={`Delete ${type}`}
          >
            <Trash2 className="vmi-action-icon" />
            <div className="vmi-tooltip">Delete {type}</div>
          </button>
        </div>
      </div>

      {/* Default badge for images */}
      {!isVideo && isDefault && (
        <div className="vmi-default-badge">
          <Star className="vmi-default-icon" />
          Default
        </div>
      )}

      {/* ID badge */}
      <div className="vmi-id-badge">
        ID: {isVideo ? item.video_id : item.image_id}
      </div>

      {/* Type badge */}
      <div className={`vmi-type-badge ${isVideo ? 'vmi-type-video' : 'vmi-type-image'}`}>
        {isVideo ? 'Video' : 'Image'}
      </div>
    </div>
  );
};

export default VariantMediaItem;