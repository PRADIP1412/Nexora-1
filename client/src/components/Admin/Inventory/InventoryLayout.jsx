// src/components/inventory/InventoryLayout.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  FaBox, FaBuilding, FaTruck, FaShoppingCart, 
  FaExchangeAlt, FaTags, FaChartBar, FaHome,
  FaPlus, FaList, FaArrowLeft
} from 'react-icons/fa';
import InventoryHeader from './InventoryHeader';
import InventorySidebar from './InventorySidebar';

const InventoryLayout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/inventory', label: 'Dashboard', icon: <FaHome /> },
    { path: '/inventory/stock', label: 'Stock', icon: <FaBox /> },
    { path: '/inventory/companies', label: 'Companies', icon: <FaBuilding /> },
    { path: '/inventory/suppliers', label: 'Suppliers', icon: <FaTruck /> },
    { path: '/inventory/purchases', label: 'Purchases', icon: <FaShoppingCart /> },
    { path: '/inventory/returns', label: 'Returns', icon: <FaExchangeAlt /> },
    { path: '/inventory/batches', label: 'Batches', icon: <FaTags /> },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            Inventory
          </h1>
        </div>
        
        <nav className="p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <InventoryHeader />
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;