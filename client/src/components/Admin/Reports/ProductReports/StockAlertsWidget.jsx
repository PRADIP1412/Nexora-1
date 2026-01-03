import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportTable from '../Common/ReportTable';
import { FaExclamationTriangle, FaBox, FaBell, FaSync } from 'react-icons/fa';

const StockAlertsWidget = ({ threshold = 10, autoRefresh = false }) => {
  const {
    productReports,
    loading,
    getLowStockAlerts,
    clearError
  } = useReportsContext();

  const [currentThreshold, setCurrentThreshold] = useState(threshold);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStockAlerts();
  }, [currentThreshold]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadStockAlerts();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, currentThreshold]);

  const loadStockAlerts = async () => {
    setRefreshing(true);
    try {
      await getLowStockAlerts(currentThreshold);
    } catch (error) {
      console.error('Stock alerts load error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    clearError();
    loadStockAlerts();
  };

  const handleThresholdChange = (newThreshold) => {
    setCurrentThreshold(newThreshold);
  };

  const stockAlerts = productReports.lowStockAlerts || [];

  const thresholdOptions = [5, 10, 15, 20, 25, 50];

  const columns = [
    { 
      field: 'product_name', 
      header: 'Product',
      width: '35%',
      render: (value, row) => (
        <div className="flex items-center">
          {row.stock <= 3 && (
            <FaExclamationTriangle className="text-red-500 mr-2" />
          )}
          <span className={row.stock <= 3 ? 'font-medium' : ''}>{value}</span>
        </div>
      )
    },
    { field: 'sku', header: 'SKU' },
    { field: 'category', header: 'Category' },
    { 
      field: 'stock', 
      header: 'Stock', 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value <= 3 ? 'bg-red-100 text-red-800' :
          value <= 10 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { field: 'ideal_stock', header: 'Ideal Stock' },
    { 
      field: 'status', 
      header: 'Status', 
      render: (_, row) => {
        if (row.stock === 0) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Out of Stock
            </span>
          );
        }
        if (row.stock <= 3) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Critical
            </span>
          );
        }
        if (row.stock <= 10) {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Low
            </span>
          );
        }
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            OK
          </span>
        );
      }
    }
  ];

  const getAlertLevel = () => {
    const criticalCount = stockAlerts.filter(item => item.stock <= 3).length;
    const lowCount = stockAlerts.filter(item => item.stock > 3 && item.stock <= 10).length;
    
    if (criticalCount > 0) return { level: 'critical', count: criticalCount };
    if (lowCount > 0) return { level: 'warning', count: lowCount };
    return { level: 'normal', count: 0 };
  };

  const alertLevel = getAlertLevel();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              alertLevel.level === 'critical' ? 'bg-red-100 text-red-600' :
              alertLevel.level === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              <FaBox />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Low Stock Alerts</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {stockAlerts.length} items below {currentThreshold} units
                </span>
                {alertLevel.count > 0 && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    alertLevel.level === 'critical' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {alertLevel.count} {alertLevel.level}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Threshold:</span>
              <div className="flex space-x-1">
                {thresholdOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleThresholdChange(option)}
                    className={`px-2 py-1 text-xs rounded ${
                      currentThreshold === option
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              title="Refresh"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {stockAlerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <FaBell className="text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">All Stock Levels Good</h4>
            <p className="text-gray-600 text-sm">
              No items below {currentThreshold} units
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {stockAlerts.filter(item => item.stock <= 3).length}
                  </div>
                  <div className="text-sm text-red-600">Critical Items</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-700">
                    {stockAlerts.filter(item => item.stock > 3 && item.stock <= 10).length}
                  </div>
                  <div className="text-sm text-yellow-600">Low Items</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {stockAlerts.filter(item => item.ideal_stock).reduce((sum, item) => sum + (item.ideal_stock - item.stock), 0)}
                  </div>
                  <div className="text-sm text-blue-600">Units to Reorder</div>
                </div>
              </div>
            </div>
            
            <ReportTable
              data={stockAlerts}
              columns={columns}
              loading={loading}
              emptyMessage="No stock alerts"
              showPagination={false}
              className="border-0 shadow-none"
            />
            
            {alertLevel.level === 'critical' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">Critical Stock Alert</p>
                    <p className="text-sm text-red-700">
                      {stockAlerts.filter(item => item.stock <= 3).length} items are critically low or out of stock.
                      Please reorder immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StockAlertsWidget;