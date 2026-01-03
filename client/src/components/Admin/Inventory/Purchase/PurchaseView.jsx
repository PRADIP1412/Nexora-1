// src/components/inventory/Purchase/PurchaseView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { 
  FaShoppingCart, FaFileInvoice, FaTruck, FaDollarSign, 
  FaCalendar, FaEdit, FaTrash, FaArrowLeft, FaBox,
  FaCheckCircle, FaTimesCircle, FaHistory
} from 'react-icons/fa';
import PurchaseItemList from './PurchaseItemList';
import PurchaseStatusBadge from './PurchaseStatusBadge';

const PurchaseView = () => {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const { currentPurchase, fetchPurchaseById, loading } = useInventoryContext();

  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseById(parseInt(purchaseId));
    }
  }, [purchaseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentPurchase) {
    return (
      <div className="text-center py-12">
        <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-500">Purchase not found</p>
        <Link to="/inventory/purchases" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Purchases
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/inventory/purchases"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaShoppingCart />
              {currentPurchase.invoice_number || `Purchase #${currentPurchase.purchase_id}`}
            </h1>
            <p className="text-gray-600">Purchase Order Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/inventory/purchases/${purchaseId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaEdit />
            Edit
          </Link>
          <Link
            to={`/inventory/batches/new?purchase=${purchaseId}`}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaBox />
            Create Batch
          </Link>
        </div>
      </div>

      {/* Purchase Details Card */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaFileInvoice />
                Purchase Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Purchase ID</p>
                  <p className="font-medium">#{currentPurchase.purchase_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <Link 
                    to={`/inventory/suppliers/${currentPurchase.supplier_id}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaTruck />
                    Supplier #{currentPurchase.supplier_id}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <PurchaseStatusBadge status={currentPurchase.status} />
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaDollarSign />
                Financial Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(currentPurchase.total_cost).toFixed(2)}
                  </p>
                </div>
                {currentPurchase.invoice_number && (
                  <div>
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="font-medium">{currentPurchase.invoice_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendar />
                Dates
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="font-medium">
                    {new Date(currentPurchase.purchase_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">
                    {new Date(currentPurchase.created_at).toLocaleDateString()}
                  </p>
                </div>
                {currentPurchase.updated_at && (
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">
                      {new Date(currentPurchase.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {currentPurchase.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-gray-800 mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {currentPurchase.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-green-600 hover:text-green-800">
                <FaCheckCircle />
                Mark as Received
              </button>
              <button className="flex items-center gap-2 text-red-600 hover:text-red-800">
                <FaTimesCircle />
                Cancel Order
              </button>
            </div>
            <Link
              to="/inventory/returns/new"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <FaHistory />
              Create Return
            </Link>
          </div>
        </div>
      </div>

      {/* Purchase Items */}
      <div className="mb-6">
        <PurchaseItemList items={currentPurchase.items || []} />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to={`/inventory/batches/new?purchase=${purchaseId}`}
              className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <FaBox />
              Create Product Batch
            </Link>
            <Link
              to="/inventory/returns/new"
              className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
            >
              <FaHistory />
              Initiate Return
            </Link>
            <button
              onClick={() => navigate('/inventory/purchases')}
              className="flex items-center gap-2 w-full p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft />
              Back to Purchases
            </button>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Purchase Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{currentPurchase.items?.length || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold">
                {currentPurchase.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Average Cost per Item</p>
              <p className="text-2xl font-bold">
                ${currentPurchase.items?.length 
                  ? (parseFloat(currentPurchase.total_cost) / currentPurchase.items.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status History</p>
              <p className="text-lg font-medium">{currentPurchase.status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseView;