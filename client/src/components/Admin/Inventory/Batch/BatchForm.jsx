// src/components/inventory/Batch/BatchForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaTags, FaSave, FaTimes, FaPlus, FaTrash, FaCalendar } from 'react-icons/fa';

const BatchForm = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const purchaseIdFromQuery = queryParams.get('purchase');
  
  const { fetchBatchById, createBatch, updateBatch, currentBatch, loading } = useInventoryContext();
  
  const [formData, setFormData] = useState({
    purchase_id: purchaseIdFromQuery || '',
    batch_number: '',
    manufactured_at: '',
    expires_at: '',
    items: []
  });

  const [itemForm, setItemForm] = useState({
    variant_id: '',
    quantity: 1
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (batchId && batchId !== 'new') {
      fetchBatchById(parseInt(batchId));
    }
  }, [batchId]);

  useEffect(() => {
    if (currentBatch && batchId !== 'new') {
      setFormData({
        purchase_id: currentBatch.purchase_id || '',
        batch_number: currentBatch.batch_number || '',
        manufactured_at: currentBatch.manufactured_at ? new Date(currentBatch.manufactured_at).toISOString().split('T')[0] : '',
        expires_at: currentBatch.expires_at ? new Date(currentBatch.expires_at).toISOString().split('T')[0] : '',
        items: currentBatch.items || []
      });
    }
  }, [currentBatch]);

  const handleAddItem = () => {
    if (!itemForm.variant_id || !itemForm.quantity) {
      alert('Please fill all item fields');
      return;
    }

    const newItem = {
      variant_id: parseInt(itemForm.variant_id),
      quantity: parseInt(itemForm.quantity)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset item form
    setItemForm({
      variant_id: '',
      quantity: 1
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.purchase_id) newErrors.purchase_id = 'Purchase ID is required';
    if (!formData.batch_number.trim()) newErrors.batch_number = 'Batch number is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const batchData = {
        ...formData,
        purchase_id: parseInt(formData.purchase_id)
      };

      if (batchId && batchId !== 'new') {
        await updateBatch(parseInt(batchId), batchData);
      } else {
        await createBatch(batchData);
      }
      navigate('/inventory/batches');
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const totalQuantity = formData.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTags />
          {batchId && batchId !== 'new' ? 'Edit Product Batch' : 'Create Product Batch'}
        </h1>
        <p className="text-gray-600">
          {batchId && batchId !== 'new' 
            ? 'Update batch information' 
            : 'Create a new product batch for inventory'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border">
        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase ID *
              </label>
              <input
                type="number"
                name="purchase_id"
                value={formData.purchase_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.purchase_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter purchase ID"
              />
              {errors.purchase_id && <p className="text-red-500 text-sm mt-1">{errors.purchase_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.batch_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="BATCH-001"
              />
              {errors.batch_number && <p className="text-red-500 text-sm mt-1">{errors.batch_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1">
                  <FaCalendar />
                  Manufactured Date
                </div>
              </label>
              <input
                type="date"
                name="manufactured_at"
                value={formData.manufactured_at}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1">
                  <FaCalendar />
                  Expiry Date
                </div>
              </label>
              <input
                type="date"
                name="expires_at"
                value={formData.expires_at}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Batch Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant ID
                </label>
                <input
                  type="number"
                  name="variant_id"
                  value={itemForm.variant_id}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={itemForm.quantity}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FaPlus />
                  Add Item
                </button>
              </div>
            </div>

            {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">
                Batch Items ({formData.items.length}) - Total Quantity: {totalQuantity}
              </h3>
              <div className="bg-gray-50 rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{item.variant_id}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-xl font-bold">{formData.items.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-green-600">{totalQuantity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory/batches')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FaTimes />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.items.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <FaSave />
            {loading ? 'Saving...' : batchId && batchId !== 'new' ? 'Update Batch' : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchForm;