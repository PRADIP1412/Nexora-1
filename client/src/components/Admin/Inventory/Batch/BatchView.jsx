// src/components/inventory/Batch/BatchView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { 
  FaTags, FaCalendar, FaBox, FaShoppingCart, 
  FaArrowLeft, FaEdit, FaClock, FaExclamationTriangle
} from 'react-icons/fa';
import BatchItemList from './BatchItemList';

const BatchView = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { currentBatch, fetchBatchById, loading } = useInventoryContext();

  useEffect(() => {
    if (batchId) {
      fetchBatchById(parseInt(batchId));
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentBatch) {
    return (
      <div className="text-center py-12">
        <FaTags className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-500">Batch not found</p>
        <Link to="/inventory/batches" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Batches
        </Link>
      </div>
    );
  }

  const isExpired = () => {
    if (!currentBatch.expires_at) return false;
    return new Date(currentBatch.expires_at) < new Date();
  };

  const daysUntilExpiry = () => {
    if (!currentBatch.expires_at) return null;
    const expiryDate = new Date(currentBatch.expires_at);
    const today = new Date();
    const diffTime = expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = () => {
    if (!currentBatch.expires_at) return { color: 'bg-gray-100 text-gray-800', label: 'No expiry' };
    
    const days = daysUntilExpiry();
    if (days < 0) return { color: 'bg-red-100 text-red-800', label: 'Expired' };
    if (days <= 30) return { color: 'bg-yellow-100 text-yellow-800', label: `Expires in ${days} days` };
    return { color: 'bg-green-100 text-green-800', label: `Expires in ${days} days` };
  };

  const expiryStatus = getExpiryStatus();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/inventory/batches"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaTags />
              {currentBatch.batch_number}
            </h1>
            <p className="text-gray-600">Product Batch Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/inventory/batches/${batchId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaEdit />
            Edit
          </Link>
        </div>
      </div>

      {/* Batch Details Card */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaTags />
                Batch Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Batch Number</p>
                  <p className="font-medium text-lg">{currentBatch.batch_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Batch ID</p>
                  <p className="font-medium">#{currentBatch.batch_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase</p>
                  <Link 
                    to={`/inventory/purchases/${currentBatch.purchase_id}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaShoppingCart />
                    Purchase #{currentBatch.purchase_id}
                  </Link>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendar />
                Dates
              </h3>
              <div className="space-y-3">
                {currentBatch.manufactured_at && (
                  <div>
                    <p className="text-sm text-gray-600">Manufactured</p>
                    <p className="font-medium">
                      {new Date(currentBatch.manufactured_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {currentBatch.expires_at && (
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="font-medium">
                      {new Date(currentBatch.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {new Date(currentBatch.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock />
                Status
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Expiry Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${expiryStatus.color}`}>
                    {isExpired() && <FaExclamationTriangle />}
                    {expiryStatus.label}
                  </span>
                </div>
                {isExpired() && (
                  <div className="flex items-center gap-2 text-red-600">
                    <FaExclamationTriangle />
                    <p className="text-sm">This batch has expired</p>
                  </div>
                )}
                {daysUntilExpiry() > 0 && daysUntilExpiry() <= 30 && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <FaExclamationTriangle />
                    <p className="text-sm">This batch will expire soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Last updated: {currentBatch.updated_at 
                ? new Date(currentBatch.updated_at).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Batch Items */}
      <div className="mb-6">
        <BatchItemList items={currentBatch.items || []} />
      </div>

      {/* Actions and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to={`/inventory/purchases/${currentBatch.purchase_id}`}
              className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <FaShoppingCart />
              View Purchase
            </Link>
            <Link
              to="/inventory/stock"
              className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
            >
              <FaBox />
              Check Stock
            </Link>
            <button
              onClick={() => navigate('/inventory/batches')}
              className="flex items-center gap-2 w-full p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft />
              Back to Batches
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Batch Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{currentBatch.items?.length || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold">
                {currentBatch.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Manufactured Date</p>
              <p className="text-lg font-medium">
                {currentBatch.manufactured_at 
                  ? new Date(currentBatch.manufactured_at).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Expiry Status</p>
              <p className={`text-lg font-medium ${expiryStatus.color} px-3 py-1 rounded-full inline-block`}>
                {expiryStatus.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchView;