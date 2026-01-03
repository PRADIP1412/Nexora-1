import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import { 
  FaDollarSign, 
  FaShoppingCart, 
  FaChartLine, 
  FaExchangeAlt,
  FaUndo,
  FaTags,
  FaCalendar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';

import {
  safeToLocaleString,
  safeFormatDollar,
  safeFormatPercent,
  safeArray
} from '../../../../utils/safeRender';

const SalesDashboard = () => {
  const {
    salesReports,
    loading,
    error: contextError,
    getTotalSalesReport,
    getSalesByCategory,
    getSalesByBrand,
    getDailySalesTrend,
    getAllOrdersReport,
    getOrderStatusSummary,
    getReturnsSummary,
    getRefundSummary,
    exportReport
  } = useReportsContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({});
  const [localDateRange, setLocalDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Reduced to 7 days
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
    
    const loadSalesData = async () => {
      if (!isMounted) return;
      
      try {
        setDataLoadError(null);
        const formattedStartDate = formatDateForAPI(localDateRange.startDate);
        const formattedEndDate = formatDateForAPI(localDateRange.endDate);

        console.log('Loading sales data for:', {
          tab: activeTab,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        switch (activeTab) {
          case 'overview':
            await getTotalSalesReport(formattedStartDate, formattedEndDate);
            await getOrderStatusSummary(formattedStartDate, formattedEndDate);
            break;
          case 'trends':
            await getDailySalesTrend(formattedStartDate, formattedEndDate);
            break;
          case 'categories':
            await getSalesByCategory(formattedStartDate, formattedEndDate);
            break;
          case 'brands':
            await getSalesByBrand(formattedStartDate, formattedEndDate);
            break;
          case 'orders':
            await getAllOrdersReport(formattedStartDate, formattedEndDate);
            break;
          case 'returns':
            await getReturnsSummary(formattedStartDate, formattedEndDate);
            await getRefundSummary(formattedStartDate, formattedEndDate);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Sales ${activeTab} load error:`, error);
        if (isMounted) {
          setDataLoadError(`Failed to load ${activeTab} data: ${error.message || 'Unknown error'}`);
        }
      }
    };

    loadSalesData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localDateRange, getTotalSalesReport, getOrderStatusSummary, getDailySalesTrend, getSalesByCategory, getSalesByBrand, getAllOrdersReport, getReturnsSummary, getRefundSummary]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { id: 'trends', label: 'Trends', icon: <FaCalendar /> },
    { id: 'categories', label: 'Categories', icon: <FaTags /> },
    { id: 'brands', label: 'Brands', icon: <FaTags /> },
    { id: 'orders', label: 'Orders', icon: <FaShoppingCart /> },
    { id: 'returns', label: 'Returns', icon: <FaUndo /> }
  ];

  const salesFilters = [
    { key: 'status', label: 'Order Status', type: 'select', options: [
      { value: 'completed', label: 'Completed' },
      { value: 'pending', label: 'Pending' },
      { value: 'cancelled', label: 'Cancelled' }
    ]},
    { key: 'payment', label: 'Payment Method', type: 'select', options: [
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' }
    ]},
    { key: 'minAmount', label: 'Min Amount', type: 'number', placeholder: '0' },
    { key: 'maxAmount', label: 'Max Amount', type: 'number', placeholder: '10000' }
  ];

  const orderColumns = [
    { field: 'order_id', header: 'Order ID' },
    { field: 'customer_name', header: 'Customer' },
    { field: 'date', header: 'Date' },
    { field: 'amount', header: 'Amount', render: (value) => safeFormatDollar(value) },
    { field: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'completed' ? 'bg-green-100 text-green-800' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        value === 'cancelled' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { field: 'payment_method', header: 'Payment' }
  ];

  const handleExport = async (format) => {
    const reportTypeMap = {
      overview: 'sales',
      trends: 'sales',
      categories: 'product',
      brands: 'product',
      orders: 'order',
      returns: 'order'
    };

    const reportType = reportTypeMap[activeTab] || 'product';

    // Format dates for API (CRITICAL FIX)
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
        formattedStartDate,  // This should be a string like "2025-11-20"
        formattedEndDate     // This should be a string like "2025-12-20"
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

  const handleDateRangeChange = (newDateRange) => {
    setLocalDateRange(newDateRange);
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
        icon: <FaCheckCircle className="mr-2" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      },
      error: {
        icon: <FaTimesCircle className="mr-2" />,
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

  const renderOverview = () => {
    const totalSales = salesReports.totalSales || {};
    const statusSummary = safeArray(salesReports.statusSummary);
    
    const completedOrders = statusSummary.find(s => s.status === 'completed')?.count || 0;
    const pendingOrders = statusSummary.find(s => s.status === 'pending')?.count || 0;
    const totalOrders = statusSummary.reduce((sum, s) => sum + (s.count || 0), 0);
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {safeFormatDollar(totalSales.total_amount || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaDollarSign className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              {totalSales.total_orders || 0} orders
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  ${(totalSales.average_order_value || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaShoppingCart className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-700">
              {totalSales.total_items || 0} items sold
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed Orders</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {completedOrders}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaExchangeAlt className="text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-purple-700">
              {completionRate.toFixed(1)}% completion
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-800 mt-1">
                  {pendingOrders}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaShoppingCart className="text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-orange-700">
              Requires attention
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="Sales by Status"
            data={statusSummary}
            xAxisKey="status"
            yAxisKey="count"
            type="doughnut"
            height={300}
            loading={loading}
          />
          
          <ReportChart
            title="Order Status Distribution"
            data={statusSummary}
            xAxisKey="status"
            yAxisKey="count"
            type="bar"
            height={300}
            loading={loading}
          />
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    const dailyTrend = safeArray(salesReports.dailyTrend);
    const trendHasData = dailyTrend.length > 0;
    const maxAmount = trendHasData ? Math.max(...dailyTrend.map(d => d.amount || 0)) : 0;
    const avgAmount = trendHasData 
      ? dailyTrend.reduce((sum, d) => sum + (d.amount || 0), 0) / dailyTrend.length 
      : 0;
    const growthRate = dailyTrend.length > 1
      ? ((dailyTrend[dailyTrend.length - 1].amount || 0) - (dailyTrend[0].amount || 0)) / 
        (dailyTrend[0].amount || 1) * 100
      : 0;

    return (
      <div className="space-y-6">
        <ReportChart
          title="Daily Sales Trend"
          data={dailyTrend}
          xAxisKey="date"
          yAxisKey="amount"
          type="line"
          height={400}
          loading={loading}
          error={!trendHasData ? 'No trend data available' : null}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Highest Day</h4>
            <p className="text-xl font-bold text-gray-800">
              {safeFormatDollar(maxAmount)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Average Daily</h4>
            <p className="text-xl font-bold text-gray-800">
              {safeFormatDollar(Math.round(avgAmount))}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Growth Rate</h4>
            <p className={`text-xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    const categories = safeArray(salesReports.byCategory);
    return (
      <div className="space-y-6">
        <ReportChart
          title="Sales by Category"
          data={categories}
          xAxisKey="category"
          yAxisKey="sales"
          type="bar"
          height={400}
          loading={loading}
        />
        
        <ReportTable
          title="Category Sales Breakdown"
          data={categories}
          columns={[
            { field: 'category', header: 'Category' },
            { field: 'sales', header: 'Sales', render: (value) => safeFormatDollar(value) },
            { field: 'orders', header: 'Orders', render: (value) => safeToLocaleString(value) },
            { field: 'percentage', header: 'Market Share', render: (value) => safeFormatPercent(value, 1) }
          ]}
          loading={loading}
          emptyMessage="No category data available"
        />
      </div>
    );
  };

  const renderBrands = () => {
    const brands = safeArray(salesReports.byBrand);
    return (
      <div className="space-y-6">
        <ReportChart
          title="Sales by Brand"
          data={brands}
          xAxisKey="brand"
          yAxisKey="sales"
          type="bar"
          height={400}
          loading={loading}
        />
        
        <ReportTable
          title="Brand Performance"
          data={brands}
          columns={[
            { field: 'brand', header: 'Brand' },
            { field: 'sales', header: 'Sales', render: (value) => safeFormatDollar(value) },
            { field: 'units_sold', header: 'Units Sold', render: (value) => safeToLocaleString(value) },
            { field: 'avg_price', header: 'Avg. Price', render: (value) => safeFormatDollar(value, { minimumFractionDigits: 2 }) }
          ]}
          loading={loading}
          emptyMessage="No brand data available"
        />
      </div>
    );
  };

  const renderOrders = () => {
    return (
      <ReportTable
        title="All Orders"
        data={safeArray(salesReports.allOrders)}
        columns={orderColumns}
        loading={loading}
        emptyMessage="No order data available"
      />
    );
  };

  const renderReturns = () => {
    const returnsSummary = salesReports.returnsSummary || {};
    const refundSummary = salesReports.refundSummary || {};
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Returns Summary</h3>
            {returnsSummary.total_returns !== undefined ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Returns</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {returnsSummary.total_returns || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Return Rate</span>
                  <span className="text-xl font-bold text-red-600">
                    {(returnsSummary.return_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Value</span>
                  <span className="text-xl font-bold text-gray-800">
                    {safeFormatDollar(returnsSummary.total_value || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No returns data available</p>
            )}
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Refund Summary</h3>
            {refundSummary.total_refunds !== undefined ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Refunds</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {refundSummary.total_refunds || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Refund Amount</span>
                  <span className="text-xl font-bold text-gray-800">
                    {safeFormatDollar(refundSummary.total_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Refund</span>
                  <span className="text-xl font-bold text-gray-800">
                    ${(refundSummary.average_refund || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No refund data available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'trends':
        return renderTrends();
      case 'categories':
        return renderCategories();
      case 'brands':
        return renderBrands();
      case 'orders':
        return renderOrders();
      case 'returns':
        return renderReturns();
      default:
        return (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-500">Select a tab to view data</p>
          </div>
        );
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
          <p className="text-gray-600">Analyze sales performance and revenue metrics</p>
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
        filters={salesFilters}
        onFilterChange={setFilters}
        onApply={() => console.log('Filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Content */}
      {loading && !salesReports[activeTab] ? (
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
                salesReports[activeTab] ? 'text-green-600' : 'text-red-600'
              }`}>{salesReports[activeTab] ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;