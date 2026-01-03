// src/components/inventory/Common/InventoryCard.jsx
import React from 'react';
import { FaEdit, FaTrash, FaEye, FaTag, FaCalendar, FaBox } from 'react-icons/fa';

const InventoryCard = ({ item, type, onView, onEdit, onDelete }) => {
  const getIcon = () => {
    switch (type) {
      case 'company':
        return <FaTag className="text-blue-600" />;
      case 'supplier':
        return <FaBox className="text-green-600" />;
      case 'purchase':
        return <FaCalendar className="text-yellow-600" />;
      case 'batch':
        return <FaTag className="text-purple-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const getBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
      case 'RECEIVED':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">
              {item.name || item.batch_number || item.invoice_number || 'Untitled'}
            </h3>
            <p className="text-sm text-gray-600">
              {item.email || item.gst_number || item.supplier_name || 'No description'}
            </p>
          </div>
        </div>
        
        {item.status && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(item.status)}`}>
            {item.status}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {item.created_at && (
          <p className="text-sm text-gray-600">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </p>
        )}
        {item.total_cost && (
          <p className="text-sm font-medium">
            Total: ${parseFloat(item.total_cost).toFixed(2)}
          </p>
        )}
        {item.quantity && (
          <p className="text-sm">
            Quantity: <span className="font-medium">{item.quantity}</span>
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
        {onView && (
          <button
            onClick={() => onView(item)}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <FaEye size={12} />
            View
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
          >
            <FaEdit size={12} />
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(item)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <FaTrash size={12} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;