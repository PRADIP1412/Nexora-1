import React from 'react';
import { FaTruck, FaCheckCircle, FaClock, FaTimesCircle, FaChartBar } from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

const DeliveryStatsCard = () => {
    const {
        deliveryStats,
        loading,
        deliveryPersons
    } = useDeliveryContext();

    // Show loading state
    if (loading && Object.keys(deliveryStats || {}).length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Show empty state if no data
    if (!deliveryStats || Object.keys(deliveryStats).length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-600">No Data Available</p>
                            <p className="text-gray-400 text-xs mt-1">Waiting for delivery data...</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FaChartBar className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Active Deliveries',
            value: deliveryStats?.active || 0,
            icon: <FaTruck className="w-8 h-8" />,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Completed',
            value: deliveryStats?.completed || 0,
            icon: <FaCheckCircle className="w-8 h-8" />,
            color: 'bg-green-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending',
            value: deliveryStats?.pending || 0,
            icon: <FaClock className="w-8 h-8" />,
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Cancelled',
            value: deliveryStats?.cancelled || 0,
            icon: <FaTimesCircle className="w-8 h-8" />,
            color: 'bg-red-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div key={index} className={`${stat.bgColor} rounded-xl shadow p-6 transition-transform hover:scale-105`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                            <p className={`text-3xl font-bold ${stat.textColor}`}>
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                        <div className={`p-3 rounded-full ${stat.color} text-white`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DeliveryStatsCard;