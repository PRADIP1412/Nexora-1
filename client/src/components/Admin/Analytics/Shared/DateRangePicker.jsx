import React, { useState } from 'react';

const DateRangePicker = ({ onDateChange }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleApply = () => {
        if (startDate && endDate) {
            onDateChange({ startDate, endDate });
        }
    };

    const handleQuickSelect = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
        onDateChange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
    };

    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Select Date Range</h4>
            
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => handleQuickSelect(7)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                    Last 7 days
                </button>
                <button
                    onClick={() => handleQuickSelect(30)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                    Last 30 days
                </button>
                <button
                    onClick={() => handleQuickSelect(90)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                    Last 90 days
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
            </div>

            <button
                onClick={handleApply}
                disabled={!startDate || !endDate}
                className={`w-full py-2 rounded-lg font-medium ${
                    !startDate || !endDate
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
                Apply Date Range
            </button>
        </div>
    );
};

export default DateRangePicker;