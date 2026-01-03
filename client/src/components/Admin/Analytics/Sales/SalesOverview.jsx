import React from 'react';

const SalesOverview = ({ data }) => {
    const { summary, trends, period } = data;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                    </span>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${summary.total_revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Revenue</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{summary.total_orders}</p>
                    <p className="text-sm text-gray-600">Orders</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${summary.average_order_value.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{summary.completed_orders}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                </div>
            </div>

            {/* Trends Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orders
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {trends.slice(-5).map((trend, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {trend.period}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    ${trend.revenue.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {trend.orders}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesOverview;