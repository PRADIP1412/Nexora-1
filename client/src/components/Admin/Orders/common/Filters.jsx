import React, { useState } from 'react';
import './Filters.css';
const Filters = ({ filters, onFilterChange, onSearch, onClearSearch }) => {
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'PLACED', label: 'Placed' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'SHIPPED', label: 'Shipped' },
        { value: 'DELIVERED', label: 'Delivered' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'RETURNED', label: 'Returned' },
        { value: 'REFUNDED', label: 'Refunded' }
    ];

    const [localSearch, setLocalSearch] = useState(filters.search);

    const handleSearchChange = (e) => {
        setLocalSearch(e.target.value);
    };

    const handleStatusChange = (e) => {
        onFilterChange({
            ...filters,
            status: e.target.value
        });
    };

    const handleStartDateChange = (e) => {
        onFilterChange({
            ...filters,
            startDate: e.target.value
        });
    };

    const handleEndDateChange = (e) => {
        onFilterChange({
            ...filters,
            endDate: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilterChange({
            ...filters,
            search: localSearch
        });
        if (onSearch) {
            onSearch();
        }
    };

    const handleClear = () => {
        setLocalSearch('');
        if (onClearSearch) {
            onClearSearch();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Order
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by order ID, customer ID..."
                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={localSearch}
                                onChange={handleSearchChange}
                                onKeyPress={handleKeyPress}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                            {localSearch && (
                                <button
                                    type="button"
                                    onClick={() => setLocalSearch('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Search by order ID (e.g., "7") or customer ID
                        </p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.status}
                            onChange={handleStatusChange}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.startDate}
                            onChange={handleStartDateChange}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.endDate}
                            onChange={handleEndDateChange}
                        />
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div>
                        {(filters.search || filters.status || filters.startDate || filters.endDate) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 flex items-center"
                            >
                                <span className="mr-2">✕</span>
                                Clear All Filters
                            </button>
                        )}
                    </div>
                    
                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                        >
                            <span className="mr-2">🔍</span>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Filters;