import React, { useState } from 'react';
import { useOrderAdminContext } from '../../../../context/OrderAdminContext';
import './RefundModals.css';

const RefundModals = ({ refund, actionType, onClose, onActionComplete }) => {
    const { updateRefundStatus, retryRefund } = useOrderAdminContext();
    const [newStatus, setNewStatus] = useState(refund?.status || '');

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        
        const result = await updateRefundStatus(refund.refund_id, newStatus);
        if (result.success) {
            onActionComplete();
        }
    };

    const handleRetry = async () => {
        const result = await retryRefund(refund.refund_id);
        if (result.success) {
            onActionComplete();
        }
    };

    if (!refund) return null;

    if (actionType === 'view') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Refund Details</h3>
                        <p className="text-sm text-gray-600">Refund #{refund.refund_id}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Refund ID</p>
                                <p className="font-medium">#{refund.refund_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Return ID</p>
                                <p className="font-medium">#{refund.return_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Amount</p>
                                <p className="font-medium">${parseFloat(refund.amount || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{refund.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Created Date</p>
                                <p className="font-medium">
                                    {new Date(refund.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Payment Method</p>
                                <p className="font-medium">{refund.payment_method || 'N/A'}</p>
                            </div>
                        </div>
                        
                        {refund.reason && (
                            <div>
                                <p className="text-sm text-gray-500">Reason</p>
                                <p className="font-medium">{refund.reason}</p>
                            </div>
                        )}
                        
                        {refund.transaction_id && (
                            <div>
                                <p className="text-sm text-gray-500">Transaction ID</p>
                                <p className="font-medium">{refund.transaction_id}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (actionType === 'update') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Update Refund Status</h3>
                        <p className="text-sm text-gray-600">Refund #{refund.refund_id}</p>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={handleUpdateStatus}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        >
                            Update Status
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (actionType === 'retry') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Retry Refund</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Are you sure you want to retry refund #{refund.refund_id}?
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleRetry}
                            className="flex-1 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700"
                        >
                            Yes, Retry
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default RefundModals;