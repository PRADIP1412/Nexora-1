import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaTimes, FaCalendar, FaUser } from 'react-icons/fa';

const DeliveryFilters = ({ onFilter, onSearch, loading = false, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        order_id: initialFilters.order_id || '',
        delivery_person_id: initialFilters.delivery_person_id || '',
        status: initialFilters.status || '',
        date_from: initialFilters.date_from || '',
        date_to: initialFilters.date_to || ''
    });
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'ASSIGNED', label: 'Assigned' },
        { value: 'PICKED', label: 'Picked Up' },
        { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
        { value: 'DELIVERED', label: 'Delivered' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ];

    // Reset filters when component mounts with initialFilters
    useEffect(() => {
        if (Object.keys(initialFilters).length > 0) {
            setFilters({
                order_id: initialFilters.order_id || '',
                delivery_person_id: initialFilters.delivery_person_id || '',
                status: initialFilters.status || '',
                date_from: initialFilters.date_from || '',
                date_to: initialFilters.date_to || ''
            });
            setSearchTerm(initialFilters.search || '');
        }
    }, [initialFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        // Create a clean filters object without empty values
        const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '')
        );
        
        // Include search term if present
        if (searchTerm.trim()) {
            activeFilters.search = searchTerm.trim();
        }
        
        onFilter(activeFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            order_id: '',
            delivery_person_id: '',
            status: '',
            date_from: '',
            date_to: ''
        });
        setSearchTerm('');
        onFilter({});
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            onSearch(searchTerm.trim());
        } else {
            // If search is cleared, apply all other filters
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '')
            );
            onFilter(activeFilters);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleQuickFilter = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setTimeout(() => {
            const activeFilters = { [filterType]: value };
            if (searchTerm.trim()) {
                activeFilters.search = searchTerm.trim();
            }
            onFilter(activeFilters);
        }, 100);
    };

    // Check if any filter is active
    const hasActiveFilters = Object.values(filters).some(value => value !== '') || searchTerm.trim() !== '';

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by order ID, customer name, delivery ID..."
                            className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    onSearch('');
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={loading}
                                title="Clear search"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter and Advanced Toggle Buttons */}
                <div className="flex items-center gap-2">
                    {/* Quick Status Filters */}
                    <div className="hidden md:flex items-center gap-2">
                        {['ASSIGNED', 'DELIVERED', 'CANCELLED'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleQuickFilter('status', status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                    filters.status === status
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                disabled={loading}
                                title={`Filter by ${status}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                            showFilters || hasActiveFilters
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={loading}
                    >
                        <FaFilter />
                        <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                        {hasActiveFilters && !showFilters && (
                            <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>

                    {/* Advanced Toggle Button */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                            showAdvanced
                                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={loading}
                    >
                        <FaCalendar />
                        <span>Date</span>
                    </button>
                </div>
            </div>

            {/* Advanced Date Filters */}
            {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaCalendar className="w-4 h-4" />
                        Date Range Filter
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                name="date_from"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={filters.date_from}
                                onChange={handleFilterChange}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                name="date_to"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={filters.date_to}
                                onChange={handleFilterChange}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Filters Panel */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Deliveries</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Order ID Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <FaSearch className="w-3 h-3" />
                                Order ID
                            </label>
                            <input
                                type="number"
                                name="order_id"
                                placeholder="e.g., 1001"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={filters.order_id}
                                onChange={handleFilterChange}
                                disabled={loading}
                                min="1"
                            />
                        </div>

                        {/* Delivery Person ID Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <FaUser className="w-3 h-3" />
                                Delivery Person ID
                            </label>
                            <input
                                type="number"
                                name="delivery_person_id"
                                placeholder="e.g., 201"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={filters.delivery_person_id}
                                onChange={handleFilterChange}
                                disabled={loading}
                                min="1"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={filters.status}
                                onChange={handleFilterChange}
                                disabled={loading}
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-blue-700">Active Filters:</span>
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value) return null;
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {key.replace('_', ' ')}: {value}
                                            <button
                                                onClick={() => {
                                                    setFilters(prev => ({ ...prev, [key]: '' }));
                                                    const newFilters = { ...filters, [key]: '' };
                                                    const activeFilters = Object.fromEntries(
                                                        Object.entries(newFilters).filter(([_, v]) => v !== '')
                                                    );
                                                    if (searchTerm.trim()) {
                                                        activeFilters.search = searchTerm.trim();
                                                    }
                                                    onFilter(activeFilters);
                                                }}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <FaTimes className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })}
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Search: {searchTerm}
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                onSearch('');
                                            }}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            <FaTimes className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Filter Actions */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div>
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <FaTimes />
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleApplyFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Applying...
                                    </>
                                ) : (
                                    'Apply Filters'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryFilters;