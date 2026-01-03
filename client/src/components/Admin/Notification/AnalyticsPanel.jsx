import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartPie, FaChartLine, FaFilter, FaCalendar } from 'react-icons/fa';
import StatsCards from './StatsCards';

const AnalyticsPanel = ({ 
    stats, 
    typeStats, 
    loading, 
    onRefresh,
    onDateRangeChange 
}) => {
    const [dateRange, setDateRange] = useState('7days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const dateRanges = [
        { value: 'today', label: 'Today' },
        { value: '7days', label: 'Last 7 Days' },
        { value: '30days', label: 'Last 30 Days' },
        { value: '90days', label: 'Last 90 Days' },
        { value: 'custom', label: 'Custom Range' }
    ];

    useEffect(() => {
        if (dateRange !== 'custom' && onDateRangeChange) {
            onDateRangeChange(dateRange);
        }
    }, [dateRange]);

    const handleCustomDateSubmit = () => {
        if (customStartDate && customEndDate && onDateRangeChange) {
            onDateRangeChange('custom', customStartDate, customEndDate);
        }
    };

    if (loading && !stats) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="bg-white rounded-lg shadow p-4 border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FaChartBar /> Notification Analytics
                        </h2>
                        <p className="text-gray-600 mt-1">Monitor notification trends and user engagement</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Date Range Selector */}
                        <div className="flex items-center gap-2">
                            <FaCalendar className="text-gray-500" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                {dateRanges.map(range => (
                                    <option key={range.value} value={range.value}>
                                        {range.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <FaFilter />
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Custom Date Range Inputs */}
                {dateRange === 'custom' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleCustomDateSubmit}
                                    disabled={!customStartDate || !customEndDate}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} typeStats={typeStats} />

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Trends */}
                <div className="bg-white rounded-lg shadow p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaChartLine /> Activity Trends
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Notifications per User</span>
                                <span className="text-sm font-medium">{stats?.average_notifications_per_user?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min((stats?.average_notifications_per_user || 0) * 10, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-600">Read Rate</span>
                                <span className="text-sm font-medium">
                                    {stats?.total_notifications ? 
                                        `${(((stats.total_notifications - (stats.total_unread || 0)) / stats.total_notifications) * 100).toFixed(1)}%` : 
                                        '0%'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ 
                                        width: `${stats?.total_notifications ? 
                                            (((stats.total_notifications - (stats.total_unread || 0)) / stats.total_notifications) * 100) : 
                                            0}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Type Distribution */}
                <div className="bg-white rounded-lg shadow p-6 border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaChartPie /> Type Distribution
                    </h3>
                    {typeStats?.stats && typeStats.stats.length > 0 ? (
                        <div className="space-y-3">
                            {typeStats.stats.map((typeStat, index) => (
                                <div key={index}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm capitalize">{typeStat.type.toLowerCase()}</span>
                                        <span className="text-sm font-medium">{typeStat.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full" 
                                            style={{ 
                                                width: `${typeStat.percentage}%`,
                                                backgroundColor: getColorForType(typeStat.type)
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No type distribution data available</p>
                    )}
                </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-lg shadow p-6 border">
                <h3 className="text-lg font-semibold mb-4">Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded border border-blue-100">
                        <div className="text-sm font-medium text-blue-800 mb-1">Most Active Users</div>
                        <div className="text-2xl font-bold text-blue-700">
                            {stats?.total_users_with_notifications || 0}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">Users have received notifications</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded border border-green-100">
                        <div className="text-sm font-medium text-green-800 mb-1">Engagement Rate</div>
                        <div className="text-2xl font-bold text-green-700">
                            {stats?.total_notifications && stats.total_unread ? 
                                `${(100 - ((stats.total_unread / stats.total_notifications) * 100)).toFixed(1)}%` : 
                                '0%'}
                        </div>
                        <div className="text-xs text-green-600 mt-1">Notifications have been read</div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded border border-purple-100">
                        <div className="text-sm font-medium text-purple-800 mb-1">Daily Average</div>
                        <div className="text-2xl font-bold text-purple-700">
                            {stats?.total_notifications ? (stats.total_notifications / 30).toFixed(1) : '0.0'}
                        </div>
                        <div className="text-xs text-purple-600 mt-1">Notifications per day (30-day avg)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function for type colors
const getColorForType = (type) => {
    const colors = {
        ORDER: '#3b82f6',
        PAYMENT: '#10b981',
        DELIVERY: '#8b5cf6',
        OFFER: '#f59e0b',
        FEEDBACK: '#ec4899',
        SYSTEM: '#6b7280'
    };
    return colors[type] || '#6b7280';
};

export default AnalyticsPanel;