// src/components/inventory/Supplier/SupplierCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const SupplierCard = ({ supplier, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${supplier.is_active ? 'bg-green-50' : 'bg-gray-50'}`}>
            <FaTruck className={`${supplier.is_active ? 'text-green-600' : 'text-gray-600'} text-xl`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{supplier.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <FaBuilding className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-600">Company #{supplier.company_id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/inventory/suppliers/${supplier.supplier_id}`}
            className="p-2 text-blue-600 hover:text-blue-800"
            title="View"
          >
            <FaEye />
          </Link>
          <button
            onClick={() => onEdit(supplier)}
            className="p-2 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(supplier)}
            className="p-2 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {supplier.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaEnvelope />
            <p className="text-sm">{supplier.email}</p>
          </div>
        )}
        
        {supplier.phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaPhone />
            <p className="text-sm">{supplier.phone}</p>
          </div>
        )}
        
        {supplier.address_line && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaMapMarkerAlt className="mt-1" />
            <p className="text-sm">{supplier.address_line}</p>
          </div>
        )}
        
        {supplier.gst_number && (
          <div className="text-sm">
            <span className="text-gray-600">GST: </span>
            <span className="font-medium">{supplier.gst_number}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {supplier.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className="text-xs text-gray-500">
            Purchases: {supplier.total_purchases || 0}
          </span>
        </div>
        <Link
          to={`/inventory/suppliers/${supplier.supplier_id}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default SupplierCard;