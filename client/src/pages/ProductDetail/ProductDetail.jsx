import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import { fetchProductDetail, fetchProductReviews, createProductReview, fetchProducts } from '../../api/product';
import { useAuth } from '../../context/AuthContext';
import './ProductDetail.css';
import { useCartContext } from "../../context/CartContext"; // Changed from useCart
import { useWishlistContext } from "../../context/WishlistContext"; // Changed from useWishlist
import { toastSuccess, toastError } from "../../utils/customToast";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItemToCart } = useCartContext(); // Changed to useCartContext
    const { addItemToWishlist, removeItemFromWishlist, isInWishlist } = useWishlistContext(); // Changed to useWishlistContext
    const { isAuthenticated, user } = useAuth();
    
    console.log('🔍 PRODUCT DETAIL PARAMS:', { id, params: useParams() });
    
    useEffect(() => {
        console.log('🔍 PRODUCT DETAIL: ID from useParams:', id);
        console.log('🔍 PRODUCT DETAIL: Full URL:', window.location.href);
    }, [id]);
    
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [recommendations, setRecommendations] = useState([]);
    const [reviews, setReviews] = useState({ items: [], total: 0 });
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', title: '' });
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Fetch product details
    useEffect(() => {
        const loadProductDetail = async () => {
            setLoading(true);
            try {
                console.log(`🔍 PRODUCT DETAIL: Loading product ID: ${id}`);
                const response = await fetchProductDetail(id);
                
                if (response.success) {
                    const productData = response.data;
                    console.log(`🔍 PRODUCT DETAIL: Loaded product data:`, productData);
                    console.log(`🔍 PRODUCT DETAIL: Product variants:`, productData.variants);
                    
                    setProduct(productData);
                    
                    // Set default variant (first available or default marked)
                    const defaultVariant = productData.variants.find(v => v.is_default) || productData.variants[0];
                    if (defaultVariant) {
                        setSelectedVariant(defaultVariant);
                        console.log(`🔍 PRODUCT DETAIL: Set default variant:`, defaultVariant);
                    } else if (productData.variants.length > 0) {
                        setSelectedVariant(productData.variants[0]);
                        console.log(`🔍 PRODUCT DETAIL: Set first variant as default:`, productData.variants[0]);
                    }
                    
                    // Load recommendations
                    loadRecommendations();
                } else {
                    console.error('🔍 PRODUCT DETAIL: Failed to load product:', response.message);
                }
            } catch (error) {
                console.error('🔍 PRODUCT DETAIL: Error loading product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProductDetail();
        }
    }, [id]);

    // Fetch reviews when variant changes
    useEffect(() => {
        if (selectedVariant) {
            loadReviews();
        }
    }, [selectedVariant]);

    const loadReviews = async () => {
        if (!selectedVariant) return;
        
        setReviewsLoading(true);
        try {
            console.log(`🔍 REVIEWS: Loading reviews for variant: ${selectedVariant.variant_id}`);
            const response = await fetchProductReviews(selectedVariant.variant_id);
            
            if (response.success) {
                setReviews(response.data);
                console.log(`🔍 REVIEWS: Loaded ${response.data.items.length} reviews`);
            } else {
                console.error('🔍 REVIEWS: Failed to load reviews:', response.message);
                setReviews({ items: [], total: 0 });
            }
        } catch (error) {
            console.error('🔍 REVIEWS: Error loading reviews:', error);
            setReviews({ items: [], total: 0 });
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadRecommendations = async () => {
        try {
            const response = await fetchProducts({ 
                per_page: 4, 
                sort_by: 'newest' 
            });
            
            if (response.success) {
                // Filter out current product from recommendations
                const filteredRecs = response.data.items.filter(item => item.product_id !== parseInt(id));
                setRecommendations(filteredRecs.slice(0, 4));
            }
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/products/${id}` } });
            return false;
        }

        if (!selectedVariant) {
            toastError("Please select a variant");
            return false;
        }

        try {
            const response = await addItemToCart(selectedVariant.variant_id, quantity);

            if (response.success) {
                toastSuccess("Product added to cart");
                return true;
            } else {
                if (response.unauthorized) {
                    navigate("/login", { state: { from: `/products/${id}` } });
                } else {
                    toastError(response.message || "Failed to add to cart");
                }
                return false;
            }
        } catch (error) {
            console.error("Add To Cart Error:", error);
            toastError("Error adding product to cart");
            return false;
        }
    };

    const handleBuyNow = async () => {
        const result = await handleAddToCart();
        if (result) navigate("/cart");
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/products/${id}` } });
            return;
        }

        if (!selectedVariant) {
            toastError("Please select a variant");
            return;
        }

        setWishlistLoading(true);
        try {
            if (isInWishlist(selectedVariant.variant_id)) {
                const result = await removeItemFromWishlist(selectedVariant.variant_id);
                if (result.success) {
                    toastSuccess("Removed from wishlist");
                } else {
                    toastError(result.message || "Failed to remove from wishlist");
                }
            } else {
                const result = await addItemToWishlist(selectedVariant.variant_id);
                if (result.success) {
                    toastSuccess("Added to wishlist!");
                } else {
                    toastError(result.message || "Failed to add to wishlist");
                }
            }
        } catch (error) {
            console.error("Wishlist Error:", error);
            toastError("Error updating wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleQuantityChange = (type) => {
        if (!selectedVariant) return;
        
        const maxStock = selectedVariant.stock_quantity || 1;
        if (type === 'increment' && quantity < maxStock) {
            setQuantity(quantity + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleVariantChange = (variant) => {
        if (variant.stock_quantity > 0) {
            setSelectedVariant(variant);
            setSelectedImage(0);
            setQuantity(1);
            console.log(`🔍 VARIANT: Changed to ${variant.variant_name}`);
        }
    };

    const handleAddReview = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/products/${id}` } });
            return;
        }

        if (!newReview.title.trim() || !newReview.comment.trim()) {
            alert('Please fill in all review fields');
            return;
        }

        try {
            const reviewData = {
                variant_id: selectedVariant.variant_id,
                rating: newReview.rating,
                title: newReview.title,
                comment: newReview.comment
            };

            const response = await createProductReview(reviewData);
            
            if (response.success) {
                alert('Review added successfully!');
                setNewReview({ rating: 5, comment: '', title: '' });
                loadReviews(); // Reload reviews
            } else {
                alert(response.message || 'Failed to add review');
            }
        } catch (error) {
            console.error('Error adding review:', error);
            alert('Failed to add review');
        }
    };

    const renderStars = (rating, size = 'normal') => {
        const stars = [];
        const starClass = size === 'large' ? 'star-large' : '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars.push(<i key={i} className={`fas fa-star ${starClass}`}></i>);
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                stars.push(<i key={i} className={`fas fa-star-half-alt ${starClass}`}></i>);
            } else {
                stars.push(<i key={i} className={`far fa-star ${starClass}`}></i>);
            }
        }
        return stars;
    };

    const gradientColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];

    if (loading) {
        return (
            <div className="product-detail-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-circle"></i>
                    <h2>Product not found</h2>
                    <button onClick={() => navigate('/')}>Go to Home</button>
                </div>
            </div>
        );
    }

    // Calculate discount if original price exists
    const discount = selectedVariant && selectedVariant.discount_value > 0 
        ? Math.round((selectedVariant.discount_value / selectedVariant.price) * 100)
        : 0;

    // Get current variant images or fallback to first variant images
    const currentImages = selectedVariant?.images || (product.variants && product.variants[0]?.images) || [];
    const defaultImage = currentImages.length > 0 ? currentImages[0].url : null;

    // Check if current variant is in wishlist
    const isCurrentInWishlist = selectedVariant ? isInWishlist(selectedVariant.variant_id) : false;

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <a href="/">Home</a>
                    <i className="fas fa-chevron-right"></i>
                    <a href={`/category/${product.category?.category_name}`}>
                        {product.category?.category_name || 'Category'}
                    </a>
                    <i className="fas fa-chevron-right"></i>
                    <span>{product.product_name}</span>
                </nav>

                {/* Product Main Section */}
                <div className="product-main">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <div className="thumbnail-list">
                            {currentImages.map((img, index) => (
                                <div
                                    key={img.image_id || index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={img.url} alt={`${product.product_name} ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                        <div className="main-image">
                            {currentImages.length > 0 ? (
                                <img 
                                    src={currentImages[selectedImage]?.url || defaultImage} 
                                    alt={product.product_name} 
                                />
                            ) : (
                                <div className="no-image">No Image Available</div>
                            )}
                            <button 
                                className={`wishlist-btn-detail ${isCurrentInWishlist ? 'active' : ''}`}
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading || !selectedVariant}
                            >
                                {wishlistLoading ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : isCurrentInWishlist ? (
                                    <i className="fas fa-heart"></i>
                                ) : (
                                    <i className="far fa-heart"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="product-info-detail">
                        <h1 className="product-title-detail">{product.product_name}</h1>
                        
                        {/* Brand */}
                        {product.brand && (
                            <div className="product-brand">
                                Brand: <strong>{product.brand.brand_name}</strong>
                            </div>
                        )}

                        {/* Variants */}
                        {product.variants && product.variants.length > 1 && (
                            <div className="product-variants">
                                <h3>Options:</h3>
                                <div className="variant-options">
                                    {product.variants.map((variant, index) => (
                                        <button
                                            key={variant.variant_id}
                                            className={`variant-btn ${selectedVariant?.variant_id === variant.variant_id ? 'active' : ''} ${variant.stock_quantity === 0 ? 'disabled' : ''}`}
                                            onClick={() => handleVariantChange(variant)}
                                            disabled={variant.stock_quantity === 0}
                                        >
                                            {variant.variant_name || `Option ${index + 1}`}
                                            {variant.stock_quantity === 0 && (
                                                <span className="out-of-stock">Out of Stock</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price */}
                        {selectedVariant && (
                            <div className="product-price-detail">
                                <span className="current-price">
                                    ₹{selectedVariant.final_price?.toLocaleString() || selectedVariant.price?.toLocaleString()}
                                </span>
                                {selectedVariant.discount_value > 0 && (
                                    <>
                                        <span className="original-price">
                                            ₹{selectedVariant.price?.toLocaleString()}
                                        </span>
                                        <span className="discount-badge">{discount}% OFF</span>
                                    </>
                                )}
                            </div>
                        )}

                        <p className="product-description-detail">{product.description}</p>

                        {/* Quantity */}
                        {selectedVariant && (
                            <div className="quantity-section">
                                <h3>Quantity:</h3>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => handleQuantityChange('decrement')} 
                                        disabled={quantity <= 1}
                                    >
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <span className="quantity-display">{quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange('increment')} 
                                        disabled={quantity >= (selectedVariant.stock_quantity || 1)}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                                <span className="stock-info">
                                    {selectedVariant.stock_quantity || 0} items available
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button 
                                className="btn-add-to-cart-detail" 
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                            >
                                <i className="fas fa-shopping-cart"></i>
                                {selectedVariant?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button 
                                className="btn-buy-now" 
                                onClick={handleBuyNow}
                                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                            >
                                <i className="fas fa-bolt"></i>
                                Buy Now
                            </button>
                        </div>

                        {/* Product Features */}
                        <div className="product-features">
                            <h3>Product Highlights:</h3>
                            <ul>
                                <li><i className="fas fa-check-circle"></i> Premium Quality</li>
                                <li><i className="fas fa-check-circle"></i> Fast Shipping</li>
                                <li><i className="fas fa-check-circle"></i> Secure Payment</li>
                                <li><i className="fas fa-check-circle"></i> Easy Returns</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Product Details
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({reviews.total})
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'details' && (
                            <div className="details-tab">
                                <h3>Product Information</h3>
                                <div className="product-specifications">
                                    {product.brand && (
                                        <div className="spec-item">
                                            <strong>Brand:</strong> {product.brand.brand_name}
                                        </div>
                                    )}
                                    {product.category && (
                                        <div className="spec-item">
                                            <strong>Category:</strong> {product.category.category_name}
                                        </div>
                                    )}
                                    {product.subcategory && (
                                        <div className="spec-item">
                                            <strong>Subcategory:</strong> {product.subcategory.sub_category_name}
                                        </div>
                                    )}
                                    {selectedVariant && (
                                        <>
                                            <div className="spec-item">
                                                <strong>Variant:</strong> {selectedVariant.variant_name || 'Default'}
                                            </div>
                                            <div className="spec-item">
                                                <strong>Stock:</strong> {selectedVariant.stock_quantity || 0} units available
                                            </div>
                                            <div className="spec-item">
                                                <strong>Status:</strong> {selectedVariant.status || 'ACTIVE'}
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <h3>Description</h3>
                                <p className="full-description">{product.description}</p>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-tab">
                                {/* Add Review Form */}
                                <div className="add-review-section">
                                    <h3>Add Your Review</h3>
                                    <div className="review-form">
                                        <div className="form-group">
                                            <label>Rating:</label>
                                            <div className="rating-input">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className={`star-btn ${newReview.rating >= star ? 'active' : ''}`}
                                                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                                                    >
                                                        <i className="fas fa-star"></i>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                placeholder="Review Title"
                                                value={newReview.title}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                                                className="review-title-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                placeholder="Write your review..."
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                                rows="4"
                                                className="review-comment-input"
                                            ></textarea>
                                        </div>
                                        <button 
                                            className="btn-submit-review"
                                            onClick={handleAddReview}
                                        >
                                            Submit Review
                                        </button>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="reviews-list-section">
                                    <h3>Customer Reviews</h3>
                                    
                                    {reviewsLoading ? (
                                        <div className="loading-reviews">Loading reviews...</div>
                                    ) : reviews.items.length > 0 ? (
                                        <div className="reviews-list">
                                            {reviews.items.map((review) => (
                                                <div key={review.review_id} className="review-card">
                                                    <div className="review-header">
                                                        <div className="reviewer-info">
                                                            <div className="reviewer-avatar">
                                                                {review.user_name ? review.user_name.charAt(0) : 'U'}
                                                            </div>
                                                            <div>
                                                                <div className="reviewer-name">
                                                                    {review.user_name || 'Anonymous User'}
                                                                </div>
                                                                <div className="review-date">
                                                                    {new Date(review.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="review-rating">
                                                            {renderStars(review.rating)}
                                                        </div>
                                                    </div>
                                                    <h4 className="review-title">{review.title}</h4>
                                                    <p className="review-comment">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-reviews">
                                            <i className="fas fa-comment-slash"></i>
                                            <p>No reviews yet. Be the first to review this product!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="recommendations-section">
                        <h2 className="section-title">Customers Also Viewed</h2>
                        <div className="recommendations-grid">
                            {recommendations.map((rec, index) => {
                                const variant = rec.default_variant || {};
                                return (
                                    <ProductCard
                                        key={rec.product_id}
                                        id={rec.product_id}
                                        title={rec.product_name}
                                        description={rec.description || "High quality product"}
                                        price={variant.final_price || variant.price || 0}
                                        originalPrice={variant.discount_value > 0 ? variant.price : null}
                                        image={variant.images?.[0]?.url || null}
                                        rating={rec.rating || 4.5}
                                        reviewCount={rec.review_count || Math.floor(Math.random() * 100)}
                                        gradient={gradientColors[index % gradientColors.length]}
                                        variantId={variant.variant_id}
                                        inStock={variant.stock_quantity > 0}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;