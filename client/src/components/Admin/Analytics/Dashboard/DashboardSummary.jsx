import React from 'react';
import MetricCard from './MetricCard';

const DashboardSummary = ({ data }) => {
    const { sales_summary, top_products, customer_insights, inventory_alerts } = data;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
                <span className="text-sm text-gray-500">Real-time data</span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    title="Total Revenue"
                    value={`$${sales_summary.total_revenue.toLocaleString()}`}
                    trend={sales_summary.revenue_growth}
                    icon="💰"
                    color="green"
                />
                <MetricCard
                    title="Total Orders"
                    value={sales_summary.total_orders.toLocaleString()}
                    description={`${sales_summary.completed_orders} completed`}
                    icon="📦"
                    color="blue"
                />
                <MetricCard
                    title="Customers"
                    value={customer_insights.total_customers.toLocaleString()}
                    description={`${customer_insights.new_customers} new`}
                    icon="👥"
                    color="purple"
                />
                <MetricCard
                    title="Inventory Alerts"
                    value={inventory_alerts.length}
                    description={`${inventory_alerts.filter(a => a.status === 'OUT_OF_STOCK').length} out of stock`}
                    icon="⚠️"
                    color="red"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg Order Value</span>
                        <span className="font-semibold">${sales_summary.average_order_value.toFixed(2)}</span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Repeat Purchase Rate</span>
                        <span className="font-semibold">{customer_insights.repeat_purchase_rate.toFixed(1)}%</span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Top Product</span>
                        <span className="font-semibold truncate">
                            {top_products[0]?.product_name || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;