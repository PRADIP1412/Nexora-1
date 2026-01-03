// src/components/inventory/Stock/VariantStockCard.jsx
import React, { useState } from 'react';
import { FaBox, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import StockAdjustmentModal from './StockAdjustmentModal';

const VariantStockCard = ({ item }) => {
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  const getStockLevelColor = () => {
    if (item.current_stock === 0) return 'text-red-600';
    if (item.current_stock < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockLevelText = () => {
    if (item.current_stock === 0) return 'Out of Stock';
    if (item.current_stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <>
      <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <FaBox className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{item.variant_name}</h4>
              <p className="text-sm text-gray-600">SKU: {item.variant_id}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAdjustModal(true)}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Adjust Stock"
          >
            <FaEdit />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className={`text-2xl font-bold ${getStockLevelColor()}`}>
              {item.current_stock}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Stock Value</p>
            <p className="text-xl font-bold text-gray-800">
              ${(item.current_stock * (item.average_cost || 1)).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600">
              <FaArrowUp />
              <span className="text-sm">In: {item.total_in || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <FaArrowDown />
              <span className="text-sm">Out: {item.total_out || 0}</span>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.current_stock === 0 ? 'bg-red-100 text-red-800' :
            item.current_stock < 10 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {getStockLevelText()}
          </span>
        </div>

        {item.current_stock < 10 && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
            <FaExclamationTriangle />
            <p className="text-sm">Reorder recommended</p>
          </div>
        )}
      </div>

      <StockAdjustmentModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onAdjust={(data) => console.log('Adjust:', data)}
        variant={item}
      />
    </>
  );
};

export default VariantStockCard;