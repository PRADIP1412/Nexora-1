import React, { useState, useEffect } from 'react';
import { useProductContext } from '../../../../context/ProductContext';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import './ProductList.css';

const ProductList = ({ onEdit, onViewVariants, onAddProduct }) => {
    const { 
        products, 
        loading, 
        error, 
        fetchProducts, 
        deleteProduct, 
        pagination,
        refreshProducts,
        resetFilters 
    } = useProductContext();
    
    const [filters, setFilters] = useState({
        page: 1,
        per_page: 12,
        sort_by: 'newest',
        status: '',
        search: ''
    });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [forceRefresh, setForceRefresh] = useState(0);
    const [deletingId, setDeletingId] = useState(null); // Track which product is being deleted

    // Initial load and when filters change
    useEffect(() => {
        console.log("🔍 LIST: Component mounted or filters changed");
        const loadProducts = async () => {
            console.log("🔍 LIST: Loading products with filters:", filters);
            await fetchProducts(filters);
        };
        loadProducts();
    }, [filters, forceRefresh, fetchProducts]);

    // Log when products update
    useEffect(() => {
        console.log("🔍 LIST: Products updated:", {
            count: products.length,
            productIds: products.map(p => p.product_id)
        });
    }, [products]);

    const handleFilterChange = (newFilters) => {
        console.log("🔍 LIST: Filter changed:", newFilters);
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleSearch = (searchTerm) => {
        console.log("🔍 LIST: Search triggered:", searchTerm);
        setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    };

    const handlePageChange = (page) => {
        console.log("🔍 LIST: Page change:", page);
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearFilters = () => {
        console.log("🔍 LIST: Clearing all filters");
        setFilters({
            page: 1,
            per_page: 12,
            sort_by: 'newest',
            status: '',
            search: ''
        });
        setSelectedProducts([]);
        resetFilters();
    };

    const handleDeleteProduct = async (productId) => {
        console.log(`🔍 LIST: Delete product ${productId} requested`);
        
        try {
            setDeletingId(productId); // Track this product as being deleted
            await deleteProduct(productId);
            console.log(`🔍 LIST: Product ${productId} deleted successfully`);
            
            // Force a refresh after delete
            setForceRefresh(prev => prev + 1);
            
            // Show success message
            const deletedProduct = products.find(p => p.product_id === productId);
            if (deletedProduct) {
                console.log(`✅ Product "${deletedProduct.product_name}" deleted successfully`);
            }
        } catch (error) {
            console.error('🔍 LIST: Failed to delete product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setDeletingId(null); // Reset deleting state
        }
    };

    const handlePreviewProduct = (productId) => {
        console.log(`🔍 LIST: Preview product ${productId}`);
        window.open(`/product/${productId}`, '_blank');
    };

    const handleRefresh = async () => {
        console.log("🔍 LIST: Manual refresh triggered");
        try {
            await refreshProducts();
        } catch (error) {
            console.error("🔍 LIST: Refresh failed:", error);
        }
    };

    const handleHardRefresh = () => {
        console.log("🔍 LIST: Hard refresh (re-fetch from server)");
        setForceRefresh(prev => prev + 1);
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.map(p => p.product_id));
        }
    };

    const handleSelectProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleBulkAction = (action) => {
        console.log(`🔍 LIST: Bulk ${action} on ${selectedProducts.length} products`);
        alert(`${action} action would be performed on ${selectedProducts.length} products`);
        // Implement bulk actions as needed
    };

    return (
        <div className="admin-product-list">
            <div className="product-list-header">
                <h2 className="page-title">
                    <i className="fas fa-box"></i>
                    All Products
                    {loading && <span className="loading-indicator"> (Loading...)</span>}
                </h2>
                <div className="header-actions">
                    <div className="product-stats">
                        <span className="stat-item">
                            <i className="fas fa-box"></i>
                            <span className="stat-value">{pagination.total || 0}</span>
                            <span className="stat-label">Total Products</span>
                        </span>
                        <span className="stat-item">
                            <i className="fas fa-check-circle"></i>
                            <span className="stat-value">
                                {products.filter(p => p.status === 'ACTIVE').length}
                            </span>
                            <span className="stat-label">Active</span>
                        </span>
                        <span className="stat-item">
                            <i className="fas fa-tags"></i>
                            <span className="stat-value">
                                {products.filter(p => p.default_variant?.discount_type !== 'NONE').length}
                            </span>
                            <span className="stat-label">On Sale</span>
                        </span>
                    </div>
                    
                    <div className="action-buttons">
                        <button className="refresh-btn" onClick={handleRefresh} disabled={loading}>
                            <i className="fas fa-sync"></i>
                            Refresh
                        </button>
                        <button className="hard-refresh-btn" onClick={handleHardRefresh} disabled={loading}>
                            <i className="fas fa-redo"></i>
                            Hard Refresh
                        </button>
                        <button className="add-product-btn" onClick={onAddProduct}>
                            <i className="fas fa-plus"></i>
                            Add New Product
                        </button>
                    </div>
                </div>
            </div>

            <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onClearFilters={handleClearFilters}
            />

            {selectedProducts.length > 0 && (
                <div className="bulk-actions-bar">
                    <div className="bulk-selection-info">
                        <i className="fas fa-check-circle"></i>
                        <span>{selectedProducts.length} product(s) selected</span>
                    </div>
                    <div className="bulk-actions">
                        <button className="bulk-btn" onClick={() => handleBulkAction('activate')}>
                            <i className="fas fa-check"></i> Activate
                        </button>
                        <button className="bulk-btn" onClick={() => handleBulkAction('deactivate')}>
                            <i className="fas fa-pause"></i> Deactivate
                        </button>
                        <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')}>
                            <i className="fas fa-trash"></i> Delete
                        </button>
                        <button className="bulk-btn" onClick={() => setSelectedProducts([])}>
                            <i className="fas fa-times"></i> Clear Selection
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                    <small>
                        Page {pagination.page || 1} of {pagination.total_pages || 1} • 
                        Total: {pagination.total || 0} products
                    </small>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <div className="error-details">
                        <span className="error-text">{error}</span>
                        <div className="error-actions">
                            <button onClick={handleRefresh} className="retry-btn">
                                <i className="fas fa-sync"></i> Retry
                            </button>
                            <button onClick={handleHardRefresh} className="retry-btn">
                                <i className="fas fa-redo"></i> Hard Retry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    {products.length > 0 ? (
                        <>
                            <div className="products-grid">
                                {products.map((product) => (
                                    <ProductCard 
                                        key={product.product_id} 
                                        product={product}
                                        onEdit={() => onEdit && onEdit(product.product_id)}
                                        onDelete={handleDeleteProduct}
                                        onViewVariants={() => onViewVariants && onViewVariants(product.product_id)}
                                        onPreview={() => handlePreviewProduct(product.product_id)}
                                        deletingId={deletingId}
                                    />
                                ))}
                            </div>

                            {pagination.total_pages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="page-btn"
                                        onClick={() => handlePageChange(filters.page - 1)}
                                        disabled={filters.page === 1}
                                    >
                                        <i className="fas fa-chevron-left"></i> Previous
                                    </button>
                                    
                                    <div className="page-numbers">
                                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.total_pages <= 5) {
                                                pageNum = i + 1;
                                            } else if (filters.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (filters.page >= pagination.total_pages - 2) {
                                                pageNum = pagination.total_pages - 4 + i;
                                            } else {
                                                pageNum = filters.page - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-number ${filters.page === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        className="page-btn"
                                        onClick={() => handlePageChange(filters.page + 1)}
                                        disabled={filters.page === pagination.total_pages}
                                    >
                                        Next <i className="fas fa-chevron-right"></i>
                                    </button>
                                    
                                    <div className="page-info">
                                        Page {filters.page} of {pagination.total_pages} • 
                                        Showing {((filters.page - 1) * filters.per_page) + 1}-
                                        {Math.min(filters.page * filters.per_page, pagination.total)} of {pagination.total} products
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-box-open"></i>
                            </div>
                            <h3>No Products Found</h3>
                            <p>
                                {filters.search || filters.status 
                                    ? 'No products match your current filters.' 
                                    : 'You have no products yet. Add your first product!'}
                            </p>
                            <div className="empty-state-actions">
                                {filters.search || filters.status ? (
                                    <button onClick={handleClearFilters} className="clear-filters-btn">
                                        <i className="fas fa-filter"></i>
                                        Clear Filters
                                    </button>
                                ) : (
                                    <button onClick={onAddProduct} className="add-first-product-btn">
                                        <i className="fas fa-plus"></i>
                                        Add Your First Product
                                    </button>
                                )}
                                <button onClick={handleRefresh} className="retry-btn">
                                    <i className="fas fa-sync"></i>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductList;