import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './OrdersAnalytics.css';
const OrdersAnalytics = ({ stats, ordersByDate, dateRange }) => {
    const orderStatusData = [
        { name: 'Placed', value: stats?.placed || 0 },
        { name: 'Delivered', value: stats?.delivered || 0 },
        { name: 'Processing', value: 0 }, // You would need to calculate this from actual data
        { name: 'Cancelled', value: 0 }, // You would need to calculate this from actual data
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Calculate daily orders
    const dailyOrders = ordersByDate.reduce((acc, order) => {
        const date = new Date(order.placed_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const dailyOrdersData = Object.entries(dailyOrders).map(([date, count]) => ({
        date,
        orders: count
    }));

    return (
        <div className="p-6">
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Order Analytics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-700">{stats?.total || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Delivered</p>
                        <p className="text-2xl font-bold text-green-700">{stats?.delivered || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600">Placed</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats?.placed || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Date Range</p>
                        <p className="text-lg font-bold text-purple-700">
                            {dateRange.startDate} to {dateRange.endDate}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-medium mb-4">Order Status Distribution</h3>
                    <div className="bg-white p-4 rounded-lg border">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Daily Orders ({dateRange.startDate} - {dateRange.endDate})</h3>
                    <div className="bg-white p-4 rounded-lg border">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyOrdersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="orders" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                <div className="bg-white rounded-lg border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {ordersByDate.slice(0, 5).map((order) => (
                                <tr key={order.order_id}>
                                    <td className="px-6 py-4">#{order.order_id}</td>
                                    <td className="px-6 py-4">
                                        {order.user?.name || `User #${order.user_id}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(order.placed_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        ${parseFloat(order.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            order.order_status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                            order.order_status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrdersAnalytics;