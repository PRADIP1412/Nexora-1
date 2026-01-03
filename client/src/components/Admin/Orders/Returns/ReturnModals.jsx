import React, { useState } from 'react';
import { useOrderAdminContext } from '../../../../context/OrderAdminContext';
import './ReturnModals.css';

const ReturnModals = ({ returnItem, actionType, onClose, onActionComplete }) => {
    const { approveReturn, rejectReturn, fetchReturnItems } = useOrderAdminContext();
    const [rejectReason, setRejectReason] = useState('');
    const [returnItems, setReturnItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);

    React.useEffect(() => {
        if (actionType === 'view' && returnItem) {
            loadReturnItems();
        }
    }, [actionType, returnItem]);

    const loadReturnItems = async () => {
        setLoadingItems(true);
        const result = await fetchReturnItems(returnItem.return_id);
        if (result.success) {
            setReturnItems(result.data);
        }
        setLoadingItems(false);
    };

    const handleApprove = async () => {
        const result = await approveReturn(returnItem.return_id);
        if (result.success) {
            onActionComplete();
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        
        const result = await rejectReturn(returnItem.return_id, rejectReason);
        if (result.success) {
            onActionComplete();
        }
    };

    if (!returnItem) return null;

    if (actionType === 'view') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Return Items</h3>
                        <p className="text-sm text-gray-600">Return #{returnItem.return_id}</p>
                    </div>
                    
                    {loadingItems ? (
                        <p>Loading items...</p>
                    ) : returnItems.length > 0 ? (
                        <div className="overflow-y-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {returnItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">
                                                {item.variant?.product?.name || `Item ${index + 1}`}
                                            </td>
                                            <td className="px-4 py-2">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No items found for this return.</p>
                    )}
                    
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

    if (actionType === 'approve') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Approve Return</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Are you sure you want to approve return #{returnItem.return_id}?
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleApprove}
                            className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                        >
                            Yes, Approve
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

    if (actionType === 'reject') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Reject Return</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Please provide a reason for rejecting return #{returnItem.return_id}
                        </p>
                    </div>
                    <div className="mb-4">
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleReject}
                            className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                        >
                            Reject Return
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

export default ReturnModals;