import React from 'react';

const RevenueMetrics = ({ summary }) => {
    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Revenue Breakdown</h4>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold">${summary.total_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Refunded Amount</span>
                    <span className="font-semibold text-red-600">${summary.refunded_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Net Revenue</span>
                    <span className="font-semibold text-green-600">
                        ${(summary.total_revenue - summary.refunded_amount).toLocaleString()}
                    </span>
                </div>
                <div className="pt-3 border-t">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cancelled Orders</span>
                        <span className="font-semibold">{summary.cancelled_orders}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueMetrics;