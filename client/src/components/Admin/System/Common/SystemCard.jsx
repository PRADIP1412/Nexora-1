import React from 'react';
import { FiAlertCircle, FiInfo } from 'react-icons/fi';

const SystemCard = ({ 
  title, 
  children, 
  icon, 
  status, 
  loading = false,
  error = null,
  className = '',
  onRefresh,
  actions
}) => {
  const getStatusColor = (status) => {
    if (!status) return 'border-gray-200 bg-white';
    
    switch(status.toLowerCase()) {
      case 'success':
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'warning':
      case 'degraded':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
      case 'critical':
      case 'unhealthy':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'success':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'critical':
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`rounded-xl border ${getStatusColor(status)} ${className} shadow-sm`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 text-gray-600">
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {status && (
            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
              title="Refresh"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              ) : (
                '↻'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : children ? (
          children
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiInfo className="mx-auto text-2xl mb-2" />
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemCard;