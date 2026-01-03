import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlistContext } from "../../context/WishlistContext";
import { useCartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { fetchActiveOffers } from "../../api/offer"; // Changed from getActiveOffers
import { toast } from 'react-toastify';
import "./ProductCard.css";

const ProductCard = ({
  id,
  title,
  description,
  price,
  originalPrice,
  rating,
  reviewCount,
  gradient,
  image,
  variantId,
  inStock = true,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItemToWishlist, removeItemFromWishlist, isInWishlist } = useWishlistContext(); // Changed to useWishlistContext
  const { addItemToCart, isInCart, getItemQuantity } = useCartContext(); // Changed to useCartContext
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [bestOffer, setBestOffer] = useState(null);
  const [finalPrice, setFinalPrice] = useState(price);

  useEffect(() => {
    // Load offers for this product variant
    const loadOffers = async () => {
      try {
        const result = await fetchActiveOffers(); // Changed from getActiveOffers
        if (result.success) {
          const offers = result.data || [];
          // Find offers applicable to this variant
          const applicableOffers = offers.filter(offer => 
            !offer.variants || offer.variants.length === 0 || offer.variants.includes(variantId)
          );
          
          if (applicableOffers.length > 0) {
            // Get the best offer (highest discount)
            const best = applicableOffers.reduce((best, current) => {
              const bestDiscount = best.discount_type === 'PERCENT' 
                ? (price * best.discount_value) / 100
                : best.discount_value;
              
              const currentDiscount = current.discount_type === 'PERCENT'
                ? (price * current.discount_value) / 100
                : current.discount_value;
              
              return currentDiscount > bestDiscount ? current : best;
            });
            
            setBestOffer(best);
            
            // Calculate final price with offer
            let discount = 0;
            if (best.discount_type === 'PERCENT') {
              discount = (price * best.discount_value) / 100;
            } else {
              discount = best.discount_value;
            }
            
            setFinalPrice(Math.max(0, price - discount));
          }
        }
      } catch (error) {
        console.error('Failed to load offers:', error);
      }
    };
    
    if (variantId) {
      loadOffers();
    }
  }, [variantId, price]);

  // ADD THIS MISSING FUNCTION:
  const handleCardClick = () => {
    if (id) {
      navigate(`/products/${id}`);
    } else {
      console.error('No product ID available for navigation');
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning("Please log in to add items to cart!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    try {
      console.log('Attempting cart operation for variantId:', variantId);
      const result = await addItemToCart(variantId, 1);
      if (result.success) {
        toast.success("Added to cart!");
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong while adding to cart");
    }
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning("Please log in to manage wishlist!");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    
    console.log('Attempting wishlist operation for variantId:', variantId);
    console.log('Current wishlist items:', isInWishlist(variantId));
    
    try {
      if (isInWishlist(variantId)) {
        console.log('Removing from wishlist:', variantId);
        const result = await removeItemFromWishlist(variantId);
        if (result.success) {
          toast.success("Removed from wishlist!");
        } else {
          console.error('Remove wishlist error:', result);
          toast.error(result.message || "Failed to remove from wishlist");
        }
      } else {
        console.log('Adding to wishlist:', variantId);
        const result = await addItemToWishlist(variantId);
        if (result.success) {
          toast.success("Added to wishlist!");
        } else {
          console.error('Add wishlist error:', result);
          toast.error(result.message || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Something went wrong with wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 !== 0;
    for (let i = 0; i < full; i++)
      stars.push(<i key={`f-${i}`} className="fas fa-star"></i>);
    if (half)
      stars.push(<i key="h" className="fas fa-star-half-alt"></i>);
    while (stars.length < 5)
      stars.push(<i key={`e-${stars.length}`} className="far fa-star"></i>);
    return stars;
  };

  const itemInCart = variantId ? isInCart(variantId) : false;
  const cartQuantity = variantId ? getItemQuantity(variantId) : 0;
  const itemInWishlist = variantId ? isInWishlist(variantId) : false;
  const offerDiscount = bestOffer ? price - finalPrice : 0;

  return (
    <div className={`product-card ${!inStock ? "out-of-stock" : ""}`} onClick={handleCardClick}>
      <button 
        className={`wishlist-btn ${itemInWishlist ? "active" : ""} ${isWishlistLoading ? "loading" : ""}`} 
        onClick={handleWishlistClick}
        disabled={isWishlistLoading}
      >
        <i className={itemInWishlist ? "fas fa-heart" : "far fa-heart"}></i>
        {isWishlistLoading && <div className="wishlist-spinner"></div>}
      </button>

      {/* Offer Badge */}
      {bestOffer && (
        <div className="offer-badge">
          <span className="offer-text">
            {bestOffer.discount_type === 'PERCENT' 
              ? `${bestOffer.discount_value}% OFF` 
              : `₹${bestOffer.discount_value} OFF`}
          </span>
        </div>
      )}

      {itemInCart && (
        <div className="cart-badge">
          <i className="fas fa-shopping-cart"></i>
          {cartQuantity > 1 && <span className="badge-count">{cartQuantity}</span>}
        </div>
      )}

      <div className="product-image">
        <div className="product-img-placeholder" style={{ background: gradient }}>
          {image ? <img src={image} alt={title} /> : <i className="fas fa-box-open"></i>}
        </div>
        {!inStock && <span className="stock-overlay">Out of Stock</span>}
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-description">{description}</p>

        <div className="product-rating">
          <div className="stars">{renderStars()}</div>
          <span className="rating-count">
            ({(rating || 0).toFixed(1)}) {reviewCount?.toLocaleString() || 0} reviews
          </span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">₹{finalPrice?.toLocaleString() || "0"}</span>
            {originalPrice && <span className="price-original">₹{originalPrice.toLocaleString()}</span>}
            {bestOffer && offerDiscount > 0 && (
              <span className="offer-save">
                Save ₹{offerDiscount.toLocaleString()}
              </span>
            )}
          </div>

          <button className={`btn-cart ${itemInCart ? "in-cart" : ""}`} onClick={handleAddToCart} disabled={!inStock}>
            <i className={itemInCart ? "fas fa-check" : "fas fa-shopping-cart"}></i>
            {itemInCart ? "Added" : inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;