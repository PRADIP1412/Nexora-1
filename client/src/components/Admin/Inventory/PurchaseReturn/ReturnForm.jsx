// src/components/inventory/PurchaseReturn/ReturnForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaExchangeAlt, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const ReturnForm = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const purchaseIdFromQuery = queryParams.get('purchase');
  
  const { fetchPurchaseReturnById, createPurchaseReturn, updatePurchaseReturn, currentPurchaseReturn, loading } = useInventoryContext();
  
  const [formData, setFormData] = useState({
    purchase_id: purchaseIdFromQuery || '',
    reason: '',
    total_refund: '0.00',
    status: 'PENDING',
    items: []
  });

  const [itemForm, setItemForm] = useState({
    variant_id: '',
    quantity: 1,
    refund_amount: '0.00',
    reason: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (returnId && returnId !== 'new') {
      fetchPurchaseReturnById(parseInt(returnId));
    }
  }, [returnId]);

  useEffect(() => {
    if (currentPurchaseReturn && returnId !== 'new') {
      setFormData({
        purchase_id: currentPurchaseReturn.purchase_id || '',
        reason: currentPurchaseReturn.reason || '',
        total_refund: currentPurchaseReturn.total_refund || '0.00',
        status: currentPurchaseReturn.status || 'PENDING',
        items: currentPurchaseReturn.items || []
      });
    }
  }, [currentPurchaseReturn]);

  const calculateTotalRefund = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.refund_amount) || 0);
    }, 0).toFixed(2);
  };

  const handleAddItem = () => {
    if (!itemForm.variant_id || !itemForm.quantity || !itemForm.refund_amount) {
      alert('Please fill all item fields');
      return;
    }

    const newItem = {
      variant_id: parseInt(itemForm.variant_id),
      quantity: parseInt(itemForm.quantity),
      refund_amount: parseFloat(itemForm.refund_amount).toFixed(2),
      reason: itemForm.reason || ''
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      total_refund: calculateTotalRefund()
    }));

    // Reset item form
    setItemForm({
      variant_id: '',
      quantity: 1,
      refund_amount: '0.00',
      reason: ''
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      total_refund: newItems.reduce((total, item) => total + (parseFloat(item.refund_amount) || 0), 0).toFixed(2)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.purchase_id) newErrors.purchase_id = 'Purchase ID is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const returnData = {
        ...formData,
        purchase_id: parseInt(formData.purchase_id),
        total_refund: parseFloat(formData.total_refund)
      };

      if (returnId && returnId !== 'new') {
        await updatePurchaseReturn(parseInt(returnId), returnData);
      } else {
        await createPurchaseReturn(returnData);
      }
      navigate('/inventory/returns');
    } catch (error) {
      console.error('Error saving return:', error);
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaExchangeAlt />
          {returnId && returnId !== 'new' ? 'Edit Purchase Return' : 'Create Purchase Return'}
        </h1>
        <p className="text-gray-600">
          {returnId && returnId !== 'new' 
            ? 'Update return information' 
            : 'Create a return for a purchase order'}
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
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Return *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the reason for return..."
              />
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Refund
              </label>
              <input
                type="text"
                value={`$${formData.total_refund}`}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Return Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refund Amount ($)
                </label>
                <input
                  type="number"
                  name="refund_amount"
                  step="0.01"
                  value={itemForm.refund_amount}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Reason (Optional)
              </label>
              <input
                type="text"
                name="reason"
                value={itemForm.reason}
                onChange={handleItemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for returning this item..."
              />
            </div>

            {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Return Items ({formData.items.length})</h3>
              <div className="bg-gray-50 rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{item.variant_id}</td>
                        <td className="px-6 py-4">{item.quantity}</td>
                        <td className="px-6 py-4">${item.refund_amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.reason || '-'}</td>
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
                <p className="text-sm text-gray-600">Total Refund</p>
                <p className="text-2xl font-bold text-green-600">${formData.total_refund}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory/returns')}
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
            {loading ? 'Saving...' : returnId && returnId !== 'new' ? 'Update Return' : 'Create Return'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnForm;