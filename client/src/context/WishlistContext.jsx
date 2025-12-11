import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchWishlist, addToWishlist, removeFromWishlist } from "../api/wishlist";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { addItemToCart } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWishlist([]);
      setWishlistError(null);
      return;
    }

    setIsWishlistLoading(true);
    setWishlistError(null);

    try {
      const response = await fetchWishlist();
      if (response.success) {
        setWishlist(response.data || []);
      } else {
        setWishlistError(response.message);
        if (response.unauthorized) {
          setWishlist([]);
        }
      }
    } catch (error) {
      console.error("Wishlist load error:", error);
      setWishlistError("Failed to load wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  }, [isAuthenticated, user]);

  const addItemToWishlist = async (variantId) => {
    if (!isAuthenticated) {
      return { success: false, message: "Please log in first", unauthorized: true };
    }

    setWishlistError(null);
    try {
      const response = await addToWishlist(variantId);
      if (response.success) {
        // Reload wishlist to get updated data
        await loadWishlist();
        return { success: true, message: "Added to wishlist" };
      } else {
        return { success: false, message: response.message, unauthorized: response.unauthorized };
      }
    } catch (error) {
      console.error("Wishlist add error:", error);
      return { success: false, message: "Failed to add to wishlist" };
    }
  };

  const removeItemFromWishlist = async (variantId) => {
    if (!isAuthenticated) {
      return { success: false, message: "Please log in first", unauthorized: true };
    }

    setWishlistError(null);
    try {
      // Optimistically remove from local state
      setWishlist(prev => prev.filter(item => item.variant_id !== variantId));
      
      const response = await removeFromWishlist(variantId);
      if (response.success) {
        return { success: true, message: "Removed from wishlist" };
      } else {
        // Reload on failure to restore state
        await loadWishlist();
        return { success: false, message: response.message, unauthorized: response.unauthorized };
      }
    } catch (error) {
      console.error("Wishlist remove error:", error);
      // Reload on error to restore state
      await loadWishlist();
      return { success: false, message: "Failed to remove from wishlist" };
    }
  };

  const moveToCart = async (variantId) => {
    if (!isAuthenticated) {
      return { success: false, message: "Please log in first", unauthorized: true };
    }

    try {
      const result = await addItemToCart(variantId, 1);
      if (result.success) {
        await removeItemFromWishlist(variantId);
        return { success: true, message: "Item moved to cart" };
      }
      return result;
    } catch (error) {
      console.error("Move to cart error:", error);
      return { success: false, message: "Failed to move item to cart" };
    }
  };

  const moveAllToCart = async () => {
    if (!isAuthenticated) {
      return { success: false, message: "Please log in first", unauthorized: true };
    }

    if (wishlist.length === 0) {
      return { success: false, message: "Wishlist is empty" };
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of wishlist) {
      try {
        const result = await addItemToCart(item.variant_id, 1);
        if (result.success) {
          successCount++;
          await removeItemFromWishlist(item.variant_id);
        } else {
          failCount++;
        }
      } catch (error) {
        console.error("Move to cart error:", error);
        failCount++;
      }
    }

    if (failCount === 0) {
      return { success: true, message: `${successCount} items moved to cart` };
    } else {
      return { 
        success: successCount > 0, 
        message: `${successCount} items moved, ${failCount} failed` 
      };
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      return { success: false, message: "Please log in first", unauthorized: true };
    }

    try {
      // Clear all items one by one
      for (const item of wishlist) {
        await removeFromWishlist(item.variant_id);
      }
      setWishlist([]);
      return { success: true, message: "Wishlist cleared" };
    } catch (error) {
      console.error("Clear wishlist error:", error);
      return { success: false, message: "Failed to clear wishlist" };
    }
  };

  const isInWishlist = (variantId) => {
    return wishlist.some((item) => item.variant_id === variantId);
  };

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const contextValue = {
    wishlist,
    isWishlistLoading,
    wishlistError,
    loadWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    moveToCart,
    moveAllToCart,
    clearWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};