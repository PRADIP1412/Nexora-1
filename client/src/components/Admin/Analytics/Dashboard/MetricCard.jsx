import React from 'react';

const MetricCard = ({ title, value, description, trend, icon, color }) => {
    const colorClasses = {
        green: 'bg-green-50 text-green-700',
        blue: 'bg-blue-50 text-blue-700',
        purple: 'bg-purple-50 text-purple-700',
        red: 'bg-red-50 text-red-700',
        yellow: 'bg-yellow-50 text-yellow-700'
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {description && (
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                </div>
                <div className={`${colorClasses[color]} p-3 rounded-lg`}>
                    <span className="text-xl">{icon}</span>
                </div>
            </div>
            
            {trend !== undefined && (
                <div className="flex items-center mt-4">
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                    </span>
                    <span className="text-gray-500 text-sm ml-2">from previous period</span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;