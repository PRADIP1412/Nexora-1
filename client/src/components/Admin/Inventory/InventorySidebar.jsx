// src/components/inventory/InventorySidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBox,
  FaBuilding,
  FaTruck,
  FaShoppingCart,
  FaExchangeAlt,
  FaTags,
  FaCog
} from 'react-icons/fa';

const InventorySidebar = () => {
  const menuItems = [
    { path: '/inventory', label: 'Dashboard', icon: <FaHome /> },
    { path: '/inventory/stock', label: 'Stock', icon: <FaBox />, submenu: [
      { path: '/inventory/stock', label: 'Summary' },
      { path: '/inventory/stock/movements', label: 'Movements' }
    ]},
    { path: '/inventory/companies', label: 'Companies', icon: <FaBuilding /> },
    { path: '/inventory/suppliers', label: 'Suppliers', icon: <FaTruck /> },
    { path: '/inventory/purchases', label: 'Purchases', icon: <FaShoppingCart /> },
    { path: '/inventory/returns', label: 'Returns', icon: <FaExchangeAlt /> },
    { path: '/inventory/batches', label: 'Batches', icon: <FaTags /> },
    { path: '/inventory/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaBox />
          Inventory System
        </h2>
      </div>
      
      <nav className="px-4">
        {menuItems.map((item) => (
          <div key={item.label} className="mb-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default InventorySidebar;