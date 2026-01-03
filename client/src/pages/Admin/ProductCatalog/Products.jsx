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
    
    // Handle URL-based tab switching
    useEffect(() => {
        const path = location.pathname;

        if (path.includes('/admin/categories')) {
            navigate('/admin/categories');
        } 
        else if (path.includes('/admin/brands')) {
            navigate('/admin/brands');
        } 
        else if (path.includes('/admin/attributes')) {
            navigate('/admin/attributes');
        } 
        else if (path.includes('/admin/variants')) {
            navigate('/admin/variants');   // ✔ UPDATED
        } 
        else if (path.includes('/admin/reviews')) {
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
    const handleNavigateToCategories = () => navigate('/admin/categories');
    const handleNavigateToBrands = () => navigate('/admin/brands');
    const handleNavigateToAttributes = () => navigate('/admin/attributes');
    const handleNavigateToVariants = () => navigate('/admin/variants');   // ✔ NEW
    const handleNavigateToReviews = () => navigate('/admin/reviews');
    
    // Handle ESC key closing modals
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (showProductForm) handleFormCancel();
                if (showVariants) handleCloseVariants();
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
                                onClick={() => alert('Import coming soon')}
                            >
                                <i className="fas fa-file-import"></i> Import
                            </button>

                            <button 
                                className="header-btn export-btn"
                                onClick={() => alert('Export coming soon')}
                            >
                                <i className="fas fa-file-export"></i> Export
                            </button>

                            <button className="header-btn add-btn" onClick={handleAddProduct}>
                                <i className="fas fa-plus"></i>
                                Add Product
                            </button>
                        </div>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="navigation-tabs">
                        <button 
                            className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            <i className="fas fa-list"></i>
                            Product List
                        </button>

                        <button className="nav-tab" onClick={handleNavigateToCategories}>
                            <i className="fas fa-folder"></i>
                            Categories
                        </button>

                        <button className="nav-tab" onClick={handleNavigateToBrands}>
                            <i className="fas fa-tag"></i>
                            Brands
                        </button>

                        <button className="nav-tab" onClick={handleNavigateToAttributes}>
                            <i className="fas fa-sliders-h"></i>
                            Attributes
                        </button>

                        {/* ✔ MEDIA removed — VARIANTS added */}
                        <button className="nav-tab" onClick={handleNavigateToVariants}>
                            <i className="fas fa-layer-group"></i>
                            Variants
                        </button>

                        <button className="nav-tab" onClick={handleNavigateToReviews}>
                            <i className="fas fa-star"></i>
                            Reviews
                        </button>
                    </div>
                    
                    {/* Page Content */}
                    <div className="page-content">
                        {activeTab === 'list' && (
                            <ProductList 
                                onEdit={handleEditProduct}
                                onViewVariants={handleViewVariants}
                                onAddProduct={handleAddProduct}
                            />
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
                                        <button className="btn btn-secondary" onClick={handleCloseVariants}>
                                            Close
                                        </button>

                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => {
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
