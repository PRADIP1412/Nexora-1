import React, { useState, useEffect } from 'react';
import { useProductContext } from '../../../../context/ProductContext';
import { useCategoryContext } from '../../../../context/CategoryContext';
import './ProductForm.css';

const ProductForm = ({ productId, onSuccess, onCancel }) => {
    const { 
        createProduct, 
        updateProduct, 
        fetchProductById, 
        currentProduct,
        fetchBrands,
        brands,
        loading: productLoading 
    } = useProductContext();
    
    const { 
        categories, 
        fetchAllCategories, 
        fetchCategoryWithSubcategories,
        subcategories,
        loading: categoryLoading 
    } = useCategoryContext();
    
    const [formData, setFormData] = useState({
        product_name: '',
        description: '',
        brand_id: '',
        category_id: '',
        sub_category_id: '',
        status: 'ACTIVE'
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);

    useEffect(() => {
        console.log("🔍 FORM: Initializing form, fetching data...");
        fetchAllCategories();
        fetchBrands();
    }, [fetchAllCategories, fetchBrands]);

    useEffect(() => {
        if (productId) {
            console.log(`🔍 FORM: Loading product data for ID: ${productId}`);
            loadProductData();
        } else {
            console.log("🔍 FORM: Creating new product form");
            setFormData({
                product_name: '',
                description: '',
                brand_id: '',
                category_id: '',
                sub_category_id: '',
                status: 'ACTIVE'
            });
        }
    }, [productId]);

    useEffect(() => {
        if (formData.category_id) {
            console.log(`🔍 FORM: Category changed to ${formData.category_id}, loading subcategories`);
            loadSubcategoriesForCategory(formData.category_id);
        } else {
            setAvailableSubcategories([]);
        }
    }, [formData.category_id]);

    const loadProductData = async () => {
        setLoading(true);
        try {
            console.log(`🔍 FORM: Fetching product ${productId} from API`);
            const product = await fetchProductById(productId);
            
            if (product) {
                console.log("🔍 FORM: Product loaded:", product);
                
                // First, try to find the category from the loaded product data
                let foundCategoryId = '';
                
                if (product.subcategory) {
                    // If backend provides full category info in subcategory
                    foundCategoryId = product.subcategory.category_id;
                } else if (product.sub_category_id) {
                    // Search through categories to find which one has this subcategory
                    for (const category of categories) {
                        if (category.subcategories) {
                            const hasSubcategory = category.subcategories.some(
                                sub => sub.sub_category_id === product.sub_category_id
                            );
                            if (hasSubcategory) {
                                foundCategoryId = category.category_id;
                                break;
                            }
                        }
                    }
                }
                
                // If we found the category, load its subcategories
                if (foundCategoryId) {
                    await loadSubcategoriesForCategory(foundCategoryId);
                }
                
                setFormData({
                    product_name: product.product_name || '',
                    description: product.description || '',
                    brand_id: product.brand?.brand_id || '',
                    category_id: foundCategoryId || '',
                    sub_category_id: product.sub_category_id || '',
                    status: product.status || 'ACTIVE'
                });
                
                console.log("🔍 FORM: Form data set:", {
                    product_name: product.product_name,
                    brand_id: product.brand?.brand_id,
                    sub_category_id: product.sub_category_id,
                    category_id: foundCategoryId
                });
            }
        } catch (error) {
            console.error('🔍 FORM: Failed to load product:', error);
            setErrors({ submit: 'Failed to load product data' });
        } finally {
            setLoading(false);
        }
    };

    const loadSubcategoriesForCategory = async (categoryId) => {
        try {
            console.log(`🔍 FORM: Loading subcategories for category ${categoryId}`);
            const category = await fetchCategoryWithSubcategories(categoryId);
            if (category && category.subcategories) {
                setAvailableSubcategories(category.subcategories);
                console.log(`🔍 FORM: Loaded ${category.subcategories.length} subcategories`);
            } else {
                setAvailableSubcategories([]);
                console.log("🔍 FORM: No subcategories found");
            }
        } catch (error) {
            console.error('🔍 FORM: Failed to load subcategories:', error);
            setAvailableSubcategories([]);
        }
    };

    const handleCategoryChange = (categoryId) => {
        console.log(`🔍 FORM: Category changed to: ${categoryId}`);
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            sub_category_id: '' // Clear subcategory when category changes
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`🔍 FORM: Field changed - ${name}: ${value}`);
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateFormData = () => {
        console.log("🔍 FORM: Validating form data");
        const newErrors = {};
        
        if (!formData.product_name.trim()) {
            newErrors.product_name = 'Product name is required';
        } else if (formData.product_name.trim().length < 3) {
            newErrors.product_name = 'Product name must be at least 3 characters';
        }
        
        if (!formData.category_id) {
            newErrors.category_id = 'Category is required';
        }
        
        if (!formData.sub_category_id) {
            newErrors.sub_category_id = 'Subcategory is required';
        }
        
        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Description cannot exceed 1000 characters';
        }
        
        console.log("🔍 FORM: Validation errors:", newErrors);
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🔍 FORM: Submitting form...");
        
        const validationErrors = validateFormData();
        if (Object.keys(validationErrors).length > 0) {
            console.log("🔍 FORM: Validation failed");
            setErrors(validationErrors);
            return;
        }
        
        setIsSubmitting(true);
        setErrors({});
        
        try {
            // Prepare data for backend
            const productData = {
                product_name: formData.product_name.trim(),
                description: formData.description.trim() || null,
                brand_id: formData.brand_id || null,
                sub_category_id: formData.sub_category_id, // Important: use sub_category_id (not subcategory_id)
                status: formData.status
            };
            
            console.log("🔍 FORM: Submitting product data:", productData);
            
            let result;
            if (productId) {
                console.log(`🔍 FORM: Updating product ${productId}`);
                result = await updateProduct(productId, productData);
            } else {
                console.log("🔍 FORM: Creating new product");
                result = await createProduct(productData);
            }
            
            if (result) {
                console.log("🔍 FORM: Success! Result:", result);
                onSuccess(result);
            } else {
                console.error("🔍 FORM: API returned null result");
                setErrors({ submit: 'Failed to save product' });
            }
        } catch (error) {
            console.error('🔍 FORM: Form submission error:', error);
            setErrors({ submit: error.message || 'Failed to save product' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="product-form-modal">
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading product data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-form-modal">
            <div className="product-form-header">
                <h2 className="form-title">
                    <i className="fas fa-box"></i>
                    {productId ? 'Edit Product' : 'Create New Product'}
                </h2>
                <button className="close-form-btn" onClick={onCancel} disabled={isSubmitting}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form-content">
                <div className="form-grid">
                    <div className="form-section">
                        <h3 className="section-title">
                            <i className="fas fa-info-circle"></i>
                            Basic Information
                        </h3>
                        
                        <div className="form-group">
                            <label className="form-label required">
                                <i className="fas fa-tag"></i>
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="product_name"
                                value={formData.product_name}
                                onChange={handleChange}
                                className={`form-input ${errors.product_name ? 'error' : ''}`}
                                placeholder="Enter product name"
                                disabled={isSubmitting}
                                maxLength={200}
                            />
                            <div className="input-footer">
                                {errors.product_name && (
                                    <span className="error-message">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {errors.product_name}
                                    </span>
                                )}
                                <span className="char-count">
                                    {formData.product_name.length}/200 characters
                                </span>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-align-left"></i>
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={`form-textarea ${errors.description ? 'error' : ''}`}
                                placeholder="Enter product description (optional)"
                                rows={4}
                                disabled={isSubmitting}
                                maxLength={1000}
                            />
                            <div className="input-footer">
                                {errors.description && (
                                    <span className="error-message">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {errors.description}
                                    </span>
                                )}
                                <span className="char-count">
                                    {formData.description.length}/1000 characters
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3 className="section-title">
                            <i className="fas fa-folder"></i>
                            Categorization
                        </h3>
                        
                        <div className="form-group">
                            <label className="form-label required">
                                <i className="fas fa-sitemap"></i>
                                Category
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className={`form-select ${errors.category_id ? 'error' : ''}`}
                                disabled={isSubmitting || categoryLoading}
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category.category_id} value={category.category_id}>
                                        {category.category_name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <span className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.category_id}
                                </span>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label required">
                                <i className="fas fa-folder-open"></i>
                                Subcategory
                            </label>
                            <select
                                name="sub_category_id"
                                value={formData.sub_category_id}
                                onChange={handleChange}
                                className={`form-select ${errors.sub_category_id ? 'error' : ''}`}
                                disabled={isSubmitting || !formData.category_id}
                            >
                                <option value="">{formData.category_id ? 'Select Subcategory' : 'Select a category first'}</option>
                                {availableSubcategories.map(subcategory => (
                                    <option key={subcategory.sub_category_id} value={subcategory.sub_category_id}>
                                        {subcategory.sub_category_name}
                                    </option>
                                ))}
                            </select>
                            {formData.sub_category_id && !errors.sub_category_id && (
                                <div className="field-info success">
                                    <i className="fas fa-check-circle"></i>
                                    Subcategory selected
                                </div>
                            )}
                            {errors.sub_category_id && (
                                <span className="error-message">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.sub_category_id}
                                </span>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-tags"></i>
                                Brand
                            </label>
                            <select
                                name="brand_id"
                                value={formData.brand_id}
                                onChange={handleChange}
                                className="form-select"
                                disabled={isSubmitting}
                            >
                                <option value="">No Brand (Optional)</option>
                                {brands.map(brand => (
                                    <option key={brand.brand_id} value={brand.brand_id}>
                                        {brand.brand_name}
                                    </option>
                                ))}
                            </select>
                            <div className="field-hint">
                                <i className="fas fa-lightbulb"></i>
                                Optional: Adding a brand helps customers find products
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-toggle-on"></i>
                                Status
                            </label>
                            <div className="status-options">
                                <label className="status-option">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="ACTIVE"
                                        checked={formData.status === 'ACTIVE'}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="status-label active">
                                        <i className="fas fa-check-circle"></i>
                                        Active
                                    </span>
                                </label>
                                <label className="status-option">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="INACTIVE"
                                        checked={formData.status === 'INACTIVE'}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                    <span className="status-label inactive">
                                        <i className="fas fa-pause-circle"></i>
                                        Inactive
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                {errors.submit && (
                    <div className="form-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{errors.submit}</span>
                    </div>
                )}
                
                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        <i className="fas fa-times"></i>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                {productId ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                {productId ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;