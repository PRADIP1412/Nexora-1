import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { checkoutAPI } from '../api/checkout';

const CheckoutContext = createContext();

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

export const CheckoutProvider = ({ children }) => {
  // Load initial state from localStorage
  const [checkoutSummary, setCheckoutSummary] = useState(() => {
    const saved = localStorage.getItem('checkoutSummary');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [verifiedAddress, setVerifiedAddress] = useState(() => {
    const saved = localStorage.getItem('verifiedAddress');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('currentStep');
    return saved ? parseInt(saved) : 1;
  });
  
  const [selectedPayment, setSelectedPayment] = useState(() => {
    const saved = localStorage.getItem('selectedPayment');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [orderNotes, setOrderNotes] = useState(() => {
    const saved = localStorage.getItem('orderNotes');
    return saved ? JSON.parse(saved) : '';
  });

  const [cartItems, setCartItems] = useState([]);
  
  // Separate loading states for different operations
  const [loading, setLoading] = useState({
    checkout: false,
    paymentMethods: false,
    confirmation: false
  });
  
  const [error, setError] = useState(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('checkoutSummary', JSON.stringify(checkoutSummary));
  }, [checkoutSummary]);

  useEffect(() => {
    localStorage.setItem('verifiedAddress', JSON.stringify(verifiedAddress));
  }, [verifiedAddress]);

  useEffect(() => {
    localStorage.setItem('currentStep', currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('selectedPayment', JSON.stringify(selectedPayment));
  }, [selectedPayment]);

  useEffect(() => {
    localStorage.setItem('orderNotes', JSON.stringify(orderNotes));
  }, [orderNotes]);

  // Clear error
  const clearError = () => setError(null);

  // Create checkout summary from cart and address
  const createCheckoutSummary = useCallback((cart, address) => {
    if (!cart || !address) return null;
    
    const subtotal = cart.subtotal || 0;
    const shipping = 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    const summary = {
      address_id: address.address_id,
      items: cart.items || [],
      subtotal,
      shipping,
      tax_amount: tax,
      total_amount: total,
      delivery_fee: shipping,
      address: address
    };
    
    console.log('Created checkout summary:', summary);
    return summary;
  }, []);

  // Set cart items and create checkout summary
  const setCartItemsHandler = useCallback((cart) => {
    setCartItems(cart?.items || []);
    
    // Create checkout summary when we have both cart and verified address
    if (cart && verifiedAddress) {
      const summary = createCheckoutSummary(cart, verifiedAddress);
      setCheckoutSummary(summary);
    }
  }, [verifiedAddress, createCheckoutSummary]);

  // Update checkout summary when verified address changes
  useEffect(() => {
    if (cartItems.length > 0 && verifiedAddress) {
      const cart = { items: cartItems, subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) };
      const summary = createCheckoutSummary(cart, verifiedAddress);
      setCheckoutSummary(summary);
    }
  }, [verifiedAddress, cartItems, createCheckoutSummary]);

  // Reset checkout state
  const resetCheckout = useCallback(() => {
    setCheckoutSummary(null);
    setVerifiedAddress(null);
    setCurrentStep(1);
    setSelectedPayment(null);
    setOrderNotes('');
    setCartItems([]);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('checkoutSummary');
    localStorage.removeItem('verifiedAddress');
    localStorage.removeItem('currentStep');
    localStorage.removeItem('selectedPayment');
    localStorage.removeItem('orderNotes');
  }, []);

  // Set verified address
  const setVerifiedAddressHandler = useCallback((address) => {
    console.log('Setting verified address:', address);
    setVerifiedAddress(address);
  }, []);

  // Set current step
  const setCurrentStepHandler = useCallback((step) => {
    console.log('Setting current step:', step);
    setCurrentStep(step);
  }, []);

  // Set selected payment
  const setSelectedPaymentHandler = useCallback((payment) => {
    console.log('Setting selected payment:', payment);
    setSelectedPayment(payment);
  }, []);

  // Set order notes
  const setOrderNotesHandler = useCallback((notes) => {
    setOrderNotes(notes);
  }, []);

  // Initiate checkout
  const initiateCheckout = useCallback(async (addressId) => {
    setLoading(prev => ({ ...prev, checkout: true }));
    setError(null);
    try {
      const result = await checkoutAPI.initiateCheckout(addressId);
      if (result.success) {
        setCheckoutSummary(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to initiate checkout';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, checkout: false }));
    }
  }, []);

  // Confirm checkout - UPDATED FOR MANUAL PAYMENT
  const confirmCheckout = useCallback(async (checkoutData) => {
    setLoading(prev => ({ ...prev, confirmation: true }));
    setError(null);
    try {
      // For manual payment processing, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock order data using checkoutSummary
      const mockOrder = {
        order_id: `ORD_${Date.now()}`,
        order_status: 'PLACED',
        total_amount: checkoutSummary?.total_amount || 0,
        subtotal: checkoutSummary?.subtotal || 0,
        delivery_fee: checkoutSummary?.delivery_fee || 0,
        tax_amount: checkoutSummary?.tax_amount || 0,
        items: checkoutSummary?.items || [],
        address: verifiedAddress,
        payment_method: checkoutData.payment_method,
        order_notes: checkoutData.order_notes || '',
        placed_at: new Date().toISOString(),
        tracking_number: `TRK_${Date.now()}`
      };
      
      console.log('Order created successfully:', mockOrder);
      return { 
        success: true, 
        data: mockOrder,
        message: 'Order placed successfully!'
      };
    } catch (err) {
      const message = 'Failed to confirm checkout';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, confirmation: false }));
    }
  }, [checkoutSummary, verifiedAddress]);

  // Get payment methods
  const getPaymentMethods = useCallback(async () => {
    setLoading(prev => ({ ...prev, paymentMethods: true }));
    setError(null);
    try {
      const result = await checkoutAPI.getPaymentMethods();
      if (result.success) {
        setPaymentMethods(result.data);
        return { success: true, data: result.data };
      } else {
        // Enhanced mock data
        const mockPaymentMethods = [
          {
            id: 1,
            method: 'COD',
            name: 'Cash on Delivery',
            icon: 'fa-money-bill-wave',
            description: 'Pay when you receive your order',
            available: true
          },
          {
            id: 2,
            method: 'DEBIT_CARD',
            name: 'Debit Card',
            icon: 'fa-credit-card',
            description: 'Pay securely with your debit card',
            available: true,
            supported_cards: ['visa', 'mastercard']
          },
          {
            id: 3,
            method: 'CREDIT_CARD',
            name: 'Credit Card',
            icon: 'fa-credit-card',
            description: 'Pay with your credit card',
            available: true,
            supported_cards: ['visa', 'mastercard', 'amex']
          },
          {
            id: 4,
            method: 'UPI',
            name: 'UPI Payment',
            icon: 'fa-mobile-alt',
            description: 'Instant payment using UPI',
            available: true
          },
          {
            id: 5,
            method: 'WALLET',
            name: 'Wallet Balance',
            icon: 'fa-wallet',
            description: 'Pay using your wallet balance',
            available: true
          },
          {
            id: 6,
            method: 'NET_BANKING',
            name: 'Net Banking',
            icon: 'fa-university',
            description: 'Pay using net banking',
            available: true
          }
        ];
        setPaymentMethods(mockPaymentMethods);
        return { success: true, data: mockPaymentMethods, isMock: true };
      }
    } catch (err) {
      const message = 'Failed to fetch payment methods';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, paymentMethods: false }));
    }
  }, []);

  // Process payment
  const processPayment = useCallback(async (paymentData) => {
    setLoading(prev => ({ ...prev, confirmation: true }));
    setError(null);
    try {
      const result = await checkoutAPI.processPayment(paymentData);
      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to process payment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, confirmation: false }));
    }
  }, []);

  // Validate checkout data
  const validateCheckout = useCallback(() => {
    const errors = [];

    if (!verifiedAddress) {
      errors.push('Shipping address is required');
    }

    if (currentStep >= 2 && !selectedPayment) {
      errors.push('Payment method is required');
    }

    if (orderNotes && orderNotes.length > 500) {
      errors.push('Order notes cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [verifiedAddress, selectedPayment, orderNotes, currentStep]);

  // Get checkout progress
  const getCheckoutProgress = useCallback(() => {
    const steps = [
      { number: 1, title: 'Address', completed: !!verifiedAddress },
      { number: 2, title: 'Payment', completed: !!selectedPayment },
      { number: 3, title: 'Review', completed: false }
    ];

    const completedSteps = steps.filter(step => step.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    return {
      steps,
      completedSteps,
      progress,
      canProceedToPayment: !!verifiedAddress,
      canProceedToReview: !!verifiedAddress && !!selectedPayment,
      canPlaceOrder: !!verifiedAddress && !!selectedPayment
    };
  }, [verifiedAddress, selectedPayment]);

  const value = {
    // State
    checkoutSummary,
    paymentMethods,
    verifiedAddress,
    currentStep,
    selectedPayment,
    orderNotes,
    cartItems,
    loading,
    error,
    
    // State setters
    setVerifiedAddress: setVerifiedAddressHandler,
    setCurrentStep: setCurrentStepHandler,
    setSelectedPayment: setSelectedPaymentHandler,
    setOrderNotes: setOrderNotesHandler,
    setCartItems: setCartItemsHandler,
    
    // Actions
    clearError,
    resetCheckout,
    initiateCheckout,
    confirmCheckout,
    getPaymentMethods,
    processPayment,
    
    // Utilities
    validateCheckout,
    getCheckoutProgress
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};