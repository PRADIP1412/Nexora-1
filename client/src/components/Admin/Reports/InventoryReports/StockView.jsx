import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportTable from '../Common/ReportTable';
import ReportChart from '../Common/ReportChart';
import { FaBox, FaArrowUp, FaArrowDown, FaExchangeAlt, FaFilter } from 'react-icons/fa';

const StockView = ({ dateRange }) => {
  const {
    inventoryReports,
    loading,
    getInventoryStatus,
    getStockMovementReport
  } = useReportsContext();

  const [viewMode, setViewMode] = useState('status');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');

  useEffect(() => {
    loadStockData();
  }, [dateRange]);

  const loadStockData = async () => {
    await getInventoryStatus();
    await getStockMovementReport(dateRange.startDate, dateRange.endDate);
  };

  const stockColumns = [
    { field: 'product_name', header: 'Product', width: '25%' },
    { field: 'sku', header: 'SKU' },
    { field: 'category', header: 'Category' },
    { field: 'current_stock', header: 'Current', render: (value, row) => (
      <div className="flex items-center">
        <span className={`font-bold ${
          value === 0 ? 'text-red-600' :
          value < 10 ? 'text-red-600' :
          value < 25 ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {value.toLocaleString()}
        </span>
        <div className="ml-3 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              value === 0 ? 'bg-red-500' :
              value < 10 ? 'bg-red-500' :
              value < 25 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min((value / (row.ideal_stock || 100)) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    )},
    { field: 'ideal_stock', header: 'Ideal' },
    { field: 'unit_price', header: 'Unit Price', render: (value) => `$${value}` },
    { field: 'total_value', header: 'Stock Value', render: (value, row) => (
      <span className="font-bold text-blue-600">
        ${(row.current_stock * row.unit_price).toLocaleString()}
      </span>
    )}
  ];

  const movementColumns = [
    { field: 'date', header: 'Date' },
    { field: 'product_name', header: 'Product' },
    { field: 'type', header: 'Type', render: (value) => (
      <span className={`flex items-center ${
        value === 'sale' ? 'text-red-600' : 'text-green-600'
      }`}>
        {value === 'sale' ? <FaArrowDown className="mr-1" /> : <FaArrowUp className="mr-1" />}
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    )},
    { field: 'quantity', header: 'Quantity', render: (value, row) => (
      <span className={row.type === 'sale' ? 'text-red-600' : 'text-green-600'}>
        {row.type === 'sale' ? '-' : '+'}{value.toLocaleString()}
      </span>
    )},
    { field: 'unit_price', header: 'Unit Price', render: (value) => `$${value}` },
    { field: 'total_value', header: 'Total', render: (value) => (
      <span className="font-medium">${value.toLocaleString()}</span>
    )},
    { field: 'source_destination', header: 'Source/Destination' }
  ];

  // Calculate stock metrics
  const calculateMetrics = () => {
    const statusData = inventoryReports.status || [];
    const movementData = inventoryReports.stockMovement || [];
    
    const totalValue = statusData.reduce((sum, item) => sum + (item.current_stock * item.unit_price || 0), 0);
    const totalItems = statusData.length;
    
    const criticalItems = statusData.filter(item => item.current_stock === 0).length;
    const lowStockItems = statusData.filter(item => item.current_stock > 0 && item.current_stock < 10).length;
    const warningItems = statusData.filter(item => item.current_stock >= 10 && item.current_stock < 25).length;
    const healthyItems = statusData.filter(item => item.current_stock >= 25).length;
    
    const recentMovements = movementData.slice(-10);
    const totalIn = recentMovements.filter(m => m.type === 'purchase').reduce((sum, m) => sum + m.quantity, 0);
    const totalOut = recentMovements.filter(m => m.type === 'sale').reduce((sum, m) => sum + m.quantity, 0);
    
    return {
      totalValue,
      totalItems,
      criticalItems,
      lowStockItems,
      warningItems,
      healthyItems,
      totalIn,
      totalOut,
      netChange: totalIn - totalOut
    };
  };

  const metrics = calculateMetrics();

  // Filter stock data
  const filteredStock = (inventoryReports.status || []).filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    
    if (stockLevelFilter === 'critical' && item.current_stock !== 0) return false;
    if (stockLevelFilter === 'low' && (item.current_stock === 0 || item.current_stock >= 10)) return false;
    if (stockLevelFilter === 'warning' && (item.current_stock < 10 || item.current_stock >= 25)) return false;
    if (stockLevelFilter === 'healthy' && item.current_stock < 25) return false;
    
    return true;
  });

  // Get unique categories
  const categories = ['all', ...new Set((inventoryReports.status || []).map(item => item.category).filter(Boolean))];

  const stockLevels = [
    { id: 'all', label: 'All Levels' },
    { id: 'critical', label: 'Out of Stock', color: 'text-red-600' },
    { id: 'low', label: 'Low Stock (<10)', color: 'text-red-600' },
    { id: 'warning', label: 'Warning (10-24)', color: 'text-yellow-600' },
    { id: 'healthy', label: 'Healthy (25+)', color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
          <p className="text-gray-600">Monitor and analyze stock levels and movements</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('status')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'status' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaBox className="inline mr-2" />
            Stock Status
          </button>
          <button
            onClick={() => setViewMode('movement')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'movement' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaExchangeAlt className="inline mr-2" />
            Stock Movement
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-600">Total Value</p>
          <p className="text-xl font-bold text-blue-800">
            ${metrics.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm font-medium text-red-600">Critical Items</p>
          <p className="text-xl font-bold text-red-800">{metrics.criticalItems}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-sm font-medium text-yellow-600">Low Stock</p>
          <p className="text-xl font-bold text-yellow-800">{metrics.lowStockItems}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-medium text-green-600">Net Change</p>
          <p className={`text-xl font-bold ${metrics.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.netChange >= 0 ? '+' : ''}{metrics.netChange}
          </p>
        </div>
      </div>

      {/* Stock Distribution Chart */}
      <ReportChart
        title="Stock Level Distribution"
        data={[
          { label: 'Out of Stock', value: metrics.criticalItems },
          { label: 'Low Stock', value: metrics.lowStockItems },
          { label: 'Warning', value: metrics.warningItems },
          { label: 'Healthy', value: metrics.healthyItems }
        ]}
        type="doughnut"
        height={250}
        loading={loading}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFilter className="inline mr-2" />
              Stock Level
            </label>
            <select
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {stockLevels.map(level => (
                <option key={level.id} value={level.id} className={level.color}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'status' ? (
        <ReportTable
          title="Stock Status"
          data={filteredStock}
          columns={stockColumns}
          loading={loading}
          emptyMessage="No stock data available"
        />
      ) : (
        <ReportTable
          title="Recent Stock Movement"
          data={inventoryReports.stockMovement?.slice(-50) || []}
          columns={movementColumns}
          loading={loading}
          emptyMessage="No stock movement data available"
        />
      )}
    </div>
  );
};

export default StockView;