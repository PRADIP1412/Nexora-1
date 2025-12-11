import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { fetchCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';
import { validateCoupon } from '../api/coupon'; // We'll create this
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    
    const [cart, setCart] = useState({ 
        items: [], 
        subtotal: 0, 
        total_items: 0 
    });
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    
    // New states for coupon and offer functionality
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState(null);
    const [offerDiscounts, setOfferDiscounts] = useState({}); // {variantId: discountAmount}
    const [totalOfferDiscount, setTotalOfferDiscount] = useState(0);

    const loadCart = useCallback(async () => {
        if (!isAuthenticated || !user) {
            setCart({ items: [], subtotal: 0, total_items: 0 });
            setAppliedCoupon(null);
            setCouponDiscount(0);
            setOfferDiscounts({});
            setTotalOfferDiscount(0);
            setCartError(null);
            return;
        }
        
        setIsCartLoading(true);
        setCartError(null);
        try {
            const response = await fetchCart();
            
            if (response.success) {
                setCart(response.data);
                
                // Reapply coupon if exists in localStorage
                const savedCoupon = localStorage.getItem('appliedCoupon');
                if (savedCoupon) {
                    const couponData = JSON.parse(savedCoupon);
                    if (couponData.coupon && couponData.discount) {
                        await validateAndApplyCoupon(couponData.coupon.code, response.data.items, response.data.subtotal);
                    }
                }
            } else {
                setCartError(response.message);
                if (response.unauthorized) {
                    setCart({ items: [], subtotal: 0, total_items: 0 });
                    setAppliedCoupon(null);
                    setCouponDiscount(0);
                    localStorage.removeItem('appliedCoupon');
                }
            }
        } catch (error) {
            console.error('Cart load error:', error);
            setCartError('Failed to load cart');
        } finally {
            setIsCartLoading(false);
        }
    }, [isAuthenticated, user]);

    // Helper function to validate and apply coupon
    const validateAndApplyCoupon = async (couponCode, items, subtotal) => {
        if (!couponCode) return { success: false, message: 'No coupon code provided' };
        
        const variantIds = items?.map(item => item.variant_id) || [];
        
        try {
            const response = await validateCoupon(couponCode, variantIds, subtotal);
            
            if (response.success && response.data.valid) {
                setAppliedCoupon(response.data.coupon);
                setCouponDiscount(response.data.discount_amount);
                setCouponError(null);
                
                // Save to localStorage
                localStorage.setItem('appliedCoupon', JSON.stringify({
                    coupon: response.data.coupon,
                    discount: response.data.discount_amount
                }));
                
                return { 
                    success: true, 
                    data: response.data,
                    message: response.data.message 
                };
            } else {
                setAppliedCoupon(null);
                setCouponDiscount(0);
                localStorage.removeItem('appliedCoupon');
                
                const message = response.data?.message || 'Invalid coupon code';
                setCouponError(message);
                return { success: false, message };
            }
        } catch (error) {
            console.error('Coupon validation error:', error);
            setCouponError('Failed to validate coupon');
            return { success: false, message: 'Failed to validate coupon' };
        }
    };

    // Apply coupon to cart
    const applyCouponToCart = async (couponCode) => {
        if (!isAuthenticated) {
            return { success: false, message: "Please log in to apply coupon.", unauthorized: true };
        }
        
        setCouponError(null);
        return await validateAndApplyCoupon(couponCode, cart.items, cart.subtotal);
    };

    // Remove applied coupon
    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(null);
        localStorage.removeItem('appliedCoupon');
        return { success: true, message: 'Coupon removed successfully' };
    };

    // Calculate offer discounts (this would be called from ProductCard or when cart loads)
    const calculateOfferDiscounts = (items = [], offers = []) => {
        if (!items || items.length === 0) {
            setOfferDiscounts({});
            setTotalOfferDiscount(0);
            return;
        }
        
        const newOfferDiscounts = {};
        let totalDiscount = 0;
        
        items.forEach(item => {
            // Find applicable offers for this variant
            const applicableOffers = offers.filter(offer => 
                !offer.variants || offer.variants.length === 0 || offer.variants.includes(item.variant_id)
            );
            
            if (applicableOffers.length > 0) {
                // Get the best offer (highest discount)
                const bestOffer = applicableOffers.reduce((best, current) => {
                    const bestDiscount = best.discount_type === 'PERCENT' 
                        ? (item.final_price * item.quantity * best.discount_value) / 100
                        : best.discount_value * item.quantity;
                    
                    const currentDiscount = current.discount_type === 'PERCENT'
                        ? (item.final_price * item.quantity * current.discount_value) / 100
                        : current.discount_value * item.quantity;
                    
                    return currentDiscount > bestDiscount ? current : best;
                });
                
                // Calculate discount for this item
                let itemDiscount = 0;
                if (bestOffer.discount_type === 'PERCENT') {
                    itemDiscount = (item.final_price * item.quantity * bestOffer.discount_value) / 100;
                } else {
                    itemDiscount = bestOffer.discount_value * item.quantity;
                }
                
                // Don't exceed item price
                itemDiscount = Math.min(itemDiscount, item.final_price * item.quantity);
                
                newOfferDiscounts[item.variant_id] = itemDiscount;
                totalDiscount += itemDiscount;
            }
        });
        
        setOfferDiscounts(newOfferDiscounts);
        setTotalOfferDiscount(totalDiscount);
    };

    const addItemToCart = async (variantId, quantity = 1) => {
        if (!isAuthenticated) {
            return { success: false, message: "Please log in to add items to cart.", unauthorized: true };
        }
        
        setCartError(null);
        try {
            const response = await addToCart(variantId, quantity);
            
            if (response.success) {
                await loadCart();
                return { success: true, message: response.message || "Item added to cart!" };
            } else {
                if (response.unauthorized) {
                    setCartError("Please log in to add items to cart");
                } else {
                    setCartError(response.message);
                }
                return { success: false, message: response.message, unauthorized: response.unauthorized };
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            const message = 'Failed to add item to cart';
            setCartError(message);
            return { success: false, message };
        }
    };

    const updateItemQuantity = async (variantId, quantity) => {
        if (!isAuthenticated) {
            return { success: false, message: "Please log in.", unauthorized: true };
        }
        
        setCartError(null);
        try {
            const response = await updateCartItem(variantId, quantity);
            
            if (response.success) {
                await loadCart();
                return { success: true, message: response.message || "Cart updated!" };
            } else {
                if (response.unauthorized) {
                    setCartError("Please log in to update cart");
                } else {
                    setCartError(response.message);
                }
                return { success: false, message: response.message, unauthorized: response.unauthorized };
            }
        } catch (error) {
            console.error('Update cart error:', error);
            const message = 'Failed to update cart item';
            setCartError(message);
            return { success: false, message };
        }
    };

    const removeItemFromCart = async (variantId) => {
        if (!isAuthenticated) {
            return { success: false, message: "Please log in.", unauthorized: true };
        }
        
        setCartError(null);
        try {
            // Optimistically update UI
            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items?.filter(item => item.variant_id !== variantId) || [],
                total_items: Math.max(0, (prevCart.total_items || 0) - 1)
            }));
            
            const response = await removeFromCart(variantId);
            
            if (response.success) {
                // Reload to get accurate totals
                await loadCart();
                return { success: true, message: response.message || "Item removed from cart!" };
            } else {
                // Revert optimistic update on failure
                await loadCart();
                if (response.unauthorized) {
                    setCartError("Please log in to remove items");
                } else {
                    setCartError(response.message);
                }
                return { success: false, message: response.message, unauthorized: response.unauthorized };
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
            // Revert optimistic update
            await loadCart();
            const message = 'Failed to remove item from cart';
            setCartError(message);
            return { success: false, message };
        }
    };

    const clearUserCart = async () => {
        if (!isAuthenticated) {
            return { success: false, message: "Please log in.", unauthorized: true };
        }
        
        setCartError(null);
        try {
            const response = await clearCart();
            
            if (response.success) {
                setCart({ items: [], subtotal: 0, total_items: 0 });
                setAppliedCoupon(null);
                setCouponDiscount(0);
                setOfferDiscounts({});
                setTotalOfferDiscount(0);
                localStorage.removeItem('appliedCoupon');
                return { success: true, message: response.message || "Cart cleared!" };
            } else {
                if (response.unauthorized) {
                    setCartError("Please log in to clear cart");
                } else {
                    setCartError(response.message);
                }
                return { success: false, message: response.message, unauthorized: response.unauthorized };
            }
        } catch (error) {
            console.error('Clear cart error:', error);
            const message = 'Failed to clear cart';
            setCartError(message);
            return { success: false, message };
        }
    };

    const getCartItemCount = () => {
        return cart.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;
    };

    const isInCart = (variantId) => {
        return cart.items?.some(item => item.variant_id === variantId) || false;
    };

    const getItemQuantity = (variantId) => {
        const item = cart.items?.find(item => item.variant_id === variantId);
        return item ? item.quantity : 0;
    };

    // Calculate final cart totals with all discounts
    const getCartTotals = () => {
        const subtotal = cart.subtotal || 0;
        const itemDiscount = calculateItemDiscount();
        const afterItemDiscount = Math.max(0, subtotal - itemDiscount);
        const afterCouponDiscount = Math.max(0, afterItemDiscount - couponDiscount);
        const total = afterCouponDiscount;
        
        return {
            subtotal,
            itemDiscount,
            couponDiscount,
            totalOfferDiscount: itemDiscount, // For backward compatibility
            totalDiscount: itemDiscount + couponDiscount,
            total,
            deliveryFee: total > 50000 ? 0 : 500,
            finalTotal: total + (total > 50000 ? 0 : 500)
        };
    };

    const calculateItemDiscount = () => {
        return cart.items?.reduce((total, item) => {
            if (item.price > item.final_price) {
                return total + ((item.price - item.final_price) * item.quantity);
            }
            return total;
        }, 0) || 0;
    };

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const contextValue = {
        // Existing cart state
        cart,
        isCartLoading,
        cartError,
        loadCart,
        addItemToCart,
        updateItemQuantity,
        removeItemFromCart,
        clearUserCart,
        getCartItemCount,
        isInCart,
        getItemQuantity,
        
        // New coupon and offer state
        appliedCoupon,
        couponDiscount,
        couponError,
        offerDiscounts,
        totalOfferDiscount,
        applyCouponToCart,
        removeCoupon,
        calculateOfferDiscounts,
        getCartTotals,
        calculateItemDiscount
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};