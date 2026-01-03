import React from 'react';
import StatusBadge from '../common/StatusBadge';
import './OrdersTable.css';
const OrdersTable = ({ orders, onViewOrder, loading }) => {
    if (loading && orders.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">Loading orders...</div>
            </div>
        );
    }

    if (orders.length === 0 && !loading) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-500">No orders found.</div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getButtonText = (orderStatus) => {
        if (orderStatus === 'CANCELLED' || orderStatus === 'DELIVERED') {
            return 'View';
        }
        return 'Manage';
    };

    const getButtonStyle = (orderStatus) => {
        const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
        
        if (orderStatus === 'CANCELLED' || orderStatus === 'DELIVERED') {
            return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
        }
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.order_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    #{order.order_id}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {order.user?.name || `User #${order.user_id}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {order.user?.email || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {formatDate(order.placed_at)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(parseFloat(order.total_amount))}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={order.order_status} type="order" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={order.payment_status} type="payment" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => onViewOrder(order.order_id)}
                                    className={getButtonStyle(order.order_status)}
                                >
                                    {getButtonText(order.order_status)}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;