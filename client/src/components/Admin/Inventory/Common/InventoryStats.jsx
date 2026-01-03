// src/components/inventory/Common/InventoryStats.jsx
import React from 'react';
import { FaBox, FaBuilding, FaTruck, FaShoppingCart, FaExchangeAlt, FaTags } from 'react-icons/fa';

const InventoryStats = ({ stats }) => {
  const iconMap = {
    stock: <FaBox />,
    companies: <FaBuilding />,
    suppliers: <FaTruck />,
    purchases: <FaShoppingCart />,
    returns: <FaExchangeAlt />,
    batches: <FaTags />
  };

  const colorMap = {
    stock: 'bg-blue-500',
    companies: 'bg-green-500',
    suppliers: 'bg-purple-500',
    purchases: 'bg-yellow-500',
    returns: 'bg-indigo-500',
    batches: 'bg-red-500'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              {stat.change && (
                <p className={`text-xs mt-1 ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </p>
              )}
            </div>
            <div className={`${colorMap[stat.type] || 'bg-gray-500'} p-3 rounded-full text-white`}>
              {iconMap[stat.type] || <FaBox />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStats;