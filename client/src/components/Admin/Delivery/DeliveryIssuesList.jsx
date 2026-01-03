import React from 'react';
import { FaExclamationTriangle, FaEye, FaCheckCircle, FaTimes, FaUser, FaCalendar } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

const DeliveryIssuesList = () => {
    const {
        deliveryIssues,
        loading
    } = useDeliveryContext();

    if (loading && deliveryIssues.length === 0) {
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
                        <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    const getPriorityBadge = (priority) => {
        const colors = {
            HIGH: 'bg-red-100 text-red-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-blue-100 text-blue-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status) => {
        const colors = {
            OPEN: 'bg-red-100 text-red-800',
            IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Delivery Issues</h3>
                        <p className="text-gray-600">
                            {deliveryIssues.length} issue{deliveryIssues.length !== 1 ? 's' : ''} reported
                        </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                        <FaExclamationTriangle className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Issues Summary */}
            {deliveryIssues.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Open Issues</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {deliveryIssues.filter(issue => issue.status === 'OPEN').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                    <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">In Progress</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {deliveryIssues.filter(issue => issue.status === 'IN_PROGRESS').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <FaCheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Resolved</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {deliveryIssues.filter(issue => issue.status === 'RESOLVED' || issue.status === 'CLOSED').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Issues List */}
            <div className="overflow-x-auto">
                {deliveryIssues.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <FaCheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No Issues Found</h4>
                        <p className="text-gray-500">Great! There are currently no reported delivery issues.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Issue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Delivery
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reported
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {deliveryIssues.map((issue) => (
                                <tr key={issue.issue_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <FaExclamationTriangle className={`w-5 h-5 ${issue.priority === 'HIGH' ? 'text-red-500' :
                                                    issue.priority === 'MEDIUM' ? 'text-yellow-500' :
                                                    'text-blue-500'
                                                }`} />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{issue.title || 'Delivery Issue'}</p>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                    {issue.description || 'No description provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaUser className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">
                                                D#{issue.delivery_id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(issue.priority)}`}>
                                            {issue.priority || 'MEDIUM'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(issue.status)}`}>
                                            {issue.status || 'OPEN'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FaCalendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-700">
                                                {formatDate(issue.created_at)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                            {issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
                                                <button
                                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                    title="Mark as Resolved"
                                                >
                                                    <FaCheckCircle />
                                                </button>
                                            )}
                                            <button
                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                title="Close Issue"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DeliveryIssuesList;