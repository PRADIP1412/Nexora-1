import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
  getActiveOffers,
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  deleteOffer 
} from '../api/offer';
import { useAuth } from './AuthContext';

const OfferContext = createContext();

export const useOffer = () => {
  const context = useContext(OfferContext);
  if (!context) {
    throw new Error('useOffer must be used within a OfferProvider');
  }
  return context;
};

export const OfferProvider = ({ children }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  
  const [activeOffers, setActiveOffers] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [offerStats, setOfferStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });

  // Load active offers (public)
  const loadActiveOffers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getActiveOffers();
      if (response.success) {
        setActiveOffers(response.data || []);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Load active offers error:', error);
      setError('Failed to load active offers');
      return { success: false, message: 'Failed to load active offers' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all offers (admin only)
  const loadAllOffers = useCallback(async (page = 1, limit = 20) => {
    if (!isAuthenticated || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      const response = await getAllOffers(skip, limit);
      if (response.success) {
        setAllOffers(response.data || []);
        setCurrentPage(page);
        
        // Calculate stats
        const now = new Date();
        const stats = {
          total: response.data.length,
          active: response.data.filter(o => 
            o.is_active && 
            new Date(o.start_date) <= now && 
            new Date(o.end_date) >= now
          ).length,
          expired: response.data.filter(o => new Date(o.end_date) < now).length,
          upcoming: response.data.filter(o => new Date(o.start_date) > now).length
        };
        setOfferStats(stats);
        
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Load all offers error:', error);
      setError('Failed to load offers');
      return { success: false, message: 'Failed to load offers' };
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  // Get offer by ID
  const loadOfferById = async (offerId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getOfferById(offerId);
      if (response.success) {
        setSelectedOffer(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Load offer by ID error:', error);
      setError('Failed to load offer');
      return { success: false, message: 'Failed to load offer' };
    } finally {
      setIsLoading(false);
    }
  };

  // Create offer (admin only)
  const createNewOffer = async (offerData) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await createOffer(offerData);
      if (response.success) {
        // Refresh the list
        await loadAllOffers(currentPage);
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Create offer error:', error);
      setError('Failed to create offer');
      return { success: false, message: 'Failed to create offer' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update offer (admin only)
  const updateExistingOffer = async (offerId, offerData) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateOffer(offerId, offerData);
      if (response.success) {
        // Refresh the list and selected offer
        await loadAllOffers(currentPage);
        if (selectedOffer?.offer_id === offerId) {
          await loadOfferById(offerId);
        }
        return { success: true, data: response.data, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update offer error:', error);
      setError('Failed to update offer');
      return { success: false, message: 'Failed to update offer' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update offer status (admin only)
  const updateOfferActiveStatus = async (offerId, isActive) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateOfferStatus(offerId, isActive);
      if (response.success) {
        // Refresh the list
        await loadAllOffers(currentPage);
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update offer status error:', error);
      setError('Failed to update offer status');
      return { success: false, message: 'Failed to update offer status' };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete offer (admin only)
  const deleteExistingOffer = async (offerId) => {
    if (!isAuthenticated || !isAdmin) {
      return { success: false, message: 'Unauthorized' };
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteOffer(offerId);
      if (response.success) {
        // Refresh the list
        await loadAllOffers(currentPage);
        setSelectedOffer(null);
        return { success: true, message: response.message };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Delete offer error:', error);
      setError('Failed to delete offer');
      return { success: false, message: 'Failed to delete offer' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get offers for specific variant
  const getOffersForVariant = (variantId) => {
    return activeOffers.filter(offer => 
      !offer.variants || offer.variants.length === 0 || offer.variants.includes(variantId)
    );
  };

  // Format discount text
  const formatDiscountText = (offer) => {
    if (!offer) return '';
    
    if (offer.discount_type === 'PERCENT') {
      return `${offer.discount_value}% OFF`;
    } else {
      return `$${offer.discount_value} OFF`;
    }
  };

  // Get highest discount offer for variant
  const getBestOfferForVariant = (variantId) => {
    const offers = getOffersForVariant(variantId);
    if (offers.length === 0) return null;
    
    return offers.reduce((best, current) => {
      if (current.discount_type === 'PERCENT' && best.discount_type === 'PERCENT') {
        return current.discount_value > best.discount_value ? current : best;
      } else if (current.discount_type === 'FLAT' && best.discount_type === 'FLAT') {
        return current.discount_value > best.discount_value ? current : best;
      } else {
        // Prefer percentage discounts for comparison
        return current.discount_type === 'PERCENT' ? current : best;
      }
    });
  };

  // Load active offers on mount
  useEffect(() => {
    loadActiveOffers();
  }, [loadActiveOffers]);

  // Load all offers if admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAllOffers();
    }
  }, [isAuthenticated, isAdmin, loadAllOffers]);

  const contextValue = {
    // State
    activeOffers,
    allOffers,
    selectedOffer,
    isLoading,
    error,
    currentPage,
    totalPages,
    offerStats,
    
    // Actions
    loadActiveOffers,
    loadAllOffers,
    loadOfferById,
    createNewOffer,
    updateExistingOffer,
    updateOfferActiveStatus,
    deleteExistingOffer,
    getOffersForVariant,
    formatDiscountText,
    getBestOfferForVariant,
    
    // Getters
    isAdmin: isAdmin,
  };

  return (
    <OfferContext.Provider value={contextValue}>
      {children}
    </OfferContext.Provider>
  );
};