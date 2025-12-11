import React, { createContext, useContext, useState, useCallback } from 'react';
import { paymentAPI } from '../api/payment';

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = () => setError(null);

  // Initiate payment
  const initiatePayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentAPI.initiatePayment(paymentData);
      if (result.success) {
        setCurrentPayment(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to initiate payment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (verifyData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentAPI.verifyPayment(verifyData);
      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to verify payment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment history
  const getPaymentHistory = useCallback(async (page = 1, perPage = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentAPI.getPaymentHistory(page, perPage);
      if (result.success) {
        if (page === 1) {
          setPayments(result.data);
        } else {
          setPayments(prev => [...prev, ...result.data]);
        }
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch payment history';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment by ID
  const getPaymentById = useCallback(async (paymentId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentAPI.getPaymentById(paymentId);
      if (result.success) {
        setCurrentPayment(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch payment details';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm payment
  const confirmPayment = useCallback(async (paymentId, gatewayData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentAPI.confirmPayment(paymentId, gatewayData);
      if (result.success) {
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to confirm payment';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment status
  const getPaymentStatus = useCallback(async (paymentId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentAPI.getPaymentStatus(paymentId);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch payment status';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    payments,
    currentPayment,
    loading,
    error,
    clearError,
    initiatePayment,
    verifyPayment,
    getPaymentHistory,
    getPaymentById,
    confirmPayment,
    getPaymentStatus
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};