import React from 'react';
import { FaBell, FaEnvelope, FaUsers, FaChartLine, FaFileAlt, FaPercentage } from 'react-icons/fa';

const StatsCards = ({ stats, typeStats }) => {
    const statCards = [
        {
            title: 'Total Notifications',
            value: stats?.total_notifications || 0,
            icon: FaBell,
            color: 'bg-blue-500',
            textColor: 'text-blue-700'
        },
        {
            title: 'Unread Notifications',
            value: stats?.total_unread || 0,
            icon: FaEnvelope,
            color: 'bg-red-500',
            textColor: 'text-red-700'
        },
        {
            title: 'Users with Notifications',
            value: stats?.total_users_with_notifications || 0,
            icon: FaUsers,
            color: 'bg-green-500',
            textColor: 'text-green-700'
        },
        {
            title: 'Avg per User',
            value: stats?.average_notifications_per_user?.toFixed(2) || '0.00',
            icon: FaChartLine,
            color: 'bg-purple-500',
            textColor: 'text-purple-700'
        }
    ];

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaChartLine /> Dashboard Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow p-4 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                                <stat.icon className={`text-xl ${stat.textColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Type Breakdown */}
            {typeStats?.stats && typeStats.stats.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-4 border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <FaFileAlt /> Notification Type Breakdown
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {typeStats.stats.map((typeStat, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <FaPercentage className="text-gray-500" />
                                    <span className="font-medium capitalize">{typeStat.type}</span>
                                </div>
                                <p className="text-2xl font-bold">{typeStat.count}</p>
                                <p className="text-sm text-gray-600">{typeStat.percentage}%</p>
                            </div>
                        ))}
                        <div className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2 mb-1">
                                <FaFileAlt className="text-gray-700" />
                                <span className="font-medium">Total</span>
                            </div>
                            <p className="text-2xl font-bold">{typeStats.total}</p>
                            <p className="text-sm text-gray-600">All types</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsCards;