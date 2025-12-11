import React, { useState, useRef, useEffect } from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onEdit, onDelete, onViewVariants, onPreview, deletingId = null }) => {
    const [showActions, setShowActions] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const actionMenuRef = useRef(null);
    const moreActionsBtnRef = useRef(null);
    
    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showActions && 
                actionMenuRef.current && 
                moreActionsBtnRef.current &&
                !actionMenuRef.current.contains(event.target) &&
                !moreActionsBtnRef.current.contains(event.target)
            ) {
                setShowActions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showActions]);

    const handleEditClick = () => {
        setShowActions(false);
        if (onEdit && product.product_id) onEdit(product.product_id);
    };
    
    const handleDeleteClick = async () => {
        if (!product.product_id) return;
        
        setDeleteError(null);
        setShowActions(false);
        
        // Show confirmation dialog
        if (!window.confirm(`Are you sure you want to delete "${product.product_name}"? This action cannot be undone.`)) {
            return;
        }
        
        setIsDeleting(true);
        
        try {
            // Call the delete function from parent
            if (onDelete) {
                await onDelete(product.product_id);
            }
        } catch (error) {
            console.error("❌ ProductCard: Delete failed:", error);
            setDeleteError(error.message || "Failed to delete product");
            setIsDeleting(false);
        }
    };
    
    const handleViewVariantsClick = () => {
        setShowActions(false);
        if (onViewVariants && product.product_id) onViewVariants(product.product_id);
    };
    
    const handlePreviewClick = () => {
        if (onPreview && product.product_id) {
            onPreview(product.product_id);
        } else {
            window.open(`/product/${product.product_id}`, '_blank');
        }
    };

    // Helper function to get main image
    const getMainImage = () => {
        if (product.default_variant?.images?.length > 0) {
            const defaultImg = product.default_variant.images.find(img => img.is_default);
            return defaultImg?.url || product.default_variant.images[0]?.url || '/api/placeholder/200/200';
        }
        return '/api/placeholder/200/200';
    };

    // Format price
    const formatPrice = (price) => {
        if (!price) return '₹0.00';
        return `₹${parseFloat(price).toFixed(2)}`;
    };

    // Calculate discount percentage
    const calculateDiscount = () => {
        if (!product.default_variant) return 0;
        const { price, final_price } = product.default_variant;
        if (price && final_price && price > final_price) {
            return Math.round(((price - final_price) / price) * 100);
        }
        return 0;
    };

    // Check if this product is currently being deleted
    const isCurrentlyDeleting = deletingId === product.product_id || isDeleting;

    // Handle 3-dots button click
    const handleMoreActionsClick = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        setShowActions(prev => !prev);
    };

    return (
        <div className={`product-card-admin ${isCurrentlyDeleting ? 'deleting' : ''}`}>
            {isCurrentlyDeleting && (
                <div className="deleting-overlay">
                    <div className="deleting-spinner"></div>
                    <p>Deleting...</p>
                </div>
            )}
            
            {deleteError && (
                <div className="delete-error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{deleteError}</span>
                    <button 
                        className="dismiss-error-btn" 
                        onClick={() => setDeleteError(null)}
                        title="Dismiss error"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}
            
            <div className="product-image-container">
                <img 
                    src={getMainImage()} 
                    alt={product.product_name}
                    className="product-image"
                    onError={(e) => {
                        e.target.src = '/api/placeholder/200/200';
                    }}
                    loading="lazy" // Add lazy loading
                />
                {calculateDiscount() > 0 && (
                    <div className="discount-badge">
                        -{calculateDiscount()}%
                    </div>
                )}
                <div className="product-status">
                    <span className={`status-badge ${product.status?.toLowerCase() || 'inactive'}`}>
                        {product.status || 'INACTIVE'}
                    </span>
                </div>
                <button 
                    ref={moreActionsBtnRef}
                    className="more-actions-btn"
                    onClick={handleMoreActionsClick}
                    disabled={isCurrentlyDeleting}
                    aria-label="More actions"
                >
                    <i className="fas fa-ellipsis-v"></i>
                </button>
            </div>
            
            <div 
                ref={actionMenuRef}
                className={`action-menu ${showActions ? 'show' : ''}`}
            >
                <button 
                    onClick={handleEditClick} 
                    className="action-btn edit"
                    disabled={isCurrentlyDeleting}
                >
                    <i className="fas fa-edit"></i> Edit Product
                </button>
                {onViewVariants && (
                    <button 
                        onClick={handleViewVariantsClick} 
                        className="action-btn variants"
                        disabled={isCurrentlyDeleting}
                    >
                        <i className="fas fa-layer-group"></i> View Variants
                    </button>
                )}
                <button 
                    onClick={handleDeleteClick} 
                    className="action-btn delete"
                    disabled={isCurrentlyDeleting}
                >
                    {isCurrentlyDeleting ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Deleting...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-trash"></i> Delete
                        </>
                    )}
                </button>
                <button onClick={() => setShowActions(false)} className="action-btn close">
                    <i className="fas fa-times"></i> Close
                </button>
            </div>
            
            <div className="product-info">
                <h3 className="product-name" title={product.product_name}>
                    {product.product_name}
                </h3>
                
                {product.description && (
                    <p className="product-description">
                        {product.description.length > 60 
                            ? `${product.description.substring(0, 60)}...` 
                            : product.description}
                    </p>
                )}
                
                <div className="product-meta">
                    {product.brand?.brand_name && (
                        <span className="product-brand">
                            <i className="fas fa-tag"></i> {product.brand.brand_name}
                        </span>
                    )}
                    {product.category?.category_name && (
                        <span className="product-category">
                            <i className="fas fa-folder"></i> {product.category.category_name}
                        </span>
                    )}
                </div>
                
                <div className="product-pricing">
                    <div className="price-section">
                        <span className="current-price">
                            {formatPrice(product.default_variant?.final_price || product.default_variant?.price || 0)}
                        </span>
                        {product.default_variant?.price && product.default_variant?.final_price && 
                         product.default_variant.price > product.default_variant.final_price && (
                            <span className="original-price">
                                {formatPrice(product.default_variant.price)}
                            </span>
                        )}
                    </div>
                    
                    <div className="stock-info">
                        <span className={`stock-status ${(product.default_variant?.stock_quantity || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            <i className={`fas fa-${(product.default_variant?.stock_quantity || 0) > 0 ? 'check' : 'times'}-circle`}></i>
                            {(product.default_variant?.stock_quantity || 0) > 0 
                                ? `${product.default_variant.stock_quantity} in stock` 
                                : 'Out of stock'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="product-actions">
                <button 
                    className="quick-action-btn edit-btn" 
                    onClick={handleEditClick}
                    disabled={isCurrentlyDeleting}
                >
                    <i className="fas fa-edit"></i>
                    Edit
                </button>
                {onViewVariants && (
                    <button 
                        className="quick-action-btn variants-btn" 
                        onClick={handleViewVariantsClick}
                        disabled={isCurrentlyDeleting}
                    >
                        <i className="fas fa-layer-group"></i>
                        Variants
                    </button>
                )}
                <button 
                    className="quick-action-btn preview-btn" 
                    onClick={handlePreviewClick}
                    disabled={isCurrentlyDeleting}
                >
                    <i className="fas fa-external-link-alt"></i>
                    Preview
                </button>
            </div>
        </div>
    );
};

export default ProductCard;