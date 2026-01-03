import React, { useState } from 'react';
import { FaFilter, FaCalendarAlt, FaTimes, FaChevronDown } from 'react-icons/fa';

const FilterPanel = ({
  filters = [],
  onFilterChange,
  onApply,
  onReset,
  loading = false,
  showDateRange = true,
  initialDateRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  },
  className = ''
}) => {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [filterValues, setFilterValues] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    const newValues = { ...filterValues, [key]: value };
    setFilterValues(newValues);
    if (onFilterChange) {
      onFilterChange(newValues);
    }
  };

  const handleDateChange = (type, date) => {
    const newRange = { ...dateRange, [type]: date };
    setDateRange(newRange);
    if (onFilterChange) {
      onFilterChange({ ...filterValues, dateRange: newRange });
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply({ ...filterValues, dateRange });
    }
  };

  const handleReset = () => {
    setFilterValues({});
    setDateRange(initialDateRange);
    if (onReset) {
      onReset();
    }
  };

  const quickDateRanges = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Month', custom: true },
    { label: 'Last Month', custom: true },
  ];

  const applyQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({ startDate: start, endDate: end });
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div 
        className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        <FaChevronDown className={`text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
      </div>
      
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Date Range */}
          {showDateRange && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaCalendarAlt className="mr-2" />
                Date Range
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formatDate(dateRange.startDate)}
                    onChange={(e) => handleDateChange('startDate', new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formatDate(dateRange.endDate)}
                    onChange={(e) => handleDateChange('endDate', new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Quick Date Range Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickDateRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => range.days !== undefined && applyQuickRange(range.days)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    disabled={loading || range.custom}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Additional Filters */}
          {filters.map((filter, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              {filter.type === 'select' ? (
                <select
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">All</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : filter.type === 'number' ? (
                <input
                  type="number"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  value={filterValues[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              )}
            </div>
          ))}
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FaTimes className="inline mr-2" />
              Reset
            </button>
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;