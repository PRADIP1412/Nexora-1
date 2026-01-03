import React from 'react';
import { FaEye, FaEdit, FaTrash, FaEnvelope, FaEnvelopeOpen, FaClock, FaUser } from 'react-icons/fa';
import NotificationBadge from './NotificationBadge';

const NotificationTable = ({ 
    notifications, 
    loading, 
    onViewDetails, 
    onMarkRead, 
    onDelete,
    currentPage,
    totalPages,
    onPageChange 
}) => {
    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border">
                <FaEnvelope className="mx-auto text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your filters or check back later.</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User / Message
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type / Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <tr key={notification.notification_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{notification.notification_id}
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaUser className="text-gray-400" />
                                            <span className="font-medium">User #{notification.user_id}</span>
                                            {notification.user_name && (
                                                <span className="text-gray-600">({notification.user_name})</span>
                                            )}
                                        </div>
                                        <div className="font-medium text-gray-900">{notification.title}</div>
                                        <p className="text-sm text-gray-600 truncate max-w-md">
                                            {notification.message}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-2">
                                        <NotificationBadge 
                                            type={notification.type} 
                                            status={notification.is_read ? 'read' : 'unread'}
                                            size="sm"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-gray-400" />
                                        <div>
                                            <div>{formatDate(notification.created_at)}</div>
                                            {notification.read_at && (
                                                <div className="text-xs text-green-600">
                                                    Read: {formatDate(notification.read_at)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(notification)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                            title="View Details"
                                        >
                                            <FaEye /> View
                                        </button>
                                        
                                        {!notification.is_read && (
                                            <button
                                                onClick={() => onMarkRead(notification.notification_id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                                title="Mark as Read"
                                            >
                                                <FaEnvelopeOpen /> Mark Read
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this notification?')) {
                                                    onDelete(notification.notification_id);
                                                }
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-3 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationTable;