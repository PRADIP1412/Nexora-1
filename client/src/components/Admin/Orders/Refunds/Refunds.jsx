import React from 'react';
import StatusBadge from '../common/StatusBadge';
import './Refunds.css'  
const RefundsList = ({ refunds, onUpdateStatus, onRetry, onViewDetails, loading }) => {
    if (loading && refunds.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">Loading refunds...</div>
            </div>
        );
    }

    if (refunds.length === 0 && !loading) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-500">No refunds found.</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Refund ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Return ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {refunds.map((refund) => (
                        <tr key={refund.refund_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    #{refund.refund_id}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    #{refund.return_id}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    ${parseFloat(refund.amount || 0).toFixed(2)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={refund.status} type="refund" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {new Date(refund.created_at).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => onViewDetails(refund)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                    View
                                </button>
                                {refund.status === 'FAILED' && (
                                    <button
                                        onClick={() => onRetry(refund)}
                                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                                    >
                                        Retry
                                    </button>
                                )}
                                {['PENDING', 'PROCESSING'].includes(refund.status) && (
                                    <button
                                        onClick={() => onUpdateStatus(refund)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Update Status
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RefundsList;