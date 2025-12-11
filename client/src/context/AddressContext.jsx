import React, { createContext, useContext, useState, useCallback } from 'react';
import { addressAPI } from '../api/address';

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  // Separate loading states for different operations
  const [loading, setLoading] = useState({
    states: false,
    cities: false,
    areas: false,
    addresses: false,
    create: false,
    update: false,
    delete: false
  });
  
  const [error, setError] = useState(null);

  // Clear error
  const clearError = () => setError(null);

  // Get all states
  const getStates = useCallback(async () => {
    // Only fetch if not already loaded
    if (states.length > 0) return { success: true, data: states };
    
    setLoading(prev => ({ ...prev, states: true }));
    setError(null);
    try {
      const result = await addressAPI.getStates();
      if (result.success) {
        setStates(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch states';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, states: false }));
    }
  }, [states.length]);

  // Get cities by state
  const getCitiesByState = useCallback(async (stateId) => {
    if (!stateId) {
      setCities([]);
      return { success: true, data: [] };
    }
    
    setLoading(prev => ({ ...prev, cities: true }));
    setError(null);
    try {
      const result = await addressAPI.getCitiesByState(stateId);
      if (result.success) {
        setCities(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch cities';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  }, []);

  // Get areas by city
  const getAreasByCity = useCallback(async (cityId) => {
    if (!cityId) {
      setAreas([]);
      return { success: true, data: [] };
    }
    
    setLoading(prev => ({ ...prev, areas: true }));
    setError(null);
    try {
      const result = await addressAPI.getAreasByCity(cityId);
      if (result.success) {
        setAreas(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch areas';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, areas: false }));
    }
  }, []);

  // Get user addresses
  const getUserAddresses = useCallback(async () => {
    setLoading(prev => ({ ...prev, addresses: true }));
    setError(null);
    try {
      const result = await addressAPI.getUserAddresses();
      if (result.success) {
        setAddresses(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to fetch addresses';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, addresses: false }));
    }
  }, []);

  // Create address
  const createAddress = useCallback(async (addressData) => {
    setLoading(prev => ({ ...prev, create: true }));
    setError(null);
    try {
      const result = await addressAPI.createAddress(addressData);
      if (result.success) {
        setAddresses(prev => [...prev, result.data]);
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to create address';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, []);

  // Update address
  const updateAddress = useCallback(async (addressId, updateData) => {
    setLoading(prev => ({ ...prev, update: true }));
    setError(null);
    try {
      const result = await addressAPI.updateAddress(addressId, updateData);
      if (result.success) {
        setAddresses(prev => 
          prev.map(addr => 
            addr.address_id === addressId ? result.data : addr
          )
        );
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to update address';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  // Delete address
  const deleteAddress = useCallback(async (addressId) => {
    setLoading(prev => ({ ...prev, delete: true }));
    setError(null);
    try {
      const result = await addressAPI.deleteAddress(addressId);
      if (result.success) {
        setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to delete address';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, []);

  // Set default address
  const setDefaultAddress = useCallback(async (addressId) => {
    setLoading(prev => ({ ...prev, update: true }));
    setError(null);
    try {
      const result = await addressAPI.setDefaultAddress(addressId);
      if (result.success) {
        setAddresses(prev => 
          prev.map(addr => ({
            ...addr,
            is_default: addr.address_id === addressId
          }))
        );
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const message = 'Failed to set default address';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  const value = {
    states,
    cities,
    areas,
    addresses,
    loading,
    error,
    clearError,
    getStates,
    getCitiesByState,
    getAreasByCity,
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};