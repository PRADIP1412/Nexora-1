import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProductProvider } from '../../../context/ProductContext';
import { CategoryProvider } from '../../../context/CategoryContext';
import ProductList from '../../../components/Admin/ProductCatalog/Products/ProductList';
import ProductForm from '../../../components/Admin/ProductCatalog/Products/ProductForm';
import ProductVariants from '../../../components/Admin/ProductCatalog/Products/ProductVariants';
import './Products.css';

const ProductsPage = () => {
    console.log("🔍 PAGE: ProductsPage component rendering");
    
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('list');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showVariants, setShowVariants] = useState(false);
    
    // Set active tab based on URL when component mounts
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/admin/categories')) {
            navigate('/admin/categories');
        } else if (path.includes('/admin/brands')) {
            navigate('/admin/brands');
        } else if (path.includes('/admin/attributes')) {
            navigate('/admin/attributes');
        } else if (path.includes('/admin/media')) {
            navigate('/admin/media');
        } else if (path.includes('/admin/reviews')) {
            navigate('/admin/reviews');
        }
    }, [location.pathname, navigate]);
    
    const handleAddProduct = () => {
        console.log("🔍 PAGE: Add product clicked");
        setSelectedProduct(null);
        setShowProductForm(true);
    };
    
    const handleEditProduct = (productId) => {
        console.log(`🔍 PAGE: Edit product clicked: ${productId}`);
        setSelectedProduct(productId);
        setShowProductForm(true);
    };
    
    const handleViewVariants = (productId) => {
        console.log(`🔍 PAGE: View variants clicked: ${productId}`);
        setSelectedProduct(productId);
        setShowVariants(true);
    };
    
    const handleFormSuccess = (result) => {
        console.log("🔍 PAGE: Form submitted successfully:", result);
        setShowProductForm(false);
        setSelectedProduct(null);
        alert(`Product ${selectedProduct ? 'updated' : 'created'} successfully!`);
    };
    
    const handleFormCancel = () => {
        console.log("🔍 PAGE: Form cancelled");
        setShowProductForm(false);
        setSelectedProduct(null);
    };
    
    const handleCloseVariants = () => {
        console.log("🔍 PAGE: Closing variants modal");
        setShowVariants(false);
        setSelectedProduct(null);
    };
    
    // Navigation handlers
    const handleNavigateToCategories = () => {
        console.log("🔍 PAGE: Navigating to categories");
        navigate('/admin/categories');
    };
    
    const handleNavigateToBrands = () => {
        console.log("🔍 PAGE: Navigating to brands");
        navigate('/admin/brands');
    };
    
    const handleNavigateToAttributes = () => {
        console.log("🔍 PAGE: Navigating to attributes");
        navigate('/admin/attributes');
    };
    
    const handleNavigateToMedia = () => {
        console.log("🔍 PAGE: Navigating to media");
        navigate('/admin/media');
    };
    
    const handleNavigateToReviews = () => {
        console.log("🔍 PAGE: Navigating to reviews");
        navigate('/admin/reviews');
    };
    
    // Handle escape key to close modals
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (showProductForm) {
                    console.log("🔍 PAGE: Escape key pressed, closing form");
                    handleFormCancel();
                }
                if (showVariants) {
                    console.log("🔍 PAGE: Escape key pressed, closing variants");
                    handleCloseVariants();
                }
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showProductForm, showVariants]);

    return (
        <ProductProvider>
            <CategoryProvider>
                <div className="admin-products-page">
                    <div className="page-header">
                        <div className="header-content">
                            <h1 className="page-title">
                                <i className="fas fa-box"></i>
                                Product Catalog
                            </h1>
                            <p className="page-subtitle">
                                Manage your products, variants, and inventory
                            </p>
                        </div>
                        <div className="header-actions">
                            <button 
                                className="header-btn import-btn" 
                                onClick={() => {
                                    console.log("🔍 PAGE: Import clicked");
                                    alert('Import functionality coming soon');
                                }}
                            >
                                <i className="fas fa-file-import"></i>
                                Import
                            </button>
                            <button 
                                className="header-btn export-btn" 
                                onClick={() => {
                                    console.log("🔍 PAGE: Export clicked");
                                    alert('Export functionality coming soon');
                                }}
                            >
                                <i className="fas fa-file-export"></i>
                                Export
                            </button>
                            <button className="header-btn add-btn" onClick={handleAddProduct}>
                                <i className="fas fa-plus"></i>
                                Add Product
                            </button>
                        </div>
                    </div>
                    
                    <div className="navigation-tabs">
                        <button 
                            className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => {
                                console.log("🔍 PAGE: Switching to list tab");
                                setActiveTab('list');
                            }}
                        >
                            <i className="fas fa-list"></i>
                            Product List
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={handleNavigateToCategories}
                        >
                            <i className="fas fa-folder"></i>
                            Categories
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'brands' ? 'active' : ''}`}
                            onClick={handleNavigateToBrands}
                        >
                            <i className="fas fa-tag"></i>
                            Brands
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'attributes' ? 'active' : ''}`}
                            onClick={handleNavigateToAttributes}
                        >
                            <i className="fas fa-sliders-h"></i>
                            Attributes
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'media' ? 'active' : ''}`}
                            onClick={handleNavigateToMedia}
                        >
                            <i className="fas fa-images"></i>
                            Media
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={handleNavigateToReviews}
                        >
                            <i className="fas fa-star"></i>
                            Reviews
                        </button>
                    </div>
                    
                    <div className="page-content">
                        {activeTab === 'list' && (
                            <div className="tab-content active">
                                <ProductList 
                                    onEdit={handleEditProduct}
                                    onViewVariants={handleViewVariants}
                                    onAddProduct={handleAddProduct}
                                />
                            </div>
                        )}
                        
                        {activeTab === 'categories' && (
                            <div className="tab-content">
                                <div className="coming-soon">
                                    <i className="fas fa-folder-open"></i>
                                    <h3>Categories Management</h3>
                                    <p>Redirecting to Categories page...</p>
                                    <button className="action-btn" onClick={() => setActiveTab('list')}>
                                        <i className="fas fa-arrow-left"></i>
                                        Back to Products
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'brands' && (
                            <div className="tab-content">
                                <div className="coming-soon">
                                    <i className="fas fa-tags"></i>
                                    <h3>Brands Management</h3>
                                    <p>Redirecting to Brands page...</p>
                                    <button className="action-btn" onClick={() => setActiveTab('list')}>
                                        <i className="fas fa-arrow-left"></i>
                                        Back to Products
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'attributes' && (
                            <div className="tab-content">
                                <div className="coming-soon">
                                    <i className="fas fa-sliders-h"></i>
                                    <h3>Attributes Management</h3>
                                    <p>Redirecting to Attributes page...</p>
                                    <button className="action-btn" onClick={() => setActiveTab('list')}>
                                        <i className="fas fa-arrow-left"></i>
                                        Back to Products
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'media' && (
                            <div className="tab-content">
                                <div className="coming-soon">
                                    <i className="fas fa-images"></i>
                                    <h3>Media Library</h3>
                                    <p>Redirecting to Media page...</p>
                                    <button className="action-btn" onClick={() => setActiveTab('list')}>
                                        <i className="fas fa-arrow-left"></i>
                                        Back to Products
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'reviews' && (
                            <div className="tab-content">
                                <div className="coming-soon">
                                    <i className="fas fa-star"></i>
                                    <h3>Product Reviews</h3>
                                    <p>Redirecting to Reviews page...</p>
                                    <button className="action-btn" onClick={() => setActiveTab('list')}>
                                        <i className="fas fa-arrow-left"></i>
                                        Back to Products
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Product Form Modal */}
                    {showProductForm && (
                        <div className="modal-overlay active" onClick={handleFormCancel}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <ProductForm 
                                    productId={selectedProduct}
                                    onSuccess={handleFormSuccess}
                                    onCancel={handleFormCancel}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Variants Modal */}
                    {showVariants && selectedProduct && (
                        <div className="modal-overlay active" onClick={handleCloseVariants}>
                            <div className="modal-content variants-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="variants-modal-header">
                                    <h2>
                                        <i className="fas fa-layer-group"></i>
                                        Product Variants
                                    </h2>
                                    <button className="close-modal-btn" onClick={handleCloseVariants}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div className="variants-modal-body">
                                    <ProductVariants productId={selectedProduct} />
                                    <div className="variants-modal-actions">
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={handleCloseVariants}
                                        >
                                            Close
                                        </button>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => {
                                                console.log("🔍 PAGE: Switching from variants to edit product");
                                                handleCloseVariants();
                                                handleEditProduct(selectedProduct);
                                            }}
                                        >
                                            <i className="fas fa-edit"></i>
                                            Edit Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CategoryProvider>
        </ProductProvider>
    );
};

export default ProductsPage;