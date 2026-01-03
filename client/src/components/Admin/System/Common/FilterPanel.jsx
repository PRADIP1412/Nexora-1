import React, { useState, useEffect } from 'react';
import { FiFilter, FiCalendar, FiSearch, FiX } from 'react-icons/fi';

const FilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  loading = false,
  className = ''
}) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleInputChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilterChange?.(localFilters);
    onApplyFilters?.(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {};
    Object.keys(localFilters).forEach(key => {
      resetFilters[key] = '';
    });
    setLocalFilters(resetFilters);
    onFilterChange?.(resetFilters);
    onResetFilters?.();
  };

  const filterTypes = [
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search...',
      icon: <FiSearch />
    },
    {
      id: 'date_from',
      label: 'From Date',
      type: 'date',
      placeholder: 'Start date',
      icon: <FiCalendar />
    },
    {
      id: 'date_to',
      label: 'To Date',
      type: 'date',
      placeholder: 'End date',
      icon: <FiCalendar />
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        { value: 'user', label: 'User' },
        { value: 'system', label: 'System' },
        { value: 'admin', label: 'Admin' }
      ]
    }
  ];

  const hasActiveFilters = Object.values(localFilters).some(value => value && value.toString().trim() !== '');

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiFilter className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            disabled={loading || !hasActiveFilters}
            className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filterTypes.map((filter) => (
          <div key={filter.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            
            {filter.type === 'select' ? (
              <select
                value={localFilters[filter.id] || ''}
                onChange={(e) => handleInputChange(filter.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={loading}
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative">
                {filter.icon && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {filter.icon}
                  </div>
                )}
                <input
                  type={filter.type}
                  value={localFilters[filter.id] || ''}
                  onChange={(e) => handleInputChange(filter.id, e.target.value)}
                  placeholder={filter.placeholder}
                  className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    filter.icon ? 'pl-10 pr-3 py-2' : 'px-3 py-2'
                  } ${loading ? 'bg-gray-50' : ''}`}
                  disabled={loading}
                />
                {localFilters[filter.id] && (
                  <button
                    onClick={() => handleInputChange(filter.id, '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              if (!value || value.toString().trim() === '') return null;
              
              const filter = filterTypes.find(f => f.id === key);
              const displayValue = filter?.options?.find(opt => opt.value === value)?.label || value;
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {filter?.label || key}: {displayValue}
                  <button
                    onClick={() => handleInputChange(key, '')}
                    className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                    disabled={loading}
                  >
                    <FiX size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;