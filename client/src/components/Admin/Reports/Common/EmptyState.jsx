import React from 'react';
import { FaChartBar, FaBoxOpen, FaSearch, FaCog } from 'react-icons/fa';

const EmptyState = ({ 
  type = 'default',
  title = 'No Data Available',
  message = 'There is no data to display at the moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <FaSearch className="text-4xl text-gray-400" />;
      case 'error':
        return <FaCog className="text-4xl text-red-400" />;
      case 'chart':
        return <FaChartBar className="text-4xl text-blue-400" />;
      default:
        return <FaBoxOpen className="text-4xl text-gray-400" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'search':
        return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'chart':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className={`rounded-xl border p-8 text-center ${getColor()} ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-75 mb-6 max-w-md mx-auto">{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;