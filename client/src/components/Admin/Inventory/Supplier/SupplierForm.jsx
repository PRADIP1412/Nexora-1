// src/components/inventory/Supplier/SupplierForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaTruck, FaSave, FaTimes, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

const SupplierForm = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { fetchSupplierById, createSupplier, updateSupplier, currentSupplier, loading } = useInventoryContext();
  
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    email: '',
    phone: '',
    address_line: '',
    area_id: '',
    gst_number: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplierId && supplierId !== 'new') {
      fetchSupplierById(parseInt(supplierId));
    }
  }, [supplierId]);

  useEffect(() => {
    if (currentSupplier && supplierId !== 'new') {
      setFormData({
        company_id: currentSupplier.company_id || '',
        name: currentSupplier.name || '',
        email: currentSupplier.email || '',
        phone: currentSupplier.phone || '',
        address_line: currentSupplier.address_line || '',
        area_id: currentSupplier.area_id || '',
        gst_number: currentSupplier.gst_number || '',
        is_active: currentSupplier.is_active !== false
      });
    }
  }, [currentSupplier]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.company_id) newErrors.company_id = 'Company is required';
    if (!formData.name.trim()) newErrors.name = 'Supplier name is required';
    if (!formData.area_id) newErrors.area_id = 'Area is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (supplierId && supplierId !== 'new') {
        await updateSupplier(parseInt(supplierId), formData);
      } else {
        await createSupplier(formData);
      }
      navigate('/inventory/suppliers');
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTruck />
          {supplierId && supplierId !== 'new' ? 'Edit Supplier' : 'Create New Supplier'}
        </h1>
        <p className="text-gray-600">
          {supplierId && supplierId !== 'new' 
            ? 'Update supplier information' 
            : 'Add a new supplier to your inventory system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company ID *
            </label>
            <div className="flex items-center gap-2">
              <FaBuilding className="text-gray-400" />
              <input
                type="number"
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.company_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter company ID"
              />
            </div>
            {errors.company_id && <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>}
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter supplier name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="supplier@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91 1234567890"
            />
          </div>

          {/* Area ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area ID *
            </label>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <input
                type="number"
                name="area_id"
                value={formData.area_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.area_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter area ID"
              />
            </div>
            {errors.area_id && <p className="text-red-500 text-sm mt-1">{errors.area_id}</p>}
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Number
            </label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GSTIN Number"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter supplier address"
            />
          </div>

          {/* Active Status */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Supplier</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Inactive suppliers won't appear in dropdowns for new purchases
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/inventory/suppliers')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FaTimes />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <FaSave />
            {loading ? 'Saving...' : supplierId && supplierId !== 'new' ? 'Update Supplier' : 'Create Supplier'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;