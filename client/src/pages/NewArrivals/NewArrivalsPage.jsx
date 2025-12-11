import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchNewArrivals, 
  fetchTrendingProducts, 
  fetchProductsByCategory,
  fetchCategories 
} from '../../api/product';
import './NewArrivalsPage.css';

const NewArrivalsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [newArrivals, setNewArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    totalProducts: 0,
    trendingCount: 0,
    newThisWeek: 0
  });

  // Generate local SVG placeholder (NO external dependencies)
  const generateLocalSVG = (text, width = 400, height = 300, bgColor = '667eea', textColor = 'ffffff') => {
    const safeText = String(text || 'Product').substring(0, 20);
    // Escape special characters for XML
    const escapedText = safeText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="#${textColor}" font-family="Arial, sans-serif" 
            font-size="${width < 100 ? '12' : '16'}">
        ${escapedText}
      </text>
    </svg>`;
    
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // Helper function to safely get image URL
  const getProductImageUrl = (product, categoryColor) => {
    if (!product) {
      return generateLocalSVG('Product', 400, 300, categoryColor || '667eea');
    }
    
    // Check if product has image
    if (product.default_variant?.images?.[0]?.url) {
      return product.default_variant.images[0].url;
    }
    
    // Use product name for local SVG placeholder
    const productName = product.product_name || 'Product';
    return generateLocalSVG(productName, 400, 300, categoryColor || '667eea');
  };

  // Helper function for trending product image
  const getTrendingProductImageUrl = (product) => {
    if (!product) {
      return generateLocalSVG('Product', 80, 80, '667eea');
    }
    
    if (product.default_variant?.images?.[0]?.url) {
      return product.default_variant.images[0].url;
    }
    
    const productName = product.product_name || 'Product';
    return generateLocalSVG(productName.substring(0, 2), 80, 80, '667eea');
  };

  // Handle image error with LOCAL fallback (NO external calls)
  const handleImageError = (e) => {
    const altText = e.target.alt || 'Product';
    const width = e.target.width || 400;
    const height = e.target.height || 300;
    const bgColor = width === 80 ? '667eea' : '94a3b8';
    
    // Generate local SVG
    const safeText = altText.substring(0, width === 80 ? 2 : 20);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            fill="#ffffff" font-family="Arial" font-size="${width === 80 ? '12' : '16'}">
        ${safeText}
      </text>
    </svg>`;
    
    e.target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    e.target.onerror = null; // Prevent infinite loop
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Load categories
        const categoriesResult = await fetchCategories();
        if (categoriesResult.success) {
          setAllCategories(categoriesResult.data || []);
        }
        
        // Load trending products
        await loadTrendingProducts();
        
        // Load new arrivals
        await loadNewArrivals();
        
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Load new arrivals based on filter and sort
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (filter === 'all') {
          const result = await fetchNewArrivals({
            per_page: 24,
            sort_by: sortBy
          });
          if (result.success) {
            const items = result.data.items || [];
            setNewArrivals(items);
            setStats(prev => ({
              ...prev,
              totalProducts: result.data.total || items.length,
              newThisWeek: items.length
            }));
          } else {
            setNewArrivals([]);
          }
        } else {
          const result = await fetchProductsByCategory(filter, {
            per_page: 24,
            sort_by: sortBy
          });
          if (result.success) {
            const items = result.data.items || [];
            setNewArrivals(items);
            setStats(prev => ({
              ...prev,
              totalProducts: result.data.total || items.length
            }));
          } else {
            setNewArrivals([]);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setNewArrivals([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filter, sortBy]);

  // Load trending products
  const loadTrendingProducts = async () => {
    try {
      const result = await fetchTrendingProducts(3);
      if (result.success) {
        const items = result.data.items || [];
        setTrendingProducts(items);
        setStats(prev => ({
          ...prev,
          trendingCount: result.data.total || items.length
        }));
      } else {
        setTrendingProducts([]);
      }
    } catch (error) {
      console.error('Error loading trending products:', error);
      setTrendingProducts([]);
    }
  };

  // Load new arrivals
  const loadNewArrivals = async () => {
    try {
      const result = await fetchNewArrivals({
        per_page: 24,
        sort_by: sortBy
      });
      
      if (result.success) {
        const items = result.data.items || [];
        setNewArrivals(items);
        setStats(prev => ({
          ...prev,
          totalProducts: result.data.total || items.length,
          newThisWeek: items.length
        }));
      } else {
        setNewArrivals([]);
      }
    } catch (error) {
      console.error('Error loading new arrivals:', error);
      setNewArrivals([]);
    }
  };

  // Helper functions
  const getCategoryColor = (category) => {
    const colors = {
      'Electronics': '667eea',
      'Fashion': 'ff6b6b',
      'Home & Kitchen': '10b981',
      'Sports': 'f59e0b',
      'Beauty': '8b5cf6',
      'Books': '6366f1',
      'Uncategorized': '94a3b8'
    };
    return colors[category] || colors['Uncategorized'];
  };

  const isProductNew = (createdAt) => {
    if (!createdAt) return false;
    try {
      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      return diffDays < 7;
    } catch (error) {
      return false;
    }
  };

  const getDaysAgo = (createdAt) => {
    if (!createdAt) return 0;
    try {
      const createdDate = new Date(createdAt);
      const now = new Date();
      return Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };

  const getAddedDateText = (createdAt) => {
    const daysAgo = getDaysAgo(createdAt);
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return 'Recently added';
  };

  const handleAddToCart = (product, productName) => {
    if (!product || !product.default_variant) {
      console.error('Product data is incomplete:', product);
      return;
    }

    if (isAuthenticated) {
      addToCart(product.default_variant.variant_id, 1);
      // You can replace this with a proper notification system
      alert(`Added ${productName} to cart!`);
    } else {
      navigate('/login', { state: { redirectTo: '/cart' } });
    }
  };

  const handleQuickView = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleBuyNow = (product, productName) => {
    if (!product || !product.default_variant) {
      console.error('Product data is incomplete:', product);
      return;
    }

    if (isAuthenticated) {
      addToCart(product.default_variant.variant_id, 1);
      navigate('/checkout');
    } else {
      navigate('/login', { state: { redirectTo: '/checkout' } });
    }
  };

  const categories = ['all', ...allCategories.map(cat => cat.category_name).filter(name => name)];

  return (
    <div className="new-arrivals-page">
      {/* ===== Hero Banner ===== */}
      <div className="arrivals-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">✨ New Arrivals</h1>
          <p className="hero-subtitle">
            Discover the latest products fresh in stock! Be the first to experience innovation.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <i className="fas fa-rocket"></i>
              <div>
                <span className="stat-number">{stats.newThisWeek}+</span>
                <span className="stat-label">New This Week</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-bolt"></i>
              <div>
                <span className="stat-number">{stats.trendingCount}</span>
                <span className="stat-label">Trending Now</span>
              </div>
            </div>
            <div className="stat-item">
              <i className="fas fa-box"></i>
              <div>
                <span className="stat-number">{stats.totalProducts}+</span>
                <span className="stat-label">Total Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="arrivals-container">
        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="filters">
            <div className="filter-group">
              <span className="filter-label">
                <i className="fas fa-filter"></i>
                Filter by:
              </span>
              <div className="category-filters">
                {categories.slice(0, 7).map(category => (
                  <button
                    key={category}
                    className={`category-filter ${filter === category ? 'active' : ''}`}
                    onClick={() => setFilter(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="sort-options">
            <span className="sort-label">
              <i className="fas fa-sort"></i>
              Sort by:
            </span>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Trending Banner */}
        {trendingProducts.length > 0 && (
          <div className="trending-banner">
            <div className="trending-icon">
              <i className="fas fa-fire"></i>
            </div>
            <div className="trending-content">
              <h3>🔥 Trending This Week</h3>
              <p>Customers are loving these new arrivals!</p>
            </div>
            <div className="trending-products">
              {trendingProducts.map(product => {
                const imageUrl = getTrendingProductImageUrl(product);
                
                return (
                  <div 
                    key={product.product_id || Math.random()} 
                    className="trending-product"
                    onClick={() => navigate(`/products/${product.product_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={imageUrl}
                      alt={product.product_name || 'Product'}
                      onError={handleImageError}
                      loading="lazy"
                      width="80"
                      height="80"
                    />
                    <div className="trending-info">
                      <span className="trending-name">
                        {product.product_name || 'Product'}
                      </span>
                      <span className="trending-price">
                        ${product.default_variant?.final_price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="product-card-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="arrivals-grid">
              {newArrivals.map(product => {
                const isNew = isProductNew(product.created_at);
                const addedDate = getAddedDateText(product.created_at);
                const categoryName = product.category?.category_name || 'Uncategorized';
                const categoryColor = getCategoryColor(categoryName);
                const productName = product.product_name || 'Product';
                
                // Get image URL
                const imageUrl = getProductImageUrl(product, categoryColor);
                
                return (
                  <div key={product.product_id} className="arrival-card">
                    {/* Badges */}
                    <div className="card-badges">
                      {isNew && <span className="badge new">NEW</span>}
                      <span className="badge date">{addedDate}</span>
                    </div>
                    
                    {/* Product Image */}
                    <div className="product-image">
                      <img 
                        src={imageUrl}
                        alt={productName}
                        onError={handleImageError}
                        loading="lazy"
                        width="400"
                        height="300"
                      />
                      <div className="image-overlay">
                        <button 
                          className="quick-view-btn"
                          onClick={() => handleQuickView(product.product_id)}
                        >
                          <i className="fas fa-eye"></i>
                          Quick View
                        </button>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="product-info">
                      <div className="product-meta">
                        <span 
                          className="product-category"
                          style={{ 
                            backgroundColor: `#${categoryColor}15`,
                            color: `#${categoryColor}`
                          }}
                        >
                          {categoryName}
                        </span>
                        {product.brand?.brand_name && (
                          <span className="product-brand">{product.brand.brand_name}</span>
                        )}
                      </div>
                      
                      <h3 className="product-title">{productName}</h3>
                      <p className="product-description">
                        {product.description || 'Check out this amazing new product!'}
                      </p>
                      
                      {/* Stock Status */}
                      {product.default_variant?.status && (
                        <div className="stock-status">
                          {product.default_variant.status === 'OUT_OF_STOCK' ? (
                            <span className="out-of-stock">
                              <i className="fas fa-times-circle"></i> Out of Stock
                            </span>
                          ) : product.default_variant.stock_quantity < 10 ? (
                            <span className="low-stock">
                              <i className="fas fa-exclamation-triangle"></i> Only {product.default_variant.stock_quantity} left!
                            </span>
                          ) : (
                            <span className="in-stock">
                              <i className="fas fa-check-circle"></i> In Stock
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Pricing */}
                      <div className="product-pricing">
                        <div className="price-current">
                          ${product.default_variant?.final_price?.toFixed(2) || '0.00'}
                        </div>
                        {product.default_variant?.discount_type !== 'NONE' && (
                          <>
                            <div className="price-original">
                              ${product.default_variant?.price?.toFixed(2) || '0.00'}
                            </div>
                            <div className="price-save">
                              Save ${(product.default_variant?.price - product.default_variant?.final_price).toFixed(2)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="product-actions">
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product, productName)}
                        disabled={product.default_variant?.status === 'OUT_OF_STOCK'}
                      >
                        <i className="fas fa-shopping-cart"></i>
                        {product.default_variant?.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <button 
                        className="buy-now-btn"
                        onClick={() => handleBuyNow(product, productName)}
                        disabled={product.default_variant?.status === 'OUT_OF_STOCK'}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Empty State */}
            {newArrivals.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-box-open"></i>
                </div>
                <h3>No New Arrivals Found</h3>
                <p>Try selecting a different category or check back soon for new products!</p>
                <button 
                  className="browse-btn"
                  onClick={() => setFilter('all')}
                >
                  <i className="fas fa-store"></i>
                  View All Categories
                </button>
              </div>
            )}
          </>
        )}

        {/* Features Banner */}
        <div className="features-banner">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-shipping-fast"></i>
            </div>
            <div className="feature-content">
              <h4>Free Shipping</h4>
              <p>On all orders over $50</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-undo"></i>
            </div>
            <div className="feature-content">
              <h4>30-Day Returns</h4>
              <p>Easy returns policy</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="feature-content">
              <h4>2-Year Warranty</h4>
              <p>On all electronics</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-headset"></i>
            </div>
            <div className="feature-content">
              <h4>24/7 Support</h4>
              <p>Dedicated customer service</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Never Miss a New Arrival!</h2>
            <p>Subscribe to our newsletter and get notified about the latest products.</p>
            <div className="subscribe-form">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="subscribe-input"
              />
              <button className="subscribe-btn">
                Subscribe <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrivalsPage;