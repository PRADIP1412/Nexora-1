// src/components/inventory/Company/CompanyForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaBuilding, FaSave, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

const CompanyForm = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { fetchCompanyById, createCompany, updateCompany, currentCompany, loading } = useInventoryContext();
  
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    address_line: '',
    area_id: '',
    contact_email: '',
    contact_phone: '',
    website: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (companyId && companyId !== 'new') {
      fetchCompanyById(parseInt(companyId));
    }
  }, [companyId]);

  useEffect(() => {
    if (currentCompany && companyId !== 'new') {
      setFormData({
        name: currentCompany.name || '',
        gst_number: currentCompany.gst_number || '',
        address_line: currentCompany.address_line || '',
        area_id: currentCompany.area_id || '',
        contact_email: currentCompany.contact_email || '',
        contact_phone: currentCompany.contact_phone || '',
        website: currentCompany.website || ''
      });
    }
  }, [currentCompany]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.area_id) newErrors.area_id = 'Area is required';
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (companyId && companyId !== 'new') {
        await updateCompany(parseInt(companyId), formData);
      } else {
        await createCompany(formData);
      }
      navigate('/inventory/companies');
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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
          <FaBuilding />
          {companyId && companyId !== 'new' ? 'Edit Company' : 'Create New Company'}
        </h1>
        <p className="text-gray-600">
          {companyId && companyId !== 'new' 
            ? 'Update company information' 
            : 'Add a new company to your inventory system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter company name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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

          {/* Area ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area ID *
            </label>
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
            {errors.area_id && <p className="text-red-500 text-sm mt-1">{errors.area_id}</p>}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400" />
              <textarea
                name="address_line"
                value={formData.address_line}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company address"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contact_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@company.com"
            />
            {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91 1234567890"
            />
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://company.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/inventory/companies')}
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
            {loading ? 'Saving...' : companyId && companyId !== 'new' ? 'Update Company' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;