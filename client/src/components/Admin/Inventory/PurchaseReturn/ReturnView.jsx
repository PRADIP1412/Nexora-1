// src/components/inventory/PurchaseReturn/ReturnView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { 
  FaExchangeAlt, FaFileInvoice, FaShoppingCart, FaDollarSign, 
  FaCalendar, FaArrowLeft, FaCheckCircle, FaTimesCircle,
  FaBox
} from 'react-icons/fa';
import ReturnItemList from './ReturnItemList';

const ReturnView = () => {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const { currentPurchaseReturn, fetchPurchaseReturnById, loading } = useInventoryContext();

  useEffect(() => {
    if (returnId) {
      fetchPurchaseReturnById(parseInt(returnId));
    }
  }, [returnId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentPurchaseReturn) {
    return (
      <div className="text-center py-12">
        <FaExchangeAlt className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-500">Purchase return not found</p>
        <Link to="/inventory/returns" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Returns
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/inventory/returns"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaExchangeAlt />
              Return #{currentPurchaseReturn.return_id}
            </h1>
            <p className="text-gray-600">Purchase Return Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <FaCheckCircle />
            Approve
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <FaTimesCircle />
            Reject
          </button>
        </div>
      </div>

      {/* Return Details Card */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaFileInvoice />
                Return Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Return ID</p>
                  <p className="font-medium">#{currentPurchaseReturn.return_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase</p>
                  <Link 
                    to={`/inventory/purchases/${currentPurchaseReturn.purchase_id}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FaShoppingCart />
                    Purchase #{currentPurchaseReturn.purchase_id}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentPurchaseReturn.status)}`}>
                    {currentPurchaseReturn.status === 'PENDING' && <FaCheckCircle />}
                    {currentPurchaseReturn.status === 'APPROVED' && <FaCheckCircle />}
                    {currentPurchaseReturn.status === 'COMPLETED' && <FaCheckCircle />}
                    {currentPurchaseReturn.status === 'REJECTED' && <FaTimesCircle />}
                    {currentPurchaseReturn.status}
                  </span>
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
                  <p className="text-sm text-gray-600">Total Refund</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(currentPurchaseReturn.total_refund).toFixed(2)}
                  </p>
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
                <div>
                  <p className="text-sm text-gray-600">Return Date</p>
                  <p className="font-medium">
                    {new Date(currentPurchaseReturn.return_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold text-gray-800 mb-2">Reason for Return</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {currentPurchaseReturn.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Return Items */}
      <div className="mb-6">
        <ReturnItemList items={currentPurchaseReturn.items || []} />
      </div>

      {/* Actions and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Return Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
              <FaCheckCircle />
              Approve Return
            </button>
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
              <FaTimesCircle />
              Reject Return
            </button>
            <Link
              to={`/inventory/purchases/${currentPurchaseReturn.purchase_id}`}
              className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <FaShoppingCart />
              View Purchase
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Return Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold">{currentPurchaseReturn.items?.length || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold">
                {currentPurchaseReturn.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Average Refund per Item</p>
              <p className="text-2xl font-bold">
                ${currentPurchaseReturn.items?.length 
                  ? (parseFloat(currentPurchaseReturn.total_refund) / currentPurchaseReturn.items.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-medium ${getStatusColor(currentPurchaseReturn.status)} px-3 py-1 rounded-full inline-block`}>
                {currentPurchaseReturn.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnView;