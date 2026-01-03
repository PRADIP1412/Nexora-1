import React from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiXCircle, 
  FiClock,
  FiActivity,
  FiAlertTriangle
} from 'react-icons/fi';

const StatusBadge = ({ 
  status, 
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}) => {
  const config = {
    healthy: {
      color: 'bg-green-100 text-green-800',
      icon: <FiCheckCircle />,
      label: 'Healthy'
    },
    active: {
      color: 'bg-green-100 text-green-800',
      icon: <FiCheckCircle />,
      label: 'Active'
    },
    success: {
      color: 'bg-green-100 text-green-800',
      icon: <FiCheckCircle />,
      label: 'Success'
    },
    warning: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: <FiAlertTriangle />,
      label: 'Warning'
    },
    degraded: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: <FiAlertTriangle />,
      label: 'Degraded'
    },
    pending: {
      color: 'bg-blue-100 text-blue-800',
      icon: <FiClock />,
      label: 'Pending'
    },
    inactive: {
      color: 'bg-gray-100 text-gray-800',
      icon: <FiClock />,
      label: 'Inactive'
    },
    error: {
      color: 'bg-red-100 text-red-800',
      icon: <FiXCircle />,
      label: 'Error'
    },
    critical: {
      color: 'bg-red-100 text-red-800',
      icon: <FiAlertCircle />,
      label: 'Critical'
    },
    unhealthy: {
      color: 'bg-red-100 text-red-800',
      icon: <FiAlertCircle />,
      label: 'Unhealthy'
    },
    processing: {
      color: 'bg-blue-100 text-blue-800',
      icon: <FiActivity />,
      label: 'Processing'
    },
    default: {
      color: 'bg-gray-100 text-gray-800',
      icon: <FiActivity />,
      label: 'Unknown'
    }
  };

  const statusKey = status?.toLowerCase() || 'default';
  const statusConfig = config[statusKey] || config.default;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${statusConfig.color} ${className}`}>
      {showIcon && <span className="mr-1">{statusConfig.icon}</span>}
      {showText && statusConfig.label}
    </span>
  );
};

export default StatusBadge;