import React, { useState, useCallback } from 'react';
import { uploadProductImage, uploadProductVideo } from '../../../../api/media';
import { validateFile, validateVideoFile } from '../../../../utils/validators';
import { formatFileSize, formatApiError } from '../../../../utils/apiHelpers';
import ImageUpload from './ImageUpload';

const MediaUpload = ({ type = 'image', onSuccess, onCancel }) => {
    const [files, setFiles] = useState([]);
    const [variantId, setVariantId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({});
    const [errors, setErrors] = useState({});
    const [dragOver, setDragOver] = useState(false);

    const validateFiles = (fileList) => {
        const validationErrors = {};
        
        Array.from(fileList).forEach((file, index) => {
            const validator = type === 'image' ? validateFile : validateVideoFile;
            const error = validator(file);
            if (error) {
                validationErrors[file.name] = error;
            }
        });
        
        return validationErrors;
    };

    const handleFileSelect = useCallback((selectedFiles) => {
        const fileArray = Array.from(selectedFiles);
        const validationErrors = validateFiles(fileArray);
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setErrors({});
        const newFiles = fileArray.map(file => ({
            id: `${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: type === 'image' ? URL.createObjectURL(file) : null,
            status: 'pending',
            error: null
        }));
        
        setFiles(prev => [...prev, ...newFiles]);
    }, [type]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const clearAllFiles = () => {
        setFiles([]);
        setErrors({});
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setErrors({ general: 'Please select files to upload' });
            return;
        }
        
        if (!variantId.trim()) {
            setErrors({ variantId: 'Please enter a variant ID' });
            return;
        }

        setUploading(true);
        setErrors({});
        
        const uploadPromises = files.map(async (fileItem) => {
            try {
                setProgress(prev => ({
                    ...prev,
                    [fileItem.id]: 0
                }));

                // Simulate upload progress
                const simulateProgress = setInterval(() => {
                    setProgress(prev => ({
                        ...prev,
                        [fileItem.id]: Math.min(prev[fileItem.id] + 10, 90)
                    }));
                }, 100);

                // Call appropriate API
                const result = type === 'image' 
                    ? await uploadProductImage(variantId, fileItem.file)
                    : await uploadProductVideo(variantId, fileItem.file);

                clearInterval(simulateProgress);
                
                if (result.success) {
                    setProgress(prev => ({
                        ...prev,
                        [fileItem.id]: 100
                    }));
                    return { ...fileItem, status: 'success' };
                } else {
                    return { 
                        ...fileItem, 
                        status: 'error', 
                        error: result.message 
                    };
                }
            } catch (error) {
                const apiError = formatApiError(error);
                return { 
                    ...fileItem, 
                    status: 'error', 
                    error: apiError.message 
                };
            }
        });

        try {
            const results = await Promise.all(uploadPromises);
            setFiles(results);
            
            const allSuccessful = results.every(result => result.status === 'success');
            if (allSuccessful) {
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            }
        } catch (error) {
            setErrors({ general: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    const getTotalSize = () => {
        return files.reduce((total, file) => total + file.size, 0);
    };

    return (
        <div className="media-upload-container">
            <div className="upload-header">
                <h2 className="upload-title">
                    <i className={type === 'image' ? "fas fa-image" : "fas fa-video"}></i>
                    Upload {type === 'image' ? 'Images' : 'Videos'}
                </h2>
                <p className="upload-subtitle">
                    Upload {type === 'image' ? 'product images' : 'product videos'} to your media library
                </p>
            </div>

            <div className="upload-form">
                <div className="form-section">
                    <label className="section-label">
                        <i className="fas fa-box"></i>
                        Variant ID *
                        <span className="field-hint">
                            Enter the variant ID to associate these {type}s with
                        </span>
                    </label>
                    <input
                        type="text"
                        className={`variant-input ${errors.variantId ? 'input-error' : ''}`}
                        value={variantId}
                        onChange={(e) => {
                            setVariantId(e.target.value);
                            if (errors.variantId) {
                                setErrors(prev => ({ ...prev, variantId: '' }));
                            }
                        }}
                        placeholder="Enter variant ID (e.g., VAR123)"
                        disabled={uploading}
                    />
                    {errors.variantId && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {errors.variantId}
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <label className="section-label">
                        <i className="fas fa-upload"></i>
                        Select Files
                        <span className="field-hint">
                            {type === 'image' 
                                ? 'Supported formats: JPG, PNG, GIF, WebP (Max 5MB each)'
                                : 'Supported formats: MP4, WebM, OGG (Max 50MB each)'
                            }
                        </span>
                    </label>
                    
                    <div 
                        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${files.length > 0 ? 'has-files' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        {files.length === 0 ? (
                            <div className="drop-content">
                                <i className="fas fa-cloud-upload-alt drop-icon"></i>
                                <h3 className="drop-title">
                                    Drag & Drop {type === 'image' ? 'images' : 'videos'} here
                                </h3>
                                <p className="drop-subtitle">
                                    or click to browse files from your computer
                                </p>
                                <button 
                                    className="browse-btn"
                                    onClick={() => document.getElementById('file-input').click()}
                                    disabled={uploading}
                                >
                                    <i className="fas fa-folder-open"></i>
                                    Browse Files
                                </button>
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    accept={type === 'image' ? 'image/*' : 'video/*'}
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </div>
                        ) : (
                            <div className="files-preview">
                                <div className="files-header">
                                    <h4 className="files-title">
                                        Selected Files ({files.length})
                                    </h4>
                                    <button 
                                        className="clear-all-btn"
                                        onClick={clearAllFiles}
                                        disabled={uploading}
                                    >
                                        <i className="fas fa-trash"></i>
                                        Clear All
                                    </button>
                                </div>
                                <div className="files-list">
                                    {files.map(fileItem => (
                                        <div key={fileItem.id} className="file-item">
                                            <div className="file-preview">
                                                {type === 'image' && fileItem.preview ? (
                                                    <img 
                                                        src={fileItem.preview} 
                                                        alt={fileItem.name}
                                                        className="file-thumbnail"
                                                    />
                                                ) : (
                                                    <div className="file-thumbnail file-icon">
                                                        <i className="fas fa-file-video"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="file-info">
                                                <div className="file-name">
                                                    {fileItem.name}
                                                </div>
                                                <div className="file-details">
                                                    <span className="file-size">
                                                        {formatFileSize(fileItem.size)}
                                                    </span>
                                                    <span className="file-type">
                                                        {fileItem.type.split('/')[1].toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="file-status">
                                                {fileItem.status === 'uploading' && (
                                                    <div className="upload-progress">
                                                        <div 
                                                            className="progress-bar"
                                                            style={{ width: `${progress[fileItem.id] || 0}%` }}
                                                        ></div>
                                                        <span className="progress-text">
                                                            {progress[fileItem.id] || 0}%
                                                        </span>
                                                    </div>
                                                )}
                                                {fileItem.status === 'success' && (
                                                    <div className="status-success">
                                                        <i className="fas fa-check-circle"></i>
                                                        <span>Uploaded</span>
                                                    </div>
                                                )}
                                                {fileItem.status === 'error' && (
                                                    <div className="status-error">
                                                        <i className="fas fa-exclamation-circle"></i>
                                                        <span>Failed</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="file-actions">
                                                <button 
                                                    className="file-action-btn remove-btn"
                                                    onClick={() => removeFile(fileItem.id)}
                                                    disabled={uploading || fileItem.status === 'uploading'}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="files-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Total Files:</span>
                                        <span className="summary-value">{files.length}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Size:</span>
                                        <span className="summary-value">
                                            {formatFileSize(getTotalSize())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {errors.general && (
                        <div className="error-message general-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            {errors.general}
                        </div>
                    )}

                    {Object.keys(errors).map(fileName => (
                        errors[fileName] && errors[fileName] !== 'general' && errors[fileName] !== 'variantId' && (
                            <div key={fileName} className="error-message file-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {fileName}: {errors[fileName]}
                            </div>
                        )
                    ))}
                </div>

                <div className="upload-options">
                    <div className="option-group">
                        <label className="option-label">
                            <input 
                                type="checkbox" 
                                className="option-checkbox"
                                defaultChecked
                            />
                            <span className="option-text">
                                Set first uploaded {type} as default
                            </span>
                        </label>
                        <label className="option-label">
                            <input 
                                type="checkbox" 
                                className="option-checkbox"
                            />
                            <span className="option-text">
                                Optimize {type === 'image' ? 'images' : 'videos'} for web
                            </span>
                        </label>
                        <label className="option-label">
                            <input 
                                type="checkbox" 
                                className="option-checkbox"
                            />
                            <span className="option-text">
                                Preserve original files
                            </span>
                        </label>
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
                        disabled={uploading || files.length === 0 || !variantId.trim()}
                    >
                        {uploading ? (
                            <>
                                <span className="loading-spinner-btn"></span>
                                Uploading... ({files.filter(f => f.status === 'success').length}/{files.length})
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload"></i>
                                Upload {files.length} {type === 'image' ? 'Image(s)' : 'Video(s)'}
                            </>
                        )}
                    </button>
                </div>

                <div className="upload-footer">
                    <div className="footer-note">
                        <i className="fas fa-info-circle"></i>
                        <span>
                            * {type === 'image' ? 'Images' : 'Videos'} will be associated with the specified variant.
                            You can manage them later from the variant details page.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaUpload;