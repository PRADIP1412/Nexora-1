import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DateRangeSelector = ({
  startDate,
  endDate,
  onChange,
  presets = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);


  // ✅ UPDATED: Format date for input (YYYY-MM-DD)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ UPDATED: Parse date from input
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? new Date() : date;
  };
  
  const handleDateChange = (type, value) => {
    const date = parseDate(value);
    if (type === 'start') {
      setLocalStart(date);
      if (date > localEnd) {
        const newEnd = new Date(date);
        newEnd.setDate(date.getDate() + 1);
        setLocalEnd(newEnd);
      }
    } else {
      setLocalEnd(date);
      if (date < localStart) {
        const newStart = new Date(date);
        newStart.setDate(date.getDate() - 1);
        setLocalStart(newStart);
      }
    }
  };

  const handleApply = () => {
    if (onChange) {
      onChange(localStart, localEnd);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    setIsOpen(false);
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setLocalStart(start);
    setLocalEnd(end);
    if (onChange) {
      onChange(start, end);
    }
    setIsOpen(false);
  };

  const applyMonthPreset = (offset = 0) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
    setLocalStart(start);
    setLocalEnd(end);
    if (onChange) {
      onChange(start, end);
    }
    setIsOpen(false);
  };

  const quickPresets = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const monthPresets = [
    { label: 'This Month', offset: 0 },
    { label: 'Last Month', offset: -1 },
    { label: 'Last 3 Months', offset: -3 },
  ];

  const formatDisplay = () => {
    const format = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
      });
    };
    
    const startStr = format(startDate);
    const endStr = format(endDate);
    
    if (startStr === endStr) {
      return startStr;
    }
    
    return `${startStr} - ${endStr}`;
  };

  const navigatePeriod = (direction) => {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    
    if (direction === 'prev') {
      newStart.setDate(startDate.getDate() - daysDiff);
      newEnd.setDate(endDate.getDate() - daysDiff);
    } else {
      newStart.setDate(startDate.getDate() + daysDiff);
      newEnd.setDate(endDate.getDate() + daysDiff);
    }
    
    if (onChange) {
      onChange(newStart, newEnd);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigatePeriod('prev')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          title="Previous period"
        >
          <FaChevronLeft />
        </button>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
        >
          <FaCalendarAlt className="mr-2" />
          <span className="font-medium">{formatDisplay()}</span>
        </button>
        
        <button
          onClick={() => navigatePeriod('next')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          title="Next period"
        >
          <FaChevronRight />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={handleCancel}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Date Range</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formatDate(localStart)}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formatDate(localEnd)}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {presets && (
                  <>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Presets</h4>
                      <div className="flex flex-wrap gap-2">
                        {quickPresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => applyPreset(preset.days)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Month Presets</h4>
                      <div className="flex flex-wrap gap-2">
                        {monthPresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => applyMonthPreset(preset.offset)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangeSelector;