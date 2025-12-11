import React, { useState, useEffect, useCallback } from 'react';
import { useAddress } from '../../context/AddressContext';
import { toastSuccess, toastError } from '../../utils/customToast';
import './AddAddressModal.css';

const AddAddressModal = ({ isOpen, onClose, onAddressAdded }) => {
  const { 
    states, 
    cities, 
    areas, 
    getStates, 
    getCitiesByState, 
    getAreasByCity, 
    createAddress,
    loading: addressLoading 
  } = useAddress();
  
  const [formData, setFormData] = useState({
    address_type: 'Home',
    line1: '',
    line2: '',
    state_id: '',
    city_id: '',
    area_id: '',
    pincode: '',
    is_default: false
  });
  
  const [dropdownLoading, setDropdownLoading] = useState({
    cities: false,
    areas: false
  });

  // Reset form when modal opens/closes
  const resetForm = useCallback(() => {
    setFormData({
      address_type: 'Home',
      line1: '',
      line2: '',
      state_id: '',
      city_id: '',
      area_id: '',
      pincode: '',
      is_default: false
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      // Load states only if not already loaded
      if (states.length === 0) {
        getStates();
      }
    }
  }, [isOpen, resetForm, getStates, states.length]);

  const handleStateChange = useCallback(async (stateId) => {
    const newFormData = {
      ...formData,
      state_id: stateId,
      city_id: '',
      area_id: '',
      pincode: ''
    };
    setFormData(newFormData);
    
    if (stateId) {
      setDropdownLoading(prev => ({ ...prev, cities: true }));
      try {
        await getCitiesByState(stateId);
      } catch (error) {
        toastError('Failed to load cities');
      } finally {
        setDropdownLoading(prev => ({ ...prev, cities: false }));
      }
    }
  }, [formData, getCitiesByState]);

  const handleCityChange = useCallback(async (cityId) => {
    const newFormData = {
      ...formData,
      city_id: cityId,
      area_id: '',
      pincode: ''
    };
    setFormData(newFormData);
    
    if (cityId) {
      setDropdownLoading(prev => ({ ...prev, areas: true }));
      try {
        await getAreasByCity(cityId);
      } catch (error) {
        toastError('Failed to load areas');
      } finally {
        setDropdownLoading(prev => ({ ...prev, areas: false }));
      }
    }
  }, [formData, getAreasByCity]);

  const handleAreaChange = useCallback((areaId) => {
    const selectedArea = areas.find(area => area.area_id === areaId);
    setFormData(prev => ({
      ...prev,
      area_id: areaId,
      pincode: selectedArea?.pincode || ''
    }));
  }, [areas]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.line1.trim()) {
      toastError('Please enter address line 1');
      return;
    }
    
    if (!formData.state_id) {
      toastError('Please select a state');
      return;
    }
    
    if (!formData.city_id) {
      toastError('Please select a city');
      return;
    }
    
    if (!formData.area_id) {
      toastError('Please select an area');
      return;
    }

    try {
      const addressData = {
        address_type: formData.address_type,
        line1: formData.line1.trim(),
        line2: formData.line2.trim(),
        area_id: parseInt(formData.area_id),
        is_default: formData.is_default
      };

      const result = await createAddress(addressData);
      
      if (result.success) {
        toastSuccess('Address added successfully');
        onAddressAdded(result.data);
        onClose();
        resetForm();
      } else {
        toastError(result.message || 'Failed to add address');
      }
    } catch (error) {
      toastError('Failed to add address');
    }
  };

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  const isFormValid = formData.line1.trim() && 
                     formData.state_id && 
                     formData.city_id && 
                     formData.area_id;

  return (
    <div className="modal-overlay">
      <div className="add-address-modal">
        <div className="modal-header">
          <h2>Add New Address</h2>
          <button 
            type="button"
            className="btn-close" 
            onClick={handleClose}
            disabled={addressLoading.create}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Address Type *</label>
              <select
                value={formData.address_type}
                onChange={(e) => handleInputChange('address_type', e.target.value)}
                disabled={addressLoading.create}
                required
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={formData.line1}
                onChange={(e) => handleInputChange('line1', e.target.value)}
                placeholder="Street address, P.O. box, company name"
                disabled={addressLoading.create}
                required
              />
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input
                type="text"
                value={formData.line2}
                onChange={(e) => handleInputChange('line2', e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
                disabled={addressLoading.create}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <select
                  value={formData.state_id}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={addressLoading.create || addressLoading.states}
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.state_id} value={state.state_id}>
                      {state.state_name}
                    </option>
                  ))}
                </select>
                {addressLoading.states && <div className="select-loading">Loading states...</div>}
              </div>

              <div className="form-group">
                <label>City *</label>
                <select
                  value={formData.city_id}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!formData.state_id || addressLoading.create || dropdownLoading.cities}
                  required
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
                {dropdownLoading.cities && <div className="select-loading">Loading cities...</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Area *</label>
                <select
                  value={formData.area_id}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  disabled={!formData.city_id || addressLoading.create || dropdownLoading.areas}
                  required
                >
                  <option value="">Select Area</option>
                  {areas.map(area => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.area_name}
                    </option>
                  ))}
                </select>
                {dropdownLoading.areas && <div className="select-loading">Loading areas...</div>}
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  readOnly
                  placeholder="Auto-filled from area"
                  className="readonly-input"
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => handleInputChange('is_default', e.target.checked)}
                  disabled={addressLoading.create}
                />
                <span className="checkbox-custom"></span>
                Set as default address
              </label>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={handleClose}
                disabled={addressLoading.create}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={!isFormValid || addressLoading.create}
              >
                {addressLoading.create ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Adding...
                  </>
                ) : (
                  'Save Address'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal;