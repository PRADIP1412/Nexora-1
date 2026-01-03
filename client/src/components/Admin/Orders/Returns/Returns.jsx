import React from 'react';
import StatusBadge from '../common/StatusBadge';
import './Returns.css';

const ReturnsList = ({ returns, onApprove, onReject, onViewItems, loading }) => {
    if (loading && returns.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">Loading returns...</div>
            </div>
        );
    }

    if (returns.length === 0 && !loading) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-500">No return requests found.</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {returns.map((returnItem) => (
                        <tr key={returnItem.return_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    #{returnItem.return_id}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    #{returnItem.order_id}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                    {returnItem.reason || 'No reason provided'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {new Date(returnItem.requested_at).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={returnItem.status} type="return" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => onViewItems(returnItem)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                    View Items
                                </button>
                                {returnItem.status === 'REQUESTED' && (
                                    <>
                                        <button
                                            onClick={() => onApprove(returnItem)}
                                            className="text-green-600 hover:text-green-900 mr-3"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onReject(returnItem)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReturnsList;