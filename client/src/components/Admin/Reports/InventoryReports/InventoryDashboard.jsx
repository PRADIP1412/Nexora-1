import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import StockAlertsWidget from '../ProductReports/StockAlertsWidget';
import { 
  FaBox, 
  FaExchangeAlt, 
  FaTruck, 
  FaChartLine,
  FaDollarSign,
  FaExclamationTriangle,
  FaSpinner,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

import {
  safeToLocaleString,
  safeFormatDollar,
  safeArray
} from '../../../../utils/safeRender';

const InventoryDashboard = () => {
  const {
    inventoryReports,
    loading,
    error: contextError,
    getInventoryStatus,
    getStockMovementReport,
    getPurchaseSummary,
    getSupplierPerformanceReport,
    exportReport
  } = useReportsContext();

  const [activeTab, setActiveTab] = useState('status');
  const [filters, setFilters] = useState({});
  const [localDateRange, setLocalDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date()
  });
  const [exportStatus, setExportStatus] = useState({ type: null, message: '' });
  const [dataLoadError, setDataLoadError] = useState(null);

  // Format dates for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadInventoryData = async () => {
      if (!isMounted) return;
      
      try {
        setDataLoadError(null);
        const formattedStartDate = formatDateForAPI(localDateRange.startDate);
        const formattedEndDate = formatDateForAPI(localDateRange.endDate);

        console.log('Loading inventory data for:', {
          tab: activeTab,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        switch (activeTab) {
          case 'status':
            await getInventoryStatus();
            break;
          case 'movement':
            await getStockMovementReport(formattedStartDate, formattedEndDate);
            break;
          case 'purchases':
            await getPurchaseSummary(formattedStartDate, formattedEndDate);
            break;
          case 'suppliers':
            await getSupplierPerformanceReport(formattedStartDate, formattedEndDate);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Inventory ${activeTab} load error:`, error);
        if (isMounted) {
          setDataLoadError(`Failed to load ${activeTab} data: ${error.message || 'Unknown error'}`);
        }
      }
    };

    loadInventoryData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localDateRange, getInventoryStatus, getStockMovementReport, getPurchaseSummary, getSupplierPerformanceReport]);

  const tabs = [
    { id: 'status', label: 'Status', icon: <FaBox /> },
    { id: 'movement', label: 'Movement', icon: <FaExchangeAlt /> },
    { id: 'purchases', label: 'Purchases', icon: <FaTruck /> },
    { id: 'suppliers', label: 'Suppliers', icon: <FaChartLine /> }
  ];

  const inventoryFilters = [
    { key: 'category', label: 'Category', type: 'select', options: [] },
    { key: 'supplier', label: 'Supplier', type: 'select', options: [] },
    { key: 'minStock', label: 'Min Stock', type: 'number', placeholder: '0' },
    { key: 'maxStock', label: 'Max Stock', type: 'number', placeholder: '1000' }
  ];

  const statusColumns = [
    { field: 'product_name', header: 'Product', width: '25%' },
    { field: 'sku', header: 'SKU' },
    { field: 'category', header: 'Category' },
    { field: 'current_stock', header: 'Current Stock', render: (value) => (
      <span className={`font-medium ${
        value < 10 ? 'text-red-600' :
        value < 25 ? 'text-yellow-600' :
        'text-green-600'
      }`}>
        {safeToLocaleString(value)}
      </span>
    )},
    { field: 'ideal_stock', header: 'Ideal Stock', render: (value) => safeToLocaleString(value) },
    { field: 'status', header: 'Status', render: (value, row) => {
      const currentStock = row.current_stock || 0;
      if (currentStock === 0) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Out of Stock
          </span>
        );
      }
      if (currentStock < 10) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Low Stock
          </span>
        );
      }
      if (currentStock < 25) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Warning
          </span>
        );
      }
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      );
    }}
  ];

  const movementColumns = [
    { field: 'date', header: 'Date' },
    { field: 'product_name', header: 'Product' },
    { field: 'type', header: 'Type', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'sale' ? 'bg-green-100 text-green-800' :
        value === 'purchase' ? 'bg-blue-100 text-blue-800' :
        value === 'return' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value || 'N/A'}
      </span>
    )},
    { field: 'quantity', header: 'Quantity', render: (value, row) => (
      <span className={row.type === 'sale' ? 'text-red-600' : 'text-green-600'}>
        {row.type === 'sale' ? '-' : '+'}{safeToLocaleString(value || 0)}
      </span>
    )},
    { field: 'unit_price', header: 'Unit Price', render: (value) => safeFormatDollar(value || 0) },
    { field: 'total_value', header: 'Total Value', render: (value) => safeFormatDollar(value || 0) }
  ];

  const handleExport = async (format) => {
    // Map dashboard tabs to actual report types
    const reportTypeMap = {
      status: 'inventory',
      movement: 'inventory',
      purchases: 'inventory',
      suppliers: 'inventory'
    };

    const reportType = reportTypeMap[activeTab] || 'inventory';

    // Format dates for API
    const formattedStartDate = formatDateForAPI(localDateRange.startDate);
    const formattedEndDate = formatDateForAPI(localDateRange.endDate);

    console.log('Exporting report (with formatted dates):', {
      reportType,
      format,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });

    setExportStatus({ type: 'loading', message: 'Preparing export...' });
    
    try {
      // Pass formatted string dates, not Date objects
      const result = await exportReport(
        reportType,
        format,
        formattedStartDate,
        formattedEndDate
      );

      if (result?.success) {
        setExportStatus({ 
          type: 'success', 
          message: `Export completed! File: ${result.filename || 'report'}` 
        });
        setTimeout(() => setExportStatus({ type: null, message: '' }), 5000);
        return { success: true };
      } else {
        setExportStatus({ 
          type: 'error', 
          message: result?.message || 'Export failed' 
        });
        setTimeout(() => setExportStatus({ type: null, message: '' }), 5000);
        return { success: false, message: result?.message };
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({ 
        type: 'error', 
        message: error.message || 'Export failed due to an unknown error' 
      });
      setTimeout(() => setExportStatus({ type: null, message: '' }), 5000);
      return { success: false, message: error.message };
    }
  };

  const renderExportStatus = () => {
    if (!exportStatus.type) return null;

    const statusConfig = {
      loading: {
        icon: <FaSpinner className="animate-spin mr-2" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      },
      success: {
        icon: <FaCheck className="mr-2" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      },
      error: {
        icon: <FaTimes className="mr-2" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800'
      }
    };

    const config = statusConfig[exportStatus.type];

    return (
      <div className={`mb-4 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center">
          {config.icon}
          <span className={`font-medium ${config.textColor}`}>
            {exportStatus.message}
          </span>
        </div>
      </div>
    );
  };

  const renderErrorState = () => {
    const errorMessage = contextError || dataLoadError;
    
    if (!errorMessage) return null;

    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start">
          <FaExclamationTriangle className="text-red-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
            <p className="text-red-700 mb-4">{errorMessage}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting Tips:</p>
              <ul className="text-sm text-yellow-700 list-disc pl-5 space-y-1">
                <li>Check if the backend server is running on port 8000</li>
                <li>Verify your internet connection</li>
                <li>Try reducing the date range to 1-3 days</li>
                <li>Clear browser cache and reload the page</li>
                <li>Check browser console (F12) for detailed error logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => {
    if (!loading) return null;

    return (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center">
          <FaSpinner className="animate-spin text-blue-600 mr-3" />
          <div>
            <p className="text-blue-800 font-medium">Loading {activeTab} data...</p>
            <p className="text-sm text-blue-600 mt-1">
              Date Range: {formatDateForAPI(localDateRange.startDate)} to {formatDateForAPI(localDateRange.endDate)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const calculateInventoryMetrics = () => {
    const statusData = safeArray(inventoryReports.status);
    const movementData = safeArray(inventoryReports.stockMovement);
    
    const totalValue = statusData.reduce((sum, item) => {
      const stock = item.current_stock || 0;
      const price = item.unit_price || 0;
      return sum + (stock * price);
    }, 0);
    
    const lowStockItems = statusData.filter(item => (item.current_stock || 0) < 10).length;
    const outOfStockItems = statusData.filter(item => (item.current_stock || 0) === 0).length;
    const totalItems = statusData.length;
    
    const totalPurchases = movementData
      .filter(item => item.type === 'purchase')
      .reduce((sum, item) => sum + (item.total_value || 0), 0);
    
    const totalSales = movementData
      .filter(item => item.type === 'sale')
      .reduce((sum, item) => sum + (item.total_value || 0), 0);
    
    return {
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalItems,
      totalPurchases,
      totalSales,
      stockTurnover: totalPurchases > 0 ? (totalSales / totalPurchases).toFixed(2) : '0.00'
    };
  };

  const metrics = calculateInventoryMetrics();

  const renderStatus = () => {
    const statusData = safeArray(inventoryReports.status);

    return (
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Inventory Value</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {safeFormatDollar(metrics.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaDollarSign className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              {safeToLocaleString(metrics.totalItems)} items
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-yellow-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">
                  {safeToLocaleString(metrics.lowStockItems)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaExclamationTriangle className="text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              Below 10 units
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-red-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-800 mt-1">
                  {safeToLocaleString(metrics.outOfStockItems)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaBox className="text-red-600" />
              </div>
            </div>
            <p className="text-sm text-red-700">
              Requires immediate attention
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-600">Stock Turnover</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {metrics.stockTurnover}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaExchangeAlt className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-700">
              Ratio
            </p>
          </div>
        </div>

        {/* Stock Alerts */}
        <StockAlertsWidget threshold={10} autoRefresh={true} />

        {/* Inventory Table */}
        <ReportTable
          title="Inventory Status"
          data={statusData}
          columns={statusColumns}
          loading={loading}
          emptyMessage="No inventory data available"
        />
      </div>
    );
  };

  const renderMovement = () => {
    const movementData = safeArray(inventoryReports.stockMovement);
    const recentMovement = movementData.slice(-20);

    return (
      <div className="space-y-6">
        <ReportChart
          title="Stock Movement"
          data={recentMovement}
          xAxisKey="date"
          yAxisKey="quantity"
          datasets={[
            { 
              key: 'quantity', 
              label: 'Quantity', 
              backgroundColor: recentMovement.map(item => 
                item.type === 'sale' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)'
              )
            }
          ]}
          type="bar"
          height={400}
          loading={loading}
          emptyMessage="No stock movement data available"
        />
        
        <ReportTable
          title="Stock Movement Log"
          data={movementData}
          columns={movementColumns}
          loading={loading}
          emptyMessage="No stock movement data available"
        />
      </div>
    );
  };

  const renderPurchases = () => {
    const purchaseData = safeArray(inventoryReports.purchaseSummary);
    const totalPurchases = purchaseData.reduce((sum, item) => sum + (item.total_value || 0), 0);
    
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Purchase Summary</h3>
            <div className="text-2xl font-bold text-blue-600">
              {safeFormatDollar(totalPurchases)}
            </div>
          </div>
          
          <ReportChart
            title="Purchases Over Time"
            data={purchaseData}
            xAxisKey="date"
            yAxisKey="total_value"
            type="line"
            height={300}
            loading={loading}
            emptyMessage="No purchase data available"
          />
        </div>
        
        <ReportTable
          title="Purchase Details"
          data={purchaseData}
          columns={[
            { field: 'date', header: 'Date' },
            { field: 'supplier_name', header: 'Supplier' },
            { field: 'product_count', header: 'Products', render: (value) => safeToLocaleString(value) },
            { field: 'total_quantity', header: 'Total Quantity', render: (value) => safeToLocaleString(value) },
            { field: 'total_value', header: 'Total Value', render: (value) => safeFormatDollar(value) },
            { field: 'avg_unit_price', header: 'Avg. Price', render: (value) => safeFormatDollar(value) }
          ]}
          loading={loading}
          emptyMessage="No purchase data available"
        />
      </div>
    );
  };

  const renderSuppliers = () => {
    const supplierData = safeArray(inventoryReports.supplierPerformance);

    return (
      <div className="space-y-6">
        <ReportChart
          title="Supplier Performance"
          data={supplierData}
          xAxisKey="supplier_name"
          yAxisKey="total_purchases"
          type="bar"
          height={350}
          loading={loading}
          emptyMessage="No supplier data available"
        />
        
        <ReportTable
          title="Supplier Details"
          data={supplierData}
          columns={[
            { field: 'supplier_name', header: 'Supplier', width: '25%' },
            { field: 'total_purchases', header: 'Total Purchases', render: (value) => safeFormatDollar(value) },
            { field: 'order_count', header: 'Orders', render: (value) => safeToLocaleString(value) },
            { field: 'avg_delivery_time', header: 'Avg. Delivery', render: (value) => `${value || 0} days` },
            { field: 'quality_rating', header: 'Quality', render: (value) => (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < (value || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
            )},
            { field: 'reliability', header: 'Reliability', render: (value) => `${value || 0}%` }
          ]}
          loading={loading}
          emptyMessage="No supplier data available"
        />
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'status':
        return renderStatus();
      case 'movement':
        return renderMovement();
      case 'purchases':
        return renderPurchases();
      case 'suppliers':
        return renderSuppliers();
      default:
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-500">Select a tab to view data</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory Reports</h2>
          <p className="text-gray-600">Manage and monitor stock levels</p>
        </div>
        <ExportControls
          onExport={handleExport}
          formats={['csv', 'excel']}
          fileName={`${activeTab}_report_${formatDateForAPI(localDateRange.startDate)}_to_${formatDateForAPI(localDateRange.endDate)}`}
          disabled={loading || exportStatus.type === 'loading'}
          loading={loading || exportStatus.type === 'loading'}
        />
      </div>

      {/* Status Messages */}
      {renderExportStatus()}
      {renderErrorState()}
      {renderLoadingState()}

      {/* Date Range Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Date Range</h3>
            <p className="text-sm text-gray-600">Select date range for reports</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formatDateForAPI(localDateRange.startDate)}
                onChange={(e) => setLocalDateRange(prev => ({
                  ...prev,
                  startDate: e.target.value ? new Date(e.target.value) : prev.startDate
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formatDateForAPI(localDateRange.endDate)}
                onChange={(e) => setLocalDateRange(prev => ({
                  ...prev,
                  endDate: e.target.value ? new Date(e.target.value) : prev.endDate
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-6 sm:mt-7">
              <button
                onClick={() => setLocalDateRange({
                  startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
                  endDate: new Date()
                })}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="1 day - Fastest loading"
              >
                1 Day
              </button>
              <button
                onClick={() => setLocalDateRange({
                  startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
                  endDate: new Date()
                })}
                className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="7 days - Recommended"
              >
                7 Days
              </button>
              <button
                onClick={() => setLocalDateRange({
                  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
                  endDate: new Date()
                })}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="30 days - May be slow"
              >
                30 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filters={inventoryFilters}
        onFilterChange={setFilters}
        onApply={() => console.log('Inventory filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Content */}
      {loading && !inventoryReports[activeTab] ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-xl">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
          <p className="text-gray-700 font-medium">Loading {activeTab} data...</p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment for larger date ranges
          </p>
        </div>
      ) : (
        renderTabContent()
      )}

      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs">
          <p className="font-medium text-gray-700 mb-2">Debug Information:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Active Tab: <span className="font-medium">{activeTab}</span></p>
              <p className="text-gray-600">Date Range: <span className="font-medium">{formatDateForAPI(localDateRange.startDate)} to {formatDateForAPI(localDateRange.endDate)}</span></p>
              <p className="text-gray-600">Loading: <span className={`font-medium ${loading ? 'text-yellow-600' : 'text-green-600'}`}>{loading ? 'Yes' : 'No'}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Export Status: <span className={`font-medium ${
                exportStatus.type === 'loading' ? 'text-blue-600' :
                exportStatus.type === 'success' ? 'text-green-600' :
                exportStatus.type === 'error' ? 'text-red-600' : 'text-gray-600'
              }`}>{exportStatus.type || 'None'}</span></p>
              <p className="text-gray-600">Data Available: <span className={`font-medium ${
                inventoryReports[activeTab] ? 'text-green-600' : 'text-red-600'
              }`}>{inventoryReports[activeTab] ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;