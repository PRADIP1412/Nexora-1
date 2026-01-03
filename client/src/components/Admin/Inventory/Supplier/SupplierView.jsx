// src/components/inventory/Supplier/SupplierView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { 
  FaTruck, FaEnvelope, FaPhone, FaBuilding, 
  FaMapMarkerAlt, FaCalendar, FaEdit, FaTrash, 
  FaArrowLeft, FaShoppingCart 
} from 'react-icons/fa';

const SupplierView = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { currentSupplier, fetchSupplierById, deleteSupplier, loading } = useInventoryContext();

  useEffect(() => {
    if (supplierId) {
      fetchSupplierById(parseInt(supplierId));
    }
  }, [supplierId]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${currentSupplier.name}?`)) {
      await deleteSupplier(parseInt(supplierId));
      navigate('/inventory/suppliers');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentSupplier) {
    return (
      <div className="text-center py-12">
        <FaTruck className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-500">Supplier not found</p>
        <Link to="/inventory/suppliers" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/inventory/suppliers"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaTruck />
              {currentSupplier.name}
            </h1>
            <p className="text-gray-600">Supplier Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/inventory/suppliers/${supplierId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaEdit />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </div>

      {/* Supplier Details Card */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTruck />
                Supplier Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Supplier Name</p>
                  <p className="font-medium">{currentSupplier.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">Company #{currentSupplier.company_id}</p>
                </div>
                {currentSupplier.gst_number && (
                  <div>
                    <p className="text-sm text-gray-600">GST Number</p>
                    <p className="font-medium">{currentSupplier.gst_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentSupplier.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {currentSupplier.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPhone />
                Contact Information
              </h3>
              <div className="space-y-3">
                {currentSupplier.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{currentSupplier.email}</p>
                    </div>
                  </div>
                )}
                {currentSupplier.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{currentSupplier.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaBuilding className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Area ID</p>
                    <p className="font-medium">{currentSupplier.area_id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {currentSupplier.address_line && (
              <div className="md:col-span-2">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Address
                </h3>
                <p className="text-gray-700">{currentSupplier.address_line}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaCalendar />
                <span>
                  Created: {new Date(currentSupplier.created_at).toLocaleDateString()}
                </span>
              </div>
              {currentSupplier.updated_at && (
                <div className="flex items-center gap-1">
                  <FaCalendar />
                  <span>
                    Updated: {new Date(currentSupplier.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <FaCalendar />
                <span>
                  Last Purchase: {currentSupplier.last_purchase_date 
                    ? new Date(currentSupplier.last_purchase_date).toLocaleDateString() 
                    : 'Never'}
                </span>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Total Purchases: </span>
              <span className="font-bold">${parseFloat(currentSupplier.total_purchases || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Purchase History</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Purchases</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Active Orders</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Value</span>
              <span className="font-bold">${parseFloat(currentSupplier.total_purchases || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/inventory/purchases/new"
              className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <FaShoppingCart />
              Create Purchase Order
            </Link>
            <Link
              to={`/inventory/companies/${currentSupplier.company_id}`}
              className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
            >
              <FaBuilding />
              View Company
            </Link>
            <button
              onClick={() => navigate('/inventory/suppliers')}
              className="flex items-center gap-2 w-full p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft />
              Back to Suppliers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierView;