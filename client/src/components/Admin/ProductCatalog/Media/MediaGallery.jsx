import React, { useState, useEffect } from 'react';
import { formatImageForDisplay, formatVideoForDisplay } from '../../../../utils/formatters';
import { formatFileSize, formatDate } from '../../../../utils/apiHelpers';

const MediaGallery = ({ viewMode = 'gallery', onSelect }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filter, setFilter] = useState('all'); // all, images, videos
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMediaItems();
    }, [filter, sortBy]);

    const loadMediaItems = async () => {
        setLoading(true);
        // Simulate loading media items
        setTimeout(() => {
            const mockMedia = [
                {
                    id: '1',
                    type: 'image',
                    url: 'https://picsum.photos/300/200?random=1',
                    name: 'product-image-1.jpg',
                    size: 2048576,
                    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
                    variantId: '123',
                    isDefault: true
                },
                {
                    id: '2',
                    type: 'image',
                    url: 'https://picsum.photos/300/200?random=2',
                    name: 'product-image-2.jpg',
                    size: 1572864,
                    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
                    variantId: '123',
                    isDefault: false
                },
                {
                    id: '3',
                    type: 'video',
                    url: 'https://example.com/video1.mp4',
                    name: 'product-video-1.mp4',
                    size: 52428800,
                    uploadedAt: new Date(Date.now() - 259200000).toISOString(),
                    variantId: '123',
                    isDefault: true
                },
                // Add more mock items...
            ];
            
            let filtered = mockMedia;
            
            // Apply filter
            if (filter !== 'all') {
                filtered = filtered.filter(item => item.type === filter.slice(0, -1)); // Remove 's' from filter
            }
            
            // Apply search
            if (searchTerm) {
                filtered = filtered.filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // Apply sorting
            filtered.sort((a, b) => {
                if (sortBy === 'newest') {
                    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
                } else if (sortBy === 'oldest') {
                    return new Date(a.uploadedAt) - new Date(b.uploadedAt);
                } else if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                } else if (sortBy === 'size') {
                    return b.size - a.size;
                }
                return 0;
            });
            
            setMediaItems(filtered);
            setLoading(false);
        }, 1000);
    };

    const handleSelectItem = (itemId) => {
        if (viewMode === 'list') {
            // Toggle selection for list view
            setSelectedItems(prev => 
                prev.includes(itemId) 
                    ? prev.filter(id => id !== itemId)
                    : [...prev, itemId]
            );
        }
        if (onSelect) {
            onSelect(itemId);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === mediaItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(mediaItems.map(item => item.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedItems.length > 0 && window.confirm(`Delete ${selectedItems.length} selected items?`)) {
            // Implement bulk delete
            console.log('Delete items:', selectedItems);
            setSelectedItems([]);
        }
    };

    const renderGridView = () => (
        <div className="media-grid-view">
            {mediaItems.map(item => (
                <div key={item.id} className="media-grid-item">
                    <div 
                        className="media-item-thumbnail"
                        onClick={() => handleSelectItem(item.id)}
                    >
                        {item.type === 'image' ? (
                            <img 
                                src={item.url} 
                                alt={item.name}
                                className="media-thumbnail-image"
                            />
                        ) : (
                            <div className="media-thumbnail-video">
                                <i className="fas fa-video video-icon"></i>
                                <div className="video-overlay">
                                    <i className="fas fa-play play-icon"></i>
                                </div>
                            </div>
                        )}
                        {item.isDefault && (
                            <div className="default-badge">
                                <i className="fas fa-star"></i>
                                Default
                            </div>
                        )}
                    </div>
                    <div className="media-item-info">
                        <div className="media-item-name">
                            {item.name}
                        </div>
                        <div className="media-item-details">
                            <span className="detail-item">
                                <i className="fas fa-hdd"></i>
                                {formatFileSize(item.size)}
                            </span>
                            <span className="detail-item">
                                <i className="fas fa-calendar"></i>
                                {formatDate(item.uploadedAt, 'short')}
                            </span>
                        </div>
                        <div className="media-item-actions">
                            <button 
                                className="media-action-btn preview-btn"
                                onClick={() => handleSelectItem(item.id)}
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                            <button className="media-action-btn download-btn">
                                <i className="fas fa-download"></i>
                            </button>
                            <button className="media-action-btn delete-btn">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="media-list-view">
            <div className="list-view-header">
                <div className="list-header-checkbox">
                    <input
                        type="checkbox"
                        className="select-all-checkbox"
                        checked={selectedItems.length === mediaItems.length && mediaItems.length > 0}
                        onChange={handleSelectAll}
                    />
                </div>
                <div className="list-header-column name-column">Name</div>
                <div className="list-header-column type-column">Type</div>
                <div className="list-header-column size-column">Size</div>
                <div className="list-header-column date-column">Uploaded</div>
                <div className="list-header-column status-column">Status</div>
                <div className="list-header-column actions-column">Actions</div>
            </div>
            
            <div className="media-list-items">
                {mediaItems.map(item => (
                    <div key={item.id} className="media-list-item">
                        <div className="list-item-checkbox">
                            <input
                                type="checkbox"
                                className="item-checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                            />
                        </div>
                        <div className="list-item-name">
                            <div className="item-name-content">
                                {item.type === 'image' ? (
                                    <i className="fas fa-image item-icon"></i>
                                ) : (
                                    <i className="fas fa-video item-icon"></i>
                                )}
                                <span className="item-name-text">{item.name}</span>
                            </div>
                        </div>
                        <div className="list-item-type">
                            <span className={`type-badge ${item.type}-badge`}>
                                {item.type.toUpperCase()}
                            </span>
                        </div>
                        <div className="list-item-size">
                            {formatFileSize(item.size)}
                        </div>
                        <div className="list-item-date">
                            {formatDate(item.uploadedAt, 'short')}
                        </div>
                        <div className="list-item-status">
                            {item.isDefault ? (
                                <span className="status-badge default-badge">
                                    <i className="fas fa-star"></i>
                                    Default
                                </span>
                            ) : (
                                <span className="status-badge normal-badge">
                                    Active
                                </span>
                            )}
                        </div>
                        <div className="list-item-actions">
                            <button className="list-action-btn preview-btn">
                                <i className="fas fa-eye"></i>
                            </button>
                            <button className="list-action-btn download-btn">
                                <i className="fas fa-download"></i>
                            </button>
                            <button className="list-action-btn delete-btn">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRecentView = () => (
        <div className="media-recent-view">
            <div className="recent-section">
                <h3 className="recent-section-title">
                    <i className="fas fa-clock"></i>
                    Last 24 Hours
                </h3>
                {renderGridView()}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="media-gallery-loading">
                <div className="loading-spinner"></div>
                <p>Loading media library...</p>
            </div>
        );
    }

    return (
        <div className="media-gallery-container">
            <div className="gallery-controls">
                <div className="controls-left">
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            <i className="fas fa-th"></i>
                            All Media
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'images' ? 'active' : ''}`}
                            onClick={() => setFilter('images')}
                        >
                            <i className="fas fa-image"></i>
                            Images
                        </button>
                        <button 
                            className={`filter-btn ${filter === 'videos' ? 'active' : ''}`}
                            onClick={() => setFilter('videos')}
                        >
                            <i className="fas fa-video"></i>
                            Videos
                        </button>
                    </div>
                    
                    {selectedItems.length > 0 && viewMode === 'list' && (
                        <div className="bulk-selection">
                            <span className="selection-count">
                                {selectedItems.length} items selected
                            </span>
                            <button 
                                className="bulk-action-btn delete-selected-btn"
                                onClick={handleBulkDelete}
                            >
                                <i className="fas fa-trash"></i>
                                Delete Selected
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="controls-right">
                    <div className="search-box">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search media..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && loadMediaItems()}
                        />
                    </div>
                    
                    <div className="sort-dropdown">
                        <select 
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="name">Name A-Z</option>
                            <option value="size">Size Largest</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="gallery-stats">
                <div className="stat-item">
                    <i className="fas fa-images stat-icon"></i>
                    <span className="stat-label">Total Items:</span>
                    <span className="stat-value">{mediaItems.length}</span>
                </div>
                <div className="stat-item">
                    <i className="fas fa-hdd stat-icon"></i>
                    <span className="stat-label">Total Size:</span>
                    <span className="stat-value">
                        {formatFileSize(mediaItems.reduce((sum, item) => sum + item.size, 0))}
                    </span>
                </div>
            </div>

            <div className="gallery-content">
                {viewMode === 'gallery' && renderGridView()}
                {viewMode === 'list' && renderListView()}
                {viewMode === 'recent' && renderRecentView()}
            </div>

            {mediaItems.length === 0 && !loading && (
                <div className="empty-gallery-message">
                    <i className="fas fa-images"></i>
                    <h3>No media found</h3>
                    <p>Upload your first image or video to get started</p>
                </div>
            )}
        </div>
    );
};

export default MediaGallery;