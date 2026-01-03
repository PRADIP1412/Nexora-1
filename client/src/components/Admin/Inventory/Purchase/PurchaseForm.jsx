// src/components/inventory/Purchase/PurchaseForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaShoppingCart, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const PurchaseForm = () => {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { fetchPurchaseById, createPurchase, updatePurchase, currentPurchase, loading } = useInventoryContext();
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    invoice_number: '',
    total_cost: '0.00',
    status: 'PENDING',
    notes: '',
    items: []
  });

  const [itemForm, setItemForm] = useState({
    variant_id: '',
    quantity: 1,
    cost_per_unit: '0.00',
    total_cost: '0.00'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (purchaseId && purchaseId !== 'new') {
      fetchPurchaseById(parseInt(purchaseId));
    }
  }, [purchaseId]);

  useEffect(() => {
    if (currentPurchase && purchaseId !== 'new') {
      setFormData({
        supplier_id: currentPurchase.supplier_id || '',
        invoice_number: currentPurchase.invoice_number || '',
        total_cost: currentPurchase.total_cost || '0.00',
        status: currentPurchase.status || 'PENDING',
        notes: currentPurchase.notes || '',
        items: currentPurchase.items || []
      });
    }
  }, [currentPurchase]);

  const calculateItemTotal = () => {
    const quantity = parseInt(itemForm.quantity) || 0;
    const cost = parseFloat(itemForm.cost_per_unit) || 0;
    return (quantity * cost).toFixed(2);
  };

  useEffect(() => {
    const total = calculateItemTotal();
    setItemForm(prev => ({ ...prev, total_cost: total }));
  }, [itemForm.quantity, itemForm.cost_per_unit]);

  const calculateTotalCost = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.total_cost) || 0);
    }, 0).toFixed(2);
  };

  const handleAddItem = () => {
    if (!itemForm.variant_id || !itemForm.quantity || !itemForm.cost_per_unit) {
      alert('Please fill all item fields');
      return;
    }

    const newItem = {
      variant_id: parseInt(itemForm.variant_id),
      quantity: parseInt(itemForm.quantity),
      cost_per_unit: parseFloat(itemForm.cost_per_unit).toFixed(2),
      total_cost: itemForm.total_cost
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
      total_cost: calculateTotalCost()
    }));

    // Reset item form
    setItemForm({
      variant_id: '',
      quantity: 1,
      cost_per_unit: '0.00',
      total_cost: '0.00'
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      items: newItems,
      total_cost: newItems.reduce((total, item) => total + (parseFloat(item.total_cost) || 0), 0).toFixed(2)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.supplier_id) newErrors.supplier_id = 'Supplier is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    if (parseFloat(formData.total_cost) <= 0) newErrors.total_cost = 'Total cost must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const purchaseData = {
        ...formData,
        supplier_id: parseInt(formData.supplier_id),
        total_cost: parseFloat(formData.total_cost)
      };

      if (purchaseId && purchaseId !== 'new') {
        await updatePurchase(parseInt(purchaseId), purchaseData);
      } else {
        await createPurchase(purchaseData);
      }
      navigate('/inventory/purchases');
    } catch (error) {
      console.error('Error saving purchase:', error);
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
          <FaShoppingCart />
          {purchaseId && purchaseId !== 'new' ? 'Edit Purchase Order' : 'Create New Purchase Order'}
        </h1>
        <p className="text-gray-600">
          {purchaseId && purchaseId !== 'new' 
            ? 'Update purchase order information' 
            : 'Create a new purchase order for inventory'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border">
        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier ID *
              </label>
              <input
                type="number"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplier_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter supplier ID"
              />
              {errors.supplier_id && <p className="text-red-500 text-sm mt-1">{errors.supplier_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-001"
              />
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
                <option value="RECEIVED">RECEIVED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost
              </label>
              <input
                type="text"
                value={`$${formData.total_cost}`}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes or instructions..."
              />
            </div>
          </div>

          {/* Add Items */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-4">Add Items</h3>
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
                  Cost per Unit ($)
                </label>
                <input
                  type="number"
                  name="cost_per_unit"
                  step="0.01"
                  value={itemForm.cost_per_unit}
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

            {itemForm.variant_id && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-700">
                  Item Total: ${itemForm.total_cost}
                </p>
              </div>
            )}

            {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Purchase Items ({formData.items.length})</h3>
              <div className="bg-gray-50 rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost per Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">{item.variant_id}</td>
                        <td className="px-6 py-4">{item.quantity}</td>
                        <td className="px-6 py-4">${item.cost_per_unit}</td>
                        <td className="px-6 py-4">${item.total_cost}</td>
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
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-green-600">${formData.total_cost}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory/purchases')}
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
            {loading ? 'Saving...' : purchaseId && purchaseId !== 'new' ? 'Update Purchase' : 'Create Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;