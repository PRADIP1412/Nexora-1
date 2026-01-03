import React from 'react';

const UserActivity = ({ behavior }) => {
    const { active_sessions, device_breakdown } = behavior;

    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">User Activity</h4>
            
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Active Sessions (30min)</span>
                    <span className="text-xl font-bold text-green-600">{active_sessions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(active_sessions * 10, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Device Breakdown</h5>
                <div className="space-y-3">
                    {Object.entries(device_breakdown).map(([device, percentage]) => (
                        <div key={device} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-700">{device}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserActivity;