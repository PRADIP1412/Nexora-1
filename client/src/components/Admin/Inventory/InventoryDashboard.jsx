// src/components/inventory/InventoryDashboard.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventoryContext } from '../../../context/InventoryContext';
import {
  FaBox, FaBuilding, FaTruck, FaShoppingCart,
  FaExchangeAlt, FaTags, FaArrowUp, FaArrowDown,
  FaPlus
} from 'react-icons/fa';
import InventoryStats from './Common/InventoryStats';
import StockSummary from './Stock/StockSummary';

const InventoryDashboard = () => {
  const {
    stockSummary,
    companies,
    suppliers,
    purchases,
    purchaseReturns,
    batches,
    fetchStockSummary,
    fetchCompanies,
    fetchSuppliers,
    fetchPurchases,
    fetchPurchaseReturns,
    fetchBatches,
    loading
  } = useInventoryContext();

  useEffect(() => {
    fetchStockSummary();
    fetchCompanies();
    fetchSuppliers();
    fetchPurchases();
    fetchPurchaseReturns();
    fetchBatches();
  }, []);

  const stats = [
    {
      title: 'Total Stock Items',
      value: stockSummary.length,
      icon: <FaBox className="text-blue-600" />,
      color: 'bg-blue-50',
      link: '/inventory/stock'
    },
    {
      title: 'Companies',
      value: companies.length,
      icon: <FaBuilding className="text-green-600" />,
      color: 'bg-green-50',
      link: '/inventory/companies'
    },
    {
      title: 'Suppliers',
      value: suppliers.length,
      icon: <FaTruck className="text-purple-600" />,
      color: 'bg-purple-50',
      link: '/inventory/suppliers'
    },
    {
      title: 'Active Purchases',
      value: purchases.filter(p => p.status === 'PENDING').length,
      icon: <FaShoppingCart className="text-yellow-600" />,
      color: 'bg-yellow-50',
      link: '/inventory/purchases'
    },
    {
      title: 'Total Batches',
      value: batches.length,
      icon: <FaTags className="text-red-600" />,
      color: 'bg-red-50',
      link: '/inventory/batches'
    },
    {
      title: 'Pending Returns',
      value: purchaseReturns.filter(r => r.status === 'PENDING').length,
      icon: <FaExchangeAlt className="text-indigo-600" />,
      color: 'bg-indigo-50',
      link: '/inventory/returns'
    },
  ];

  const quickActions = [
    { label: 'New Purchase', icon: <FaPlus />, path: '/inventory/purchases/new', color: 'bg-blue-500' },
    { label: 'Add Supplier', icon: <FaPlus />, path: '/inventory/suppliers/new', color: 'bg-green-500' },
    { label: 'Add Company', icon: <FaPlus />, path: '/inventory/companies/new', color: 'bg-purple-500' },
    { label: 'Stock Adjustment', icon: <FaPlus />, path: '/inventory/stock', color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h1>
          <p className="text-gray-600">Overview of your inventory management</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className={`${action.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.color} p-6 rounded-xl border`}
          >
            <Link to={stat.link} className="block">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-2xl">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
                View details
                <FaArrowUp className="transform rotate-45" size={12} />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Stock Summary Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Stock Overview</h2>
          <Link 
            to="/inventory/stock" 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View All
            <FaArrowUp className="transform rotate-45" />
          </Link>
        </div>
        <StockSummary />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Recent Purchases</h3>
          <div className="space-y-3">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.purchase_id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Invoice: {purchase.invoice_number}</p>
                  <p className="text-sm text-gray-600">${purchase.total_cost}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  purchase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  purchase.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {purchase.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Low Stock Items</h3>
          <div className="space-y-3">
            {stockSummary
              .filter(item => item.current_stock < 10)
              .slice(0, 5)
              .map((item) => (
                <div key={item.variant_id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.variant_name}</p>
                    <p className="text-sm text-gray-600">Current: {item.current_stock}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                    Low Stock
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;