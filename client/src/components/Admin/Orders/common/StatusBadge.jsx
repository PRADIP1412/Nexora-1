import React from 'react'; 
import './StatusBadge.css';
const StatusBadge = ({ status, type = 'order' }) => {
    const getStatusConfig = () => {
        const configs = {
            order: {
                PLACED: { color: 'bg-blue-100 text-blue-800', label: 'Placed' },
                PROCESSING: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
                SHIPPED: { color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
                DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
                CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
            },
            payment: {
                PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
                COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
                FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
                REFUNDED: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
            },
            return: {
                REQUESTED: { color: 'bg-blue-100 text-blue-800', label: 'Requested' },
                APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
                REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
                PROCESSING: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
                COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' }
            },
            refund: {
                PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
                PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
                COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
                FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' }
            }
        };

        const config = configs[type] || configs.order;
        return config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    };

    const config = getStatusConfig();

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;