import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaTruck, FaUserCheck } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';
import DeliveryFilters from './DeliveryFilters';

const DeliveryList = ({ onViewDetails, onAssignClick, onStatusUpdateClick }) => {
    const {
        adminDeliveries,
        loading,
        error,
        adminSearchDeliveries,
        adminCancelDelivery,
        clearError
    } = useDeliveryContext();

    const [actionLoading, setActionLoading] = useState(false);

    const handleFilter = async (filters) => {
        await adminSearchDeliveries(filters);
    };

    const handleSearch = async (searchTerm) => {
        if (searchTerm.trim()) {
            await adminSearchDeliveries({ search: searchTerm });
        }
    };

    const handleCancelDelivery = async (deliveryId) => {
        if (window.confirm('Are you sure you want to cancel this delivery?')) {
            setActionLoading(true);
            const result = await adminCancelDelivery(deliveryId);
            setActionLoading(false);
            if (result.success) {
                alert('Delivery cancelled successfully');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            ASSIGNED: 'bg-blue-100 text-blue-800',
            PICKED: 'bg-yellow-100 text-yellow-800',
            OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
            DELIVERED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        };

        const statusIcons = {
            ASSIGNED: <FaUserCheck className="mr-1" />,
            PICKED: <FaTruck className="mr-1" />,
            OUT_FOR_DELIVERY: <FaTruck className="mr-1" />,
            DELIVERED: <FaCheck className="mr-1" />,
            CANCELLED: <FaTimes className="mr-1" />
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {statusIcons[status]}
                {status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (loading && adminDeliveries.length === 0 && !actionLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Error Messages */}
            {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-center">
                        <p className="text-red-700">{error}</p>
                        <button onClick={clearError} className="text-red-500 hover:text-red-700">
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="px-6 py-4">
                <DeliveryFilters 
                    onFilter={handleFilter} 
                    onSearch={handleSearch}
                    loading={loading || actionLoading}
                />
            </div>

            {/* Delivery Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivery ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivery Person
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delivered At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {adminDeliveries.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No deliveries found
                                </td>
                            </tr>
                        ) : (
                            adminDeliveries.map((delivery) => (
                                <tr key={delivery.delivery_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{delivery.delivery_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        #{delivery.order_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {delivery.delivery_person_id ? (
                                            <span className="font-medium">DP#{delivery.delivery_person_id}</span>
                                        ) : (
                                            <span className="text-gray-400">Not assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(delivery.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatDate(delivery.assigned_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {delivery.delivered_at ? formatDate(delivery.delivered_at) : 'Pending'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onViewDetails(delivery)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="View Details"
                                                disabled={actionLoading}
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => onAssignClick(delivery)}
                                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                title="Assign/Reassign"
                                                disabled={actionLoading}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => onStatusUpdateClick(delivery)}
                                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                                                title="Update Status"
                                                disabled={actionLoading}
                                            >
                                                <FaCheck />
                                            </button>
                                            {delivery.status !== 'CANCELLED' && delivery.status !== 'DELIVERED' && (
                                                <button
                                                    onClick={() => handleCancelDelivery(delivery.delivery_id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                    title="Cancel Delivery"
                                                    disabled={actionLoading}
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Loading Overlay */}
            {(loading || actionLoading) && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default DeliveryList;