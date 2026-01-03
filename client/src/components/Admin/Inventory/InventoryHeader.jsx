// src/components/inventory/InventoryHeader.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaBox, FaSearch, FaBell, FaUser } from 'react-icons/fa';

const InventoryHeader = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/stock')) return 'Stock Management';
    if (path.includes('/companies')) return 'Companies';
    if (path.includes('/suppliers')) return 'Suppliers';
    if (path.includes('/purchases')) return 'Purchases';
    if (path.includes('/returns')) return 'Purchase Returns';
    if (path.includes('/batches')) return 'Product Batches';
    return 'Inventory Dashboard';
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBox className="text-blue-600" />
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your inventory efficiently
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="relative p-2 text-gray-600 hover:text-gray-800">
            <FaBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600" />
            </div>
            <span className="text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InventoryHeader;