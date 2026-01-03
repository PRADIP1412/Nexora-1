import React from 'react';
import StatusBadge from '../common/StatusBadge';
import './DeliveryInfo.css';

const DeliveryInfo = ({ order, onAssign, onUpdate, onViewDetails }) => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_id}</h3>
                    <p className="text-sm text-gray-600">
                        Customer: {order.user?.name || `User #${order.user_id}`}
                    </p>
                </div>
                <StatusBadge status={order.order_status} type="order" />
            </div>
            
            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">${parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">${parseFloat(order.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Person:</span>
                    <span className="font-medium">
                        {order.delivery_user_id ? `User #${order.delivery_user_id}` : 'Not assigned'}
                    </span>
                </div>
            </div>
            
            <div className="border-t pt-4">
                <div className="flex space-x-3">
                    <button
                        onClick={onAssign}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                        Assign
                    </button>
                    {order.delivery_user_id && (
                        <button
                            onClick={onUpdate}
                            className="flex-1 bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 text-sm"
                        >
                            Update
                        </button>
                    )}
                    <button
                        onClick={onViewDetails}
                        className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 text-sm"
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryInfo;