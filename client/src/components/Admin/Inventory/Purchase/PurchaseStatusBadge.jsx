// src/components/inventory/Purchase/PurchaseStatusBadge.jsx
import React from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaExchangeAlt } from 'react-icons/fa';

const PurchaseStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: {
      icon: <FaClock />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Pending'
    },
    RECEIVED: {
      icon: <FaCheckCircle />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'Received'
    },
    CANCELLED: {
      icon: <FaTimesCircle />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: 'Cancelled'
    },
    RETURNED: {
      icon: <FaExchangeAlt />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: 'Returned'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default PurchaseStatusBadge;