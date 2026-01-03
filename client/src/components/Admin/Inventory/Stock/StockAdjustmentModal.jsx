// src/components/inventory/Stock/StockAdjustmentModal.jsx
import React, { useState } from 'react';
import { FaTimes, FaBox, FaPlus, FaMinus } from 'react-icons/fa';

const StockAdjustmentModal = ({ isOpen, onClose, onAdjust, variant }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    remark: '',
    movement_type: 'ADJUSTMENT',
    unit_cost: variant?.unit_cost || 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdjust({
      ...formData,
      variant_id: variant?.variant_id
    });
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaBox />
            Adjust Stock
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {variant && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{variant.variant_name}</p>
              <p className="text-sm text-gray-600">
                Current Stock: {variant.current_stock}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Type
              </label>
              <select
                name="movement_type"
                value={formData.movement_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADJUSTMENT">Manual Adjustment</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    quantity: Math.max(1, prev.quantity - 1)
                  }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    quantity: prev.quantity + 1
                  }))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                name="unit_cost"
                step="0.01"
                value={formData.unit_cost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows="3"
                placeholder="Reason for adjustment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Adjust Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;