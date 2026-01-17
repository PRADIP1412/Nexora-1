// frontend/src/pages/Home/Home.jsx - MODIFIED TO USE ProductCard

import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../api/product";
import ProductCard from "../../components/ProductCard/ProductCard"; // 🚨 Ensure this import is correct🚨
import { Link } from 'react-router-dom';
import { toastSuccess, toastError, toastWarning, toastInfo } from '../../utils/customToast';
import "./Home.css";




const Home = () => {

  




  const gradientColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];
  const [products, setProducts] = useState({ items: [], total: 0 });
  const [activeSort, setActiveSort] = useState("Newest First");
  const [selectedFilters, setSelectedFilters] = useState({
    type: null,
    brand: null,
    price_range: null,
    rating: null,
  });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
// In Home.jsx - Add this near the top of your component

  // ✅ Fetch products from backend with filters and sorting
  const fetchProductsData = async (page = 1, sort = activeSort, filters = selectedFilters) => {
    setLoading(true);
    // Combine filters into min_price and max_price if price_range is set
    const params = {
      page,
      per_page: 20,
      sort_by: mapSortOption(sort),
      ...filters,
    };
    
    // Handle price range mapping
    if (filters.price_range) {
        const [min, max] = filters.price_range.split('-');
        params.min_price = parseFloat(min);
        params.max_price = max.includes('+') ? undefined : parseFloat(max);
        delete params.price_range;
    }

    try {
      const response = await fetchProducts(params);
      if (response.success) {
        setProducts(response.data);
      } else {
        console.error("Failed to load products.");
        setProducts({ items: [], total: 0, total_pages: 0 }); // Clear items on failure
      }
    } catch (error) {
      console.error("Product Fetch Error:", error);
    } finally {
        setLoading(false);
    }
  };

  // ✅ Map frontend sort names to backend query values
  const mapSortOption = (sortOption) => {
    switch (sortOption) {
      case "Price: Low to High":
        return "price_low";
      case "Price: High to Low":
        return "price_high";
      case "Name: A to Z":
        return "name_asc";
      case "Name: Z to A":
        return "name_desc";
      case "Newest First":
      default:
        return "newest";
    }
  };

  // ✅ Handles dropdown filter option selection
  const handleFilterSelect = (key, value) => {
    // Prevent menu closure until data is fetched
    setLoading(true); 
    
    // Toggle logic for filters
    const isCurrentlySelected = selectedFilters[key] === value;
    const updatedFilters = { 
        ...selectedFilters, 
        [key]: isCurrentlySelected ? null : value // Toggle off if already selected
    };
    
    setSelectedFilters(updatedFilters);
    fetchProductsData(1, activeSort, updatedFilters);
    setOpenFilter(null); // close menu
  };

  // ✅ Handles sorting changes
  const handleSortChange = (option) => {
    setActiveSort(option);
    fetchProductsData(1, option, selectedFilters);
    setShowSortMenu(false);
  };

  // ✅ Toggle filter dropdown
  const toggleFilterMenu = (filter) => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  // ✅ Close all menus when clicking outside
  useEffect(() => {
    fetchProductsData(); // Fetch initial data on mount
    
    const closeMenus = () => {
      setOpenFilter(null);
      setShowSortMenu(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []); // Run only once

  const ProductContent = () => {
      if (loading) {
          return <div className="loading-message">Loading products...</div>;
      }
      if (products.items.length === 0) {
          return <p className="no-products">No products found for selected filters.</p>;
      }
      
      return (
          <div className="products-grid">
              {products.items.map((product, index) => {
                  // Safely destructure data from the default_variant nested object
                  const variant = product.default_variant;
                  
                  return (
                    // In ProductsList.jsx and Home.jsx
                    <ProductCard
                      key={product.product_id}
                      id={product.product_id}
                      title={product.product_name}
                      description={product.description || "High quality product"}
                      price={variant.final_price || variant.price || 0}
                      originalPrice={variant.discount_value > 0 ? variant.price : null}
                      image={variant.images?.[0]?.url || null}
                      rating={product.rating || 4.5}
                      reviewCount={product.review_count || variant.stock_quantity * 5}
                      gradient={gradientColors[index % gradientColors.length]}
                      variantId={variant.variant_id}   // ✅ ADD THIS LINE
                    />

                );
              })}
          </div>
      );
  };


  return (


  
    <div className="home-page">
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-text">
              <span className="hero-badge">Limited Time Offer</span>
              <h1 className="hero-title">Premium Wireless<br />Headphones</h1>
              <p className="hero-subtitle">Get up to 50% off on selected headphones</p>
              <Link to="/products" className="hero-btn">
                Shop Now <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="hero-image">
              <div className="hero-circle"></div>
              <i className="fas fa-headphones hero-icon"></i>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="products-section">
          <div className="products-container">
            {/* Filter Bar (Logic remains the same) */}
            <div className="filter-bar">
              <div className="filter-left">
                <h2 className="products-title">Featured Products</h2>
                <span className="products-count">
                  Showing {products.items.length > 0 ? `1-${products.items.length}` : 0} of {products.total} results
                </span>
              </div>

              <div className="filter-right">
                {/* --- Filter Dropdowns --- */}
                <div className="filter-group">
                  {["Type", "Price", "Brand", "Rating"].map((filter) => (
                    <div key={filter} className="filter-dropdown">
                      <button
                        className="filter-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFilterMenu(filter);
                        }}
                      >
                        <span>{filter}</span>
                        <i className="fas fa-chevron-down"></i>
                      </button>

                      {openFilter === filter && (
                        <div className="filter-menu" onClick={(e) => e.stopPropagation()}>
                          {filter === "Type" && (
                            // Mapping type to categories
                            <>
                              <button onClick={() => handleFilterSelect("category_id", 1)}>Electronics</button>
                              <button onClick={() => handleFilterSelect("category_id", 2)}>Home & Office</button>
                              {/* Add 'Clear' button functionality */}
                              <button onClick={() => handleFilterSelect("category_id", null)}>Clear</button>
                            </>
                          )}

                          {filter === "Price" && (
                            // Mapping price range to backend min/max
                            <>
                              <button onClick={() => handleFilterSelect("price_range", "0-100")}>$0 - $100</button>
                              <button onClick={() => handleFilterSelect("price_range", "100-500")}>$100 - $500</button>
                              <button onClick={() => handleFilterSelect("price_range", "500-2000")}>$500 - $2000</button>
                              <button onClick={() => handleFilterSelect("price_range", "2000+")}>$2000+</button>
                              <button onClick={() => handleFilterSelect("price_range", null)}>Clear</button>
                            </>
                          )}
                          
                          {/* Brand and Rating filters remain as placeholders for now */}
                          {filter === "Brand" && (
                            <>
                              <button onClick={() => handleFilterSelect("brand_id", 1)}>Nexus Gear</button>
                              <button onClick={() => handleFilterSelect("brand_id", 2)}>ChronoTech</button>
                              <button onClick={() => handleFilterSelect("brand_id", null)}>Clear</button>
                            </>
                          )}
                          {filter === "Rating" && (
                            <>
                              <button onClick={() => handleFilterSelect("rating", "4")}>4★ & above</button>
                              <button onClick={() => handleFilterSelect("rating", "3")}>3★ & above</button>
                              <button onClick={() => handleFilterSelect("rating", null)}>Clear</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* --- Sort Dropdown --- */}
                <div className="sort-dropdown">
                  <button
                    className="sort-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSortMenu(!showSortMenu);
                    }}
                  >
                    <span>Sort by: {activeSort}</span>
                    <i className="fas fa-chevron-down"></i>
                  </button>
                  {showSortMenu && (
                    <div className="sort-menu" onClick={(e) => e.stopPropagation()}>
                      {[
                        "Newest First",
                        "Price: Low to High",
                        "Price: High to Low",
                        "Name: A to Z",
                        "Name: Z to A",
                      ].map((option) => (
                        <button
                          key={option}
                          className={`sort-option ${activeSort === option ? "active" : ""}`}
                          onClick={() => handleSortChange(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 🚨 PRODUCTS GRID RENDERING 🚨 */}
            <ProductContent />

            {/* Pagination Placeholder */}
            {products.total_pages > 1 && (
              <div className="pagination-controls">
                <button disabled={products.page === 1}>Previous</button>
                <span>Page {products.page} of {products.total_pages}</span>
                <button disabled={products.page === products.total_pages}>Next</button>
              </div>
            )}
            
          </div>
        </section>
      </main>
    </div>
    
  );
};

export default Home;