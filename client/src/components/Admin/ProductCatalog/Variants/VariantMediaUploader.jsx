import React, { useCallback, useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Video, X } from "lucide-react";
import "./VariantMediaUploader.css";

const VariantMediaUploader = ({ 
  variantId, 
  onUploadImage, 
  onUploadVideo, 
  loading = false 
}) => {
  const [files, setFiles] = useState([]);
  const [uploadType, setUploadType] = useState("image"); // 'image' or 'video'
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: uploadType
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Filter files based on upload type
    const validFiles = droppedFiles.filter(file => {
      if (uploadType === 'image') {
        return file.type.startsWith('image/') && 
               ['.jpeg', '.jpg', '.png', '.gif', '.webp'].some(ext => 
                 file.name.toLowerCase().endsWith(ext)
               );
      } else {
        return file.type.startsWith('video/') && 
               ['.mp4', '.mov', '.avi', '.mkv'].some(ext => 
                 file.name.toLowerCase().endsWith(ext)
               );
      }
    });
    
    const newFiles = validFiles.map(file => ({
      file,
      preview: uploadType === 'image' ? URL.createObjectURL(file) : null,
      type: uploadType
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [uploadType]);

  const handleUpload = async () => {
    for (const fileData of files) {
      if (fileData.type === 'image') {
        await onUploadImage(variantId, fileData.file);
      } else {
        await onUploadVideo(variantId, fileData.file);
      }
    }
    // Clean up object URLs
    files.forEach(fileData => {
      if (fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
    });
    setFiles([]);
  };

  const removeFile = (index) => {
    // Revoke object URL before removing
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview);
    }
    
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(fileData => {
        if (fileData.preview) {
          URL.revokeObjectURL(fileData.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="vmu-space-y-4">
      {/* Upload Type Selector */}
      <div className={`vmu-type-selector ${
        uploadType === "image" ? "vmu-type-selector-image-active" : "vmu-type-selector-video-active"
      }`}>
        <button
          type="button"
          onClick={() => {
            setUploadType("image");
            setFiles([]); // Clear files when switching type
          }}
          className={`vmu-type-btn vmu-type-btn-image ${
            uploadType === "image" ? "vmu-type-btn-active" : ""
          }`}
        >
          <ImageIcon className="vmu-type-icon" />
          <span>Images</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadType("video");
            setFiles([]); // Clear files when switching type
          }}
          className={`vmu-type-btn vmu-type-btn-video ${
            uploadType === "video" ? "vmu-type-btn-active" : ""
          }`}
        >
          <Video className="vmu-type-icon" />
          <span>Videos</span>
        </button>
      </div>

      {/* Custom Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`vmu-dropzone ${
          dragOver ? 'vmu-dropzone-drag-over' : ''
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={uploadType === 'image' 
            ? '.jpeg,.jpg,.png,.gif,.webp,image/*' 
            : '.mp4,.mov,.avi,.mkv,video/*'}
          onChange={handleFileSelect}
          className="vmu-hidden"
        />
        <label htmlFor="file-upload" className="vmu-cursor-pointer">
          <div className="vmu-dropzone-content">
            <Upload className="vmu-dropzone-icon" />
            <p className="vmu-dropzone-text">
              {dragOver ? (
                "Drop the files here..."
              ) : (
                `Drag & drop ${uploadType === 'image' ? 'images' : 'videos'} here, or click to select files`
              )}
            </p>
            <p className="vmu-dropzone-subtext">
              {uploadType === 'image' 
                ? 'Supports: JPG, PNG, GIF, WEBP' 
                : 'Supports: MP4, MOV, AVI, MKV'}
            </p>
            <p className="vmu-dropzone-format">
              {uploadType === 'image' 
                ? 'JPG, PNG, GIF, WEBP' 
                : 'MP4, MOV, AVI, MKV'}
            </p>
            <button
              type="button"
              onClick={() => document.getElementById('file-upload').click()}
              className="vmu-select-btn"
            >
              <Upload className="vmu-select-icon" />
              Select Files
            </button>
          </div>
        </label>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="vmu-selected-files">
          <div className="vmu-selected-header">
            <h4 className="vmu-selected-title">
              Selected Files <span className="vmu-selected-count">{files.length}</span>
            </h4>
          </div>
          <div className="vmu-file-grid">
            {files.map((fileData, index) => (
              <div 
                key={index} 
                className={`vmu-file-item ${
                  uploadType === 'image' ? 'vmu-file-item-image' : 'vmu-file-item-video'
                }`}
              >
                {uploadType === 'image' && fileData.preview ? (
                  <img
                    src={fileData.preview}
                    alt="Preview"
                    className="vmu-file-preview"
                  />
                ) : (
                  <div className="vmu-file-preview vmu-flex-col vmu-items-center vmu-justify-center">
                    <Video className="vmu-file-video-icon" />
                    <span className="vmu-text-xs vmu-text-gray-600 vmu-mt-1">Video</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="vmu-file-remove"
                >
                  <X className="vmu-file-remove-icon" />
                </button>
                <div className="vmu-file-info">
                  <p className="vmu-file-name">
                    {fileData.file.name}
                  </p>
                  <p className="vmu-file-size">
                    {(fileData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className={`vmu-upload-btn ${
              loading ? 'vmu-upload-btn-loading' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="vmu-upload-spinner" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="vmu-upload-icon" />
                <span>Upload {files.length} file{files.length > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default VariantMediaUploader;