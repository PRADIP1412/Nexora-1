import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const MetricDisplay = ({
  title,
  value,
  previousValue,
  unit = '',
  icon,
  color = 'blue',
  size = 'md',
  format = 'number',
  showTrend = true,
  className = ''
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        border: 'border-green-100'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-100'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-100'
      },
      yellow: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-100'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        border: 'border-orange-100'
      },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-100'
      }
    };
    return colors[color] || colors.blue;
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';
    
    if (format === 'percent') {
      return `${Math.round(val)}%`;
    }
    if (format === 'currency') {
      return `$${val.toLocaleString()}`;
    }
    if (format === 'time') {
      return `${val}s`;
    }
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return String(val);
  };

  const calculateTrend = () => {
    if (previousValue === undefined || previousValue === null || previousValue === 0) return null;
    if (value === null || value === undefined) return null;
    
    const change = ((value - previousValue) / previousValue) * 100;
    return Math.round(change);
  };

  const trend = calculateTrend();
  const colorClasses = getColorClasses(color);
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const valueClass = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  }[size];

  return (
    <div className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} ${sizeClasses[size]} ${className} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
          {icon || <div className={`w-6 h-6 rounded ${colorClasses.text}`}></div>}
        </div>
        
        {showTrend && trend !== null && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? <FiTrendingUp /> : trend < 0 ? <FiTrendingDown /> : <FiMinus />}
            <span className="ml-1 font-medium">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>

      <div>
        <div className={`${valueClass} font-bold ${colorClasses.text} mb-1`}>
          {formatValue(value)} {unit}
        </div>
        <div className="text-sm text-gray-600">
          {title}
        </div>
      </div>

      {previousValue !== undefined && previousValue !== null && (
        <div className="mt-4 text-xs text-gray-500">
          Previous: {formatValue(previousValue)} {unit}
        </div>
      )}
    </div>
  );
};

export default MetricDisplay;