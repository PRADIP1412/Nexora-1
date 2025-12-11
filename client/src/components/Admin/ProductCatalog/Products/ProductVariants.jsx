import React, { useState, useEffect } from 'react';
import { useProductContext } from '../../../../context/ProductContext';
import './ProductVariants.css';

const ProductVariants = ({ productId }) => {
    const { currentProduct, loading, error, fetchProductById } = useProductContext();
    const [actionLoading, setActionLoading] = useState(false);
    
    useEffect(() => {
        if (productId) {
            console.log(`🔍 VARIANTS: Fetching product ${productId} for variants`);
            fetchProductById(productId);
        }
    }, [productId, fetchProductById]);
    
    useEffect(() => {
        if (currentProduct) {
            console.log("🔍 VARIANTS: Current product loaded:", {
                productId: currentProduct.product_id,
                variantsCount: currentProduct.variants?.length || 0
            });
        }
    }, [currentProduct]);
    
    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading variants...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="error-state">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
                <button onClick={() => fetchProductById(productId)} className="retry-btn">
                    Retry
                </button>
            </div>
        );
    }
    
    const variants = currentProduct?.variants || [];
    const productName = currentProduct?.product_name || 'Product';
    
    console.log(`🔍 VARIANTS: Rendering ${variants.length} variants for product ${productId}`);
    
    if (variants.length === 0) {
        return (
            <div className="empty-variants">
                <div className="empty-icon">
                    <i className="fas fa-layer-group"></i>
                </div>
                <h4>No Variants Found</h4>
                <p>This product doesn't have any variants yet.</p>
                <button className="add-variant-btn" onClick={() => alert('Add variant functionality coming soon')}>
                    <i className="fas fa-plus"></i>
                    Add First Variant
                </button>
            </div>
        );
    }
    
    // Format price helper
    const formatPrice = (price) => {
        if (!price) return '₹0.00';
        return `₹${parseFloat(price).toFixed(2)}`;
    };
    
    // Get variant image
    const getVariantImage = (variant) => {
        if (variant.images?.length > 0) {
            const defaultImg = variant.images.find(img => img.is_default);
            return defaultImg?.url || variant.images[0]?.url || '/api/placeholder/100/100';
        }
        return '/api/placeholder/100/100';
    };
    
    return (
        <div className="product-variants">
            <div className="variants-header">
                <h3 className="variants-title">
                    <i className="fas fa-layer-group"></i>
                    Variants for: {productName}
                    <span className="variants-count">({variants.length})</span>
                </h3>
                <div className="variant-actions">
                    <button className="action-btn" onClick={() => alert('Add variant functionality coming soon')}>
                        <i className="fas fa-plus"></i>
                        Add Variant
                    </button>
                    <button className="action-btn" onClick={() => alert('Manage variant images functionality coming soon')}>
                        <i className="fas fa-images"></i>
                        Manage Images
                    </button>
                </div>
            </div>
            
            <div className="variants-list">
                {variants.map((variant, index) => {
                    const isDefault = variant.is_default;
                    const discountPercent = variant.discount_type === 'PERCENT' ? variant.discount_value : 0;
                    const discountAmount = variant.discount_type === 'FLAT' ? variant.discount_value : 0;
                    
                    return (
                        <div key={variant.variant_id || index} className="variant-card">
                            <div className="variant-image">
                                <img 
                                    src={getVariantImage(variant)} 
                                    alt={variant.variant_name || `Variant ${index + 1}`}
                                    onError={(e) => {
                                        e.target.src = '/api/placeholder/100/100';
                                    }}
                                />
                                {isDefault && (
                                    <span className="default-badge">
                                        <i className="fas fa-star"></i> Default
                                    </span>
                                )}
                            </div>
                            
                            <div className="variant-info">
                                <div className="variant-header">
                                    <h4 className="variant-name">
                                        {variant.variant_name || `Variant ${index + 1}`}
                                        {isDefault && <span className="default-indicator">(Default)</span>}
                                    </h4>
                                    <span className={`variant-status ${variant.status?.toLowerCase() || 'inactive'}`}>
                                        {variant.status || 'INACTIVE'}
                                    </span>
                                </div>
                                
                                <div className="variant-details">
                                    <div className="variant-pricing">
                                        <div className="price-row">
                                            <span className="price-label">Price:</span>
                                            <span className="price-value">{formatPrice(variant.price)}</span>
                                        </div>
                                        <div className="price-row">
                                            <span className="price-label">Final Price:</span>
                                            <span className="final-price">{formatPrice(variant.final_price)}</span>
                                        </div>
                                        {(discountPercent > 0 || discountAmount > 0) && (
                                            <div className="discount-info">
                                                <span className="discount-badge">
                                                    {discountPercent > 0 
                                                        ? `${discountPercent}% OFF` 
                                                        : `${formatPrice(discountAmount)} OFF`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="variant-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">
                                                <i className="fas fa-box"></i> Stock:
                                            </span>
                                            <span className={`meta-value ${variant.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                {variant.stock_quantity || 0}
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">
                                                <i className="fas fa-tag"></i> SKU:
                                            </span>
                                            <span className="meta-value">
                                                {variant.sku || 'N/A'}
                                            </span>
                                        </div>
                                        {variant.dimensions && (
                                            <div className="meta-item">
                                                <span className="meta-label">
                                                    <i className="fas fa-ruler-combined"></i> Size:
                                                </span>
                                                <span className="meta-value">
                                                    {variant.dimensions}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="variant-attributes">
                                    {variant.attributes && Object.keys(variant.attributes).length > 0 ? (
                                        <div className="attributes-list">
                                            {Object.entries(variant.attributes).map(([key, value]) => (
                                                <span key={key} className="attribute-tag">
                                                    {key}: {value}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="no-attributes">No attributes defined</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="variant-actions">
                                <button 
                                    className="action-btn edit-variant"
                                    onClick={() => alert(`Edit variant ${variant.variant_id} functionality coming soon`)}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    className="action-btn delete-variant"
                                    onClick={() => alert(`Delete variant ${variant.variant_id} functionality coming soon`)}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                                {!isDefault && (
                                    <button 
                                        className="action-btn set-default"
                                        onClick={() => alert(`Set as default variant functionality coming soon`)}
                                    >
                                        <i className="fas fa-star"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="variants-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Variants:</span>
                    <span className="summary-value">{variants.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">In Stock:</span>
                    <span className="summary-value">
                        {variants.filter(v => v.stock_quantity > 0).length}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">On Discount:</span>
                    <span className="summary-value">
                        {variants.filter(v => v.discount_type !== 'NONE' && v.discount_value > 0).length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductVariants;