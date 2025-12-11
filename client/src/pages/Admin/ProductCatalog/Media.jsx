import React, { useState } from 'react';
import MediaGallery from '../../../components/Admin/ProductCatalog/Media/MediaGallery';
import MediaUpload from '../../../components/Admin/ProductCatalog/Media/MediaUpload';
import ImageUpload from '../../../components/Admin/ProductCatalog/Media/ImageUpload';
import './Media.css';

const MediaPage = () => {
    const [activeView, setActiveView] = useState('gallery');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('image');
    
    const handleUploadImage = () => {
        setUploadType('image');
        setShowUploadModal(true);
    };
    
    const handleUploadVideo = () => {
        setUploadType('video');
        setShowUploadModal(true);
    };
    
    const handleUploadSuccess = () => {
        setShowUploadModal(false);
    };
    
    const handleUploadCancel = () => {
        setShowUploadModal(false);
    };
    
    const handleSelectMedia = (mediaId) => {
        setSelectedMedia(mediaId);
    };

    return (
        <div className="admin-media-page">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <i className="fas fa-images"></i>
                        Media Library
                    </h1>
                    <p className="page-subtitle">
                        Manage all product images, videos, and media files
                    </p>
                </div>
                <div className="header-actions">
                    <div className="upload-buttons">
                        <button className="header-btn upload-image-btn" onClick={handleUploadImage}>
                            <i className="fas fa-image"></i>
                            Upload Image
                        </button>
                        <button className="header-btn upload-video-btn" onClick={handleUploadVideo}>
                            <i className="fas fa-video"></i>
                            Upload Video
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="view-tabs">
                <button 
                    className={`view-tab ${activeView === 'gallery' ? 'active' : ''}`}
                    onClick={() => setActiveView('gallery')}
                >
                    <i className="fas fa-th"></i>
                    Gallery View
                </button>
                <button 
                    className={`view-tab ${activeView === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveView('list')}
                >
                    <i className="fas fa-list"></i>
                    List View
                </button>
                <button 
                    className={`view-tab ${activeView === 'recent' ? 'active' : ''}`}
                    onClick={() => setActiveView('recent')}
                >
                    <i className="fas fa-clock"></i>
                    Recently Added
                </button>
                <button 
                    className={`view-tab ${activeView === 'storage' ? 'active' : ''}`}
                    onClick={() => setActiveView('storage')}
                >
                    <i className="fas fa-hdd"></i>
                    Storage
                </button>
            </div>
            
            <div className="page-content">
                {activeView === 'gallery' && (
                    <div className="view-content active">
                        <MediaGallery 
                            viewMode="gallery"
                            onSelect={handleSelectMedia}
                        />
                    </div>
                )}
                
                {activeView === 'list' && (
                    <div className="view-content">
                        <MediaGallery 
                            viewMode="list"
                            onSelect={handleSelectMedia}
                        />
                    </div>
                )}
                
                {activeView === 'recent' && (
                    <div className="view-content">
                        <MediaGallery 
                            viewMode="recent"
                            onSelect={handleSelectMedia}
                        />
                    </div>
                )}
                
                {activeView === 'storage' && (
                    <div className="view-content">
                        <div className="storage-placeholder">
                            <i className="fas fa-hdd"></i>
                            <h3>Storage Management</h3>
                            <p>Media storage usage and optimization tools will be available here.</p>
                        </div>
                    </div>
                )}
            </div>
            
            {showUploadModal && (
                <div className="modal-overlay" onClick={handleUploadCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <MediaUpload 
                            type={uploadType}
                            onSuccess={handleUploadSuccess}
                            onCancel={handleUploadCancel}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaPage;