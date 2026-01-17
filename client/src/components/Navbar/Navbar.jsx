import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';
import { useWishlistContext } from '../../context/WishlistContext';
import { fetchSuggestions } from '../../api/product';
import { useCartContext } from '../../context/CartContext';

// Import Notification Components
import NotificationBell from '../Notification/NotificationBell';
import NotificationDropdown from '../Notification/NotificationDropdown';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist } = useWishlistContext();
  const { getCartItemCount } = useCartContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const searchBoxRef = useRef(null);
  const categoriesContainerRef = useRef(null);
  const cartCount = getCartItemCount();

  /* ---------------------- Load recent searches ---------------------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    setRecentSearches(saved);
  }, []);

  /* ---------------------- Live Suggestions ---------------------- */
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        const res = await fetchSuggestions(searchQuery);
        if (res.success) {
          setSuggestions(res.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(searchQuery.length > 0);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  /* ---------------------- Handlers ---------------------- */
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter((q) => q !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (query) => {
    setSearchQuery(query);
    navigate(`/products?search=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('recent_searches');
    setRecentSearches([]);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollCategories = (direction) => {
    const container = categoriesContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newPos =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    container.scrollTo({ left: newPos, behavior: 'smooth' });
    setScrollPosition(newPos);
  };

  const updateArrowVisibility = () => {
    const container = categoriesContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const container = categoriesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateArrowVisibility);
      window.addEventListener('resize', updateArrowVisibility);
      updateArrowVisibility();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateArrowVisibility);
        window.removeEventListener('resize', updateArrowVisibility);
      }
    };
  }, []);

  /* ---------------------- Separate Lists ---------------------- */
  const specialSections = [
    { icon: 'fas fa-bolt', name: "Today's Deals", path: '/deals' },
    { icon: 'fas fa-star', name: 'New Arrivals', path: '/new-arrivals' },
  ];

  const categories = [
    { icon: 'fas fa-laptop', name: 'Electronics' },
    { icon: 'fas fa-shopping-basket', name: 'Grocery' },
    { icon: 'fas fa-wine-bottle', name: 'Beverages' },
    { icon: 'fas fa-home', name: 'Home & Kitchen' },
    { icon: 'fas fa-spray-can', name: 'Cleaning Supplies' },
    { icon: 'fas fa-palette', name: 'Beauty & Makeup' },
    { icon: 'fas fa-pencil-alt', name: 'Stationery' },
    { icon: 'fas fa-tshirt', name: 'Fashion' },
    { icon: 'fas fa-dumbbell', name: 'Sports' },
    { icon: 'fas fa-baby', name: 'Baby Care' },
    { icon: 'fas fa-paw', name: 'Pet Supplies' },
    { icon: 'fas fa-car', name: 'Automotive' },
    { icon: 'fas fa-tools', name: 'Tools' },
  ];

  /* ---------------------- Render ---------------------- */
  return (
    <nav className="navbar">
      {/* ===== Top Bar ===== */}
      <div className="navbar-top">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate('/')}>
            
            <h1>Nexora</h1>
          </div>

          {/* Search */}
          <div className="nav-search-wrapper" ref={searchBoxRef}>
            <form className="nav-search" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>

            {/* Suggestions */}
            {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
              <div className="search-suggestions">
                {recentSearches.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">
                      <span>Recent Searches</span>
                      <button className="clear-btn" onClick={handleClearHistory}>Clear</button>
                    </div>
                    {recentSearches.map((item, i) => (
                      <div key={i} className="suggestion-item" onClick={() => handleSelectSuggestion(item)}>
                        <i className="fas fa-history"></i> {item}
                      </div>
                    ))}
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header"><span>Suggestions</span></div>
                    {suggestions.map((sug, i) => (
                      <div key={i} className="suggestion-item" onClick={() => handleSelectSuggestion(sug)}>
                        <i className="fas fa-search"></i> {sug}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth / Cart / Notifications */}
          <div className="nav-actions">
            {/* Notifications - Only show when authenticated */}
            {isAuthenticated && (
              <div className="notification-container">
                <NotificationBell />
                <NotificationDropdown />
              </div>
            )}

            {!isAuthenticated ? (
              <>
                <Link to="/signup" className="btn-get-started">
                  <i className="fas fa-user-plus"></i>
                  <span>Get Started</span>
                </Link>
                <button onClick={() => navigate('/cart')} className="nav-link">
                  <i className="fas fa-shopping-cart"></i>
                  <span>Cart</span>
                  {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </button>
              </>
            ) : (
              <>
                <Link to="/account" className="nav-link">
                  <i className="far fa-user"></i>
                  <span>Account</span>
                </Link>
                <Link to="/wishlist" className="nav-link">
                  <i className="far fa-heart"></i>
                  <span>Wishlist</span>
                  
                </Link>
                <button onClick={() => navigate('/cart')} className="nav-link">
                  <i className="fas fa-shopping-cart"></i>
                  <span>Cart</span>
                </button>
                <button onClick={handleLogout} className="nav-link">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== Bottom Navigation ===== */}
      <div className="navbar-bottom">
        <div className="nav-categories-wrapper">
          {showLeftArrow && (
            <button className="nav-arrow nav-arrow-left" onClick={() => scrollCategories('left')}>
              <i className="fas fa-chevron-left"></i>
            </button>
          )}

          <div className="nav-categories-container" ref={categoriesContainerRef}>
            {/* All Categories */}
            <button onClick={() => navigate('/products')} className="category-btn">
              <i className="fas fa-bars"></i>
              <span>All Categories</span>
            </button>

            {/* 🔥 Special Sections */}
            {specialSections.map((sec, i) => (
              <button key={i} className="sub-link" onClick={() => navigate(sec.path)}>
                <i className={sec.icon}></i>
                <span>{sec.name}</span>
              </button>
            ))}

            {/* 🛍️ Product Categories */}
            {categories.map((cat, i) => (
              <button
                key={i}
                className="sub-link"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
              >
                <i className={cat.icon}></i>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {showRightArrow && (
            <button className="nav-arrow nav-arrow-right" onClick={() => scrollCategories('right')}>
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;