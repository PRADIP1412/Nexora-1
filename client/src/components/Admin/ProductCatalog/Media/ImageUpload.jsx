import React, { useState, useCallback } from 'react';
import { uploadProductImage } from '../../../../api/media';
import { validateFile } from '../../../../utils/validators';
import { formatFileSize, formatApiError } from '../../../../utils/apiHelpers';

const ImageUpload = ({ variantId, onSuccess, onCancel }) => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [uploadOptions, setUploadOptions] = useState({
        setAsDefault: true,
        optimizeForWeb: true,
        preserveOriginal: false
    });

    const validateImage = (file) => {
        return validateFile(file);
    };

    const handleImageSelect = useCallback((selectedFile) => {
        const validationError = validateImage(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setImage(selectedFile);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleImageSelect(e.dataTransfer.files[0]);
        }
    }, [handleImageSelect]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const clearImage = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        setImage(null);
        setPreview(null);
        setError('');
    };

    const handleUpload = async () => {
        if (!image) {
            setError('Please select an image to upload');
            return;
        }

        if (!variantId) {
            setError('Variant ID is required');
            return;
        }

        setUploading(true);
        setError('');
        
        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await uploadProductImage(variantId, image);

            clearInterval(progressInterval);
            setProgress(100);

            if (result.success) {
                setTimeout(() => {
                    onSuccess();
                }, 500);
            } else {
                setError(result.message || 'Upload failed');
            }
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleOptionChange = (option) => {
        setUploadOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    return (
        <div className="image-upload-container">
            <div className="upload-header">
                <h2 className="upload-title">
                    <i className="fas fa-image"></i>
                    Upload Product Image
                </h2>
                <p className="upload-subtitle">
                    Upload an image for variant: <strong>{variantId}</strong>
                </p>
            </div>

            <div className="upload-form">
                <div className="form-section">
                    <label className="section-label">
                        <i className="fas fa-upload"></i>
                        Select Image
                        <span className="field-hint">
                            Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                        </span>
                    </label>
                    
                    {!image ? (
                        <div 
                            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <div className="drop-content">
                                <i className="fas fa-cloud-upload-alt drop-icon"></i>
                                <h3 className="drop-title">
                                    Drag & Drop your image here
                                </h3>
                                <p className="drop-subtitle">
                                    or click to browse files from your computer
                                </p>
                                <div className="supported-formats">
                                    <span className="format-tag">JPG</span>
                                    <span className="format-tag">PNG</span>
                                    <span className="format-tag">GIF</span>
                                    <span className="format-tag">WebP</span>
                                </div>
                                <button 
                                    className="browse-btn"
                                    onClick={() => document.getElementById('image-input').click()}
                                    disabled={uploading}
                                >
                                    <i className="fas fa-folder-open"></i>
                                    Select Image
                                </button>
                                <input
                                    id="image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0])}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="image-preview-section">
                            <div className="preview-header">
                                <h4 className="preview-title">
                                    Image Preview
                                </h4>
                                <button 
                                    className="change-btn"
                                    onClick={clearImage}
                                    disabled={uploading}
                                >
                                    <i className="fas fa-redo"></i>
                                    Change Image
                                </button>
                            </div>
                            
                            <div className="image-preview-container">
                                <div className="preview-image-wrapper">
                                    <img 
                                        src={preview} 
                                        alt="Preview"
                                        className="preview-image"
                                    />
                                    {uploading && (
                                        <div className="upload-overlay">
                                            <div className="upload-progress-circle">
                                                <div className="progress-circle">
                                                    <svg className="progress-ring" viewBox="0 0 100 100">
                                                        <circle 
                                                            className="progress-ring-circle"
                                                            strokeWidth="4"
                                                            fill="transparent"
                                                            r="42"
                                                            cx="50"
                                                            cy="50"
                                                            style={{
                                                                strokeDasharray: 264,
                                                                strokeDashoffset: 264 - (264 * progress) / 100
                                                            }}
                                                        />
                                                    </svg>
                                                    <span className="progress-percent">
                                                        {progress}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="image-details">
                                    <div className="detail-row">
                                        <span className="detail-label">File Name:</span>
                                        <span className="detail-value">{image.name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">File Size:</span>
                                        <span className="detail-value">{formatFileSize(image.size)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Dimensions:</span>
                                        <span className="detail-value">Loading...</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Type:</span>
                                        <span className="detail-value">{image.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <label className="section-label">
                        <i className="fas fa-cog"></i>
                        Upload Options
                    </label>
                    
                    <div className="upload-options">
                        <div className="option-group">
                            <label className="option-label">
                                <input 
                                    type="checkbox" 
                                    className="option-checkbox"
                                    checked={uploadOptions.setAsDefault}
                                    onChange={() => handleOptionChange('setAsDefault')}
                                    disabled={uploading}
                                />
                                <span className="option-text">
                                    Set as default image for this variant
                                </span>
                            </label>
                            <label className="option-label">
                                <input 
                                    type="checkbox" 
                                    className="option-checkbox"
                                    checked={uploadOptions.optimizeForWeb}
                                    onChange={() => handleOptionChange('optimizeForWeb')}
                                    disabled={uploading}
                                />
                                <span className="option-text">
                                    Optimize image for web (recommended)
                                </span>
                            </label>
                            <label className="option-label">
                                <input 
                                    type="checkbox" 
                                    className="option-checkbox"
                                    checked={uploadOptions.preserveOriginal}
                                    onChange={() => handleOptionChange('preserveOriginal')}
                                    disabled={uploading}
                                />
                                <span className="option-text">
                                    Preserve original image file
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="upload-actions">
                    <button
                        type="button"
                        className="action-btn cancel-btn"
                        onClick={onCancel}
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="action-btn upload-btn"
                        onClick={handleUpload}
                        disabled={uploading || !image}
                    >
                        {uploading ? (
                            <>
                                <span className="loading-spinner-btn"></span>
                                Uploading... ({progress}%)
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload"></i>
                                Upload Image
                            </>
                        )}
                    </button>
                </div>

                <div className="upload-tips">
                    <div className="tips-header">
                        <i className="fas fa-lightbulb"></i>
                        <h4>Upload Tips</h4>
                    </div>
                    <ul className="tips-list">
                        <li className="tip-item">
                            <i className="fas fa-check-circle"></i>
                            Use high-quality images with good lighting
                        </li>
                        <li className="tip-item">
                            <i className="fas fa-check-circle"></i>
                            Recommended size: 1200x1200 pixels
                        </li>
                        <li className="tip-item">
                            <i className="fas fa-check-circle"></i>
                            Use white or neutral backgrounds for product images
                        </li>
                        <li className="tip-item">
                            <i className="fas fa-check-circle"></i>
                            Save images in RGB color mode
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;