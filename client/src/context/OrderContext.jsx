import React, { createContext, useContext, useState, useCallback } from 'react';
import { orderAPI } from '../api/order';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  
  // Separate loading states for different operations
  const [loading, setLoading] = useState({
    orders: false,
    order: false,
    create: false,
    cancel: false,
    return: false
  });
  
  const [error, setError] = useState(null);

  // Clear error
  const clearError = () => setError(null);

  // Get order by ID - FIXED VERSION
  const getOrderById = useCallback(async (orderId) => {
    // Reset current order first
    setCurrentOrder(null);
    setError(null);
    
    // Set loading to true
    setLoading(prev => ({ ...prev, order: true }));
    
    try {
      console.log(`🔍 OrderContext: Fetching order with ID: ${orderId}`);
      
      const result = await orderAPI.getOrderById(orderId);
      
      if (result.success) {
        console.log('✅ OrderContext: Order fetched successfully:', result.data);
        setCurrentOrder(result.data);
        setError(null); // Clear any previous errors
        return { 
          success: true, 
          data: result.data,
          isMock: result.isMock 
        };
      } else {
        console.error('❌ OrderContext: Failed to fetch order:', result.message);
        setError(result.message);
        setCurrentOrder(null); // Ensure currentOrder is null on error
        return { 
          success: false, 
          message: result.message 
        };
      }
    } catch (err) {
      console.error('🔥 OrderContext: Unexpected error in getOrderById:', err);
      const message = err.message || 'Failed to fetch order details';
      setError(message);
      setCurrentOrder(null); // Ensure currentOrder is null on error
      return { 
        success: false, 
        message 
      };
    } finally {
      // Always set loading to false after operation
      setLoading(prev => ({ ...prev, order: false }));
    }
  }, []);

  // ========== KEEP ALL OTHER FUNCTIONS EXACTLY AS THEY ARE ==========
  
  // Create order - IMPROVED VERSION (UNCHANGED)
  const createOrder = useCallback(async (orderData) => {
    setLoading(prev => ({ ...prev, create: true }));
    setError(null);
    try {
      console.log('OrderContext: Creating order with data:', orderData);
      
      const result = await orderAPI.createOrder(orderData);
      
      if (result.success) {
        console.log('OrderContext: Order created successfully:', result.data);
        setOrders(prev => [result.data, ...prev]);
        setCurrentOrder(result.data);
        return { 
          success: true, 
          data: result.data, 
          message: result.message 
        };
      } else {
        console.error('OrderContext: Order creation failed:', result.message);
        
        // Enhanced error handling
        let errorMessage = result.message;
        
        // Handle specific error cases
        if (result.validationErrors && result.validationErrors.length > 0) {
          errorMessage = `Validation errors: ${result.validationErrors.join(', ')}`;
        }
        
        setError(errorMessage);
        return { 
          success: false, 
          message: errorMessage,
          validationErrors: result.validationErrors || []
        };
      }
    } catch (err) {
      console.error('OrderContext: Unexpected error:', err);
      const message = 'An unexpected error occurred while creating your order';
      setError(message);
      return { 
        success: false, 
        message 
      };
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, []);

  // Get user orders (UNCHANGED)
  const getUserOrders = useCallback(async (page = 1, perPage = 20, status = null) => {
    setLoading(prev => ({ ...prev, orders: true }));
    setError(null);
    try {
      console.log(`📋 OrderContext: Fetching orders page ${page}, perPage ${perPage}, status ${status}`);
      
      const result = await orderAPI.getUserOrders(page, perPage, status);
      
      console.log(`✅ OrderContext: API result:`, result);
      
      if (result.success) {
        console.log(`📦 OrderContext: Received ${result.data?.length || 0} orders`);
        
        if (page === 1) {
          setOrders(result.data || []);
        } else {
          setOrders(prev => [...prev, ...(result.data || [])]);
        }
        
        return { 
          success: true, 
          data: result.data || [],
          pagination: result.pagination,
          isMock: result.isMock 
        };
      } else {
        console.error('❌ OrderContext: Failed to fetch orders:', result.message);
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      console.error('🔥 OrderContext: Unexpected error:', err);
      const message = 'Failed to fetch orders';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }, []);

  // Cancel order (UNCHANGED)
  const cancelOrder = useCallback(async (orderId) => {
    setLoading(prev => ({ ...prev, cancel: true }));
    setError(null);
    try {
      const result = await orderAPI.cancelOrder(orderId);
      if (result.success) {
        setOrders(prev => 
          prev.map(order => 
            order.order_id === orderId 
              ? { ...order, order_status: 'CANCELLED' }
              : order
          )
        );
        if (currentOrder?.order_id === orderId) {
          setCurrentOrder(prev => ({ ...prev, order_status: 'CANCELLED' }));
        }
        return { 
          success: true, 
          data: result.data,
          message: result.message 
        };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to cancel order';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, cancel: false }));
    }
  }, [currentOrder]);

  // Create return request (UNCHANGED)
  const createReturnRequest = useCallback(async (orderId, returnData) => {
    setLoading(prev => ({ ...prev, return: true }));
    setError(null);
    try {
      const result = await orderAPI.createReturnRequest(orderId, returnData);
      if (result.success) {
        return { 
          success: true, 
          data: result.data, 
          message: result.message 
        };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to create return request';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, return: false }));
    }
  }, []);

  // Clear current order (UNCHANGED)
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  const value = {
    orders,
    currentOrder,
    loading,
    error,
    clearError,
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    createReturnRequest,
    clearCurrentOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};