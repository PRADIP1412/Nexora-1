import React, { useState } from 'react';
import { FaSearch, FaFilter, FaCalendar, FaUser, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

const NotificationFilters = ({ onFilter, loading }) => {
    const [filters, setFilters] = useState({
        keyword: '',
        user_id: '',
        type: '',
        is_read: '',
        start_date: '',
        end_date: ''
    });

    const notificationTypes = [
        { value: 'ORDER', label: 'Order' },
        { value: 'PAYMENT', label: 'Payment' },
        { value: 'DELIVERY', label: 'Delivery' },
        { value: 'OFFER', label: 'Offer' },
        { value: 'FEEDBACK', label: 'Feedback' },
        { value: 'SYSTEM', label: 'System' }
    ];

    const readStatusOptions = [
        { value: 'true', label: 'Read', icon: FaEye },
        { value: 'false', label: 'Unread', icon: FaEyeSlash }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleClear = () => {
        const clearedFilters = {
            keyword: '',
            user_id: '',
            type: '',
            is_read: '',
            start_date: '',
            end_date: ''
        };
        setFilters(clearedFilters);
        onFilter(clearedFilters);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6 border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaFilter /> Filter Notifications
                </h3>
                <button
                    onClick={handleClear}
                    disabled={loading}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                    <FaTimes /> Clear
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Search and User ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <FaSearch /> Search
                        </label>
                        <input
                            type="text"
                            name="keyword"
                            value={filters.keyword}
                            onChange={handleChange}
                            placeholder="Search in title/message..."
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <FaUser /> User ID
                        </label>
                        <input
                            type="number"
                            name="user_id"
                            value={filters.user_id}
                            onChange={handleChange}
                            placeholder="Filter by user ID..."
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Type and Read Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Notification Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        >
                            <option value="">All Types</option>
                            {notificationTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Read Status</label>
                        <select
                            name="is_read"
                            value={filters.is_read}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        >
                            <option value="">All Status</option>
                            {readStatusOptions.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <FaCalendar /> Start Date
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <FaCalendar /> End Date
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <FaSearch />
                        {loading ? 'Applying Filters...' : 'Apply Filters'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationFilters;