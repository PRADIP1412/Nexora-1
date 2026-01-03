import React from 'react';
import './DateRangeFilter.css';
const DateRangeFilter = ({ dateRange, onDateRangeChange, onApply }) => {
    const handleStartDateChange = (e) => {
        onDateRangeChange({
            ...dateRange,
            startDate: e.target.value
        });
    };

    const handleEndDateChange = (e) => {
        onDateRangeChange({
            ...dateRange,
            endDate: e.target.value
        });
    };

    const handleQuickSelect = (days) => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        onDateRangeChange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Filter by Date Range</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={dateRange.startDate}
                        onChange={handleStartDateChange}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={dateRange.endDate}
                        onChange={handleEndDateChange}
                    />
                </div>
                
                <div className="flex items-end">
                    <button
                        onClick={onApply}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>
            
            <div className="flex space-x-2">
                <button
                    onClick={() => handleQuickSelect(7)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                    Last 7 Days
                </button>
                <button
                    onClick={() => handleQuickSelect(30)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                    Last 30 Days
                </button>
                <button
                    onClick={() => handleQuickSelect(90)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                    Last 90 Days
                </button>
                <button
                    onClick={() => {
                        const today = new Date();
                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                        onDateRangeChange({
                            startDate: firstDay.toISOString().split('T')[0],
                            endDate: today.toISOString().split('T')[0]
                        });
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                    This Month
                </button>
            </div>
        </div>
    );
};

export default DateRangeFilter;