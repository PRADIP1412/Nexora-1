import React, { useState } from 'react';
import { useOrderAdminContext } from '../../../../context/OrderAdminContext';
import './DeliveryModals.css';

const DeliveryModals = ({ order, actionType, onClose, onActionComplete }) => {
    const { assignDeliveryPerson, updateDeliveryPerson, fetchDeliveryDetails } = useOrderAdminContext();
    const [deliveryUserId, setDeliveryUserId] = useState(order?.delivery_user_id || '');
    const [deliveryDetails, setDeliveryDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    React.useEffect(() => {
        if (actionType === 'view' && order) {
            loadDeliveryDetails();
        }
    }, [actionType, order]);

    const loadDeliveryDetails = async () => {
        setLoadingDetails(true);
        const result = await fetchDeliveryDetails(order.order_id);
        if (result.success) {
            setDeliveryDetails(result.data);
        }
        setLoadingDetails(false);
    };

    const handleAssign = async () => {
        if (!deliveryUserId) {
            alert('Please enter delivery user ID');
            return;
        }
        
        const result = await assignDeliveryPerson(order.order_id, parseInt(deliveryUserId));
        if (result.success) {
            onActionComplete();
        }
    };

    const handleUpdate = async () => {
        if (!deliveryUserId) {
            alert('Please enter delivery user ID');
            return;
        }
        
        const result = await updateDeliveryPerson(order.order_id, parseInt(deliveryUserId));
        if (result.success) {
            onActionComplete();
        }
    };

    if (!order) return null;

    if (actionType === 'view') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Delivery Details</h3>
                        <p className="text-sm text-gray-600">Order #{order.order_id}</p>
                    </div>
                    
                    {loadingDetails ? (
                        <p>Loading delivery details...</p>
                    ) : deliveryDetails ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-medium">#{deliveryDetails.order_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Person ID</p>
                                    <p className="font-medium">{deliveryDetails.delivery_user_id || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Status</p>
                                    <p className="font-medium">{deliveryDetails.delivery_status}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                    <p className="font-medium">{deliveryDetails.delivery_address || 'N/A'}</p>
                                </div>
                            </div>
                            
                            {deliveryDetails.estimated_delivery && (
                                <div>
                                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                                    <p className="font-medium">
                                        {new Date(deliveryDetails.estimated_delivery).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">No delivery details available.</p>
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

    if (actionType === 'assign' || actionType === 'update') {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                    <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {actionType === 'assign' ? 'Assign Delivery Person' : 'Update Delivery Person'}
                        </h3>
                        <p className="text-sm text-gray-600">Order #{order.order_id}</p>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery User ID
                        </label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter delivery user ID"
                            value={deliveryUserId}
                            onChange={(e) => setDeliveryUserId(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={actionType === 'assign' ? handleAssign : handleUpdate}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        >
                            {actionType === 'assign' ? 'Assign' : 'Update'}
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

export default DeliveryModals;