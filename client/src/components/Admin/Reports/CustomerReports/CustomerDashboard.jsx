import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import { 
  FaUsers, 
  FaUserPlus, 
  FaChartLine, 
  FaStar,
  FaShoppingCart,
  FaCommentDots,
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

const CustomerDashboard = () => {
  const {
    customerReports,
    loading,
    error: contextError,
    getActiveUserCount,
    getNewVsReturningUsers,
    getUserEngagementReport,
    getCustomerFeedbackSummary,
    getAllCustomersReport,
    getCustomerOrdersReport,
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
    
    const loadCustomerData = async () => {
      if (!isMounted) return;
      
      try {
        setDataLoadError(null);
        const formattedStartDate = formatDateForAPI(localDateRange.startDate);
        const formattedEndDate = formatDateForAPI(localDateRange.endDate);

        console.log('Loading customer data for:', {
          tab: activeTab,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        switch (activeTab) {
          case 'overview':
            await getActiveUserCount(formattedStartDate, formattedEndDate);
            await getNewVsReturningUsers(formattedStartDate, formattedEndDate);
            break;
          case 'engagement':
            await getUserEngagementReport(formattedStartDate, formattedEndDate);
            break;
          case 'feedback':
            await getCustomerFeedbackSummary(formattedStartDate, formattedEndDate);
            break;
          case 'all':
            await getAllCustomersReport();
            break;
          case 'orders':
            await getCustomerOrdersReport(formattedStartDate, formattedEndDate);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Customer ${activeTab} load error:`, error);
        if (isMounted) {
          setDataLoadError(`Failed to load ${activeTab} data: ${error.message || 'Unknown error'}`);
        }
      }
    };

    loadCustomerData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localDateRange, getActiveUserCount, getNewVsReturningUsers, getUserEngagementReport, getCustomerFeedbackSummary, getAllCustomersReport, getCustomerOrdersReport]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUsers /> },
    { id: 'engagement', label: 'Engagement', icon: <FaChartLine /> },
    { id: 'feedback', label: 'Feedback', icon: <FaStar /> },
    { id: 'all', label: 'All Customers', icon: <FaUsers /> },
    { id: 'orders', label: 'Customer Orders', icon: <FaShoppingCart /> }
  ];

  const customerFilters = [
    { key: 'segment', label: 'Segment', type: 'select', options: [
      { value: 'new', label: 'New Customers' },
      { value: 'returning', label: 'Returning Customers' },
      { value: 'vip', label: 'VIP Customers' }
    ]},
    { key: 'minOrders', label: 'Min Orders', type: 'number', placeholder: '0' },
    { key: 'minSpent', label: 'Min Spent', type: 'number', placeholder: '0' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ];

  const customerColumns = [
    { field: 'customer_name', header: 'Customer', width: '25%' },
    { field: 'email', header: 'Email' },
    { field: 'join_date', header: 'Join Date' },
    { field: 'total_orders', header: 'Orders', 
      render: (value) => safeToLocaleString(value) 
    },
    { field: 'total_spent', header: 'Total Spent', 
      render: (value) => safeFormatDollar(value, '$0') 
    },
    { field: 'last_order', header: 'Last Order' },
    { field: 'segment', header: 'Segment', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'vip' ? 'bg-purple-100 text-purple-800' :
        value === 'returning' ? 'bg-green-100 text-green-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {value || 'unknown'}
      </span>
    )}
  ];

  const handleExport = async (format) => {
    // Map dashboard tabs to actual report types
    const reportTypeMap = {
      overview: 'customer',
      engagement: 'customer',
      feedback: 'customer',
      all: 'customer',
      orders: 'customer'
    };

    const reportType = reportTypeMap[activeTab] || 'customer';

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

  const renderOverview = () => {
    const activeUsers = customerReports.activeUserCount?.active_users || 0;
    const newVsReturning = customerReports.newVsReturning || {};
    
    return (
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Customers</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {safeToLocaleString(activeUsers)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaUsers className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Last 30 days
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-600">New Customers</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {safeToLocaleString(newVsReturning.new_customers || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaUserPlus className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-700">
              This period
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-purple-600">Returning Customers</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {safeToLocaleString(newVsReturning.returning_customers || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaUsers className="text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-purple-700">
              {newVsReturning.return_rate ? `${newVsReturning.return_rate}% rate` : 'N/A'}
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-orange-800 mt-1">
                  {safeFormatDollar(newVsReturning.average_order_value || 0, '$0.00')}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaShoppingCart className="text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-orange-700">
              Per customer
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="New vs Returning Customers"
            data={[
              { label: 'New', value: newVsReturning.new_customers || 0 },
              { label: 'Returning', value: newVsReturning.returning_customers || 0 }
            ]}
            type="doughnut"
            height={300}
            loading={loading}
            emptyMessage="No customer data available"
          />
          
          <ReportChart
            title="Customer Growth"
            data={safeArray(customerReports.engagement).slice(-7)}
            xAxisKey="date"
            yAxisKey="new_customers"
            type="line"
            height={300}
            loading={loading}
            emptyMessage="No engagement data available"
          />
        </div>
      </div>
    );
  };

  const renderEngagement = () => {
    const engagementData = safeArray(customerReports.engagement);
    
    const avgSessionDuration = engagementData.length > 0
      ? Math.round(engagementData.reduce((sum, day) => sum + (day.avg_session_duration || 0), 0) / engagementData.length)
      : 0;
    
    const totalPageViews = engagementData.reduce((sum, day) => sum + (day.page_views || 0), 0);
    const totalConversions = engagementData.reduce((sum, day) => sum + (day.conversions || 0), 0);
    const conversionRate = totalPageViews > 0 ? (totalConversions / totalPageViews * 100) : 0;

    return (
      <div className="space-y-6">
        <ReportChart
          title="Customer Engagement"
          data={engagementData}
          xAxisKey="date"
          yAxisKey="active_users"
          datasets={[
            { key: 'active_users', label: 'Active Users', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
            { key: 'new_customers', label: 'New Customers', backgroundColor: 'rgba(16, 185, 129, 0.5)' },
            { key: 'returning_customers', label: 'Returning', backgroundColor: 'rgba(139, 92, 246, 0.5)' }
          ]}
          type="line"
          height={400}
          loading={loading}
          emptyMessage="No engagement data available"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Avg. Session Duration</h4>
            <p className="text-2xl font-bold text-gray-800">
              {avgSessionDuration}m
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Page Views</h4>
            <p className="text-2xl font-bold text-gray-800">
              {safeToLocaleString(totalPageViews)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Conversion Rate</h4>
            <p className="text-2xl font-bold text-green-600">
              {conversionRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    const feedback = customerReports.feedbackSummary || {};
    const ratingDistribution = feedback.rating_distribution || {};
    const totalReviews = feedback.total_reviews || 0;
    const averageRating = feedback.average_rating || 0;
    
    const ratingEntries = Object.entries(ratingDistribution)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Reviews</span>
                <span className="text-2xl font-bold text-gray-800">
                  {safeToLocaleString(totalReviews)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-yellow-600 mr-2">
                    {averageRating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={i < Math.floor(averageRating) ? 'text-yellow-500' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Positive Feedback</span>
                <span className="text-xl font-bold text-green-600">
                  {safeToLocaleString(feedback.positive_feedback || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Issues Reported</span>
                <span className="text-xl font-bold text-red-600">
                  {safeToLocaleString(feedback.issues_reported || 0)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
            {totalReviews > 0 ? (
              <div className="space-y-3">
                {ratingEntries.map(([rating, count]) => (
                  <div key={rating} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{rating}★</div>
                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ 
                          width: `${(count / totalReviews * 100) || 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No rating distribution data</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAllCustomers = () => {
    return (
      <ReportTable
        title="All Customers"
        data={safeArray(customerReports.allCustomers)}
        columns={customerColumns}
        loading={loading}
        emptyMessage="No customer data available"
      />
    );
  };

  const renderOrders = () => {
    return (
      <ReportTable
        title="Customer Orders"
        data={safeArray(customerReports.customerOrders)}
        columns={[
          { field: 'customer_name', header: 'Customer', width: '20%' },
          { field: 'order_id', header: 'Order ID' },
          { field: 'order_date', header: 'Date' },
          { field: 'amount', header: 'Amount', render: (value) => safeFormatDollar(value) },
          { field: 'status', header: 'Status' },
          { field: 'items_count', header: 'Items', render: (value) => safeToLocaleString(value) }
        ]}
        loading={loading}
        emptyMessage="No customer order data available"
      />
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'engagement':
        return renderEngagement();
      case 'feedback':
        return renderFeedback();
      case 'all':
        return renderAllCustomers();
      case 'orders':
        return renderOrders();
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
          <h2 className="text-2xl font-bold text-gray-800">Customer Reports</h2>
          <p className="text-gray-600">Analyze customer behavior and demographics</p>
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
        filters={customerFilters}
        onFilterChange={setFilters}
        onApply={() => console.log('Customer filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Content */}
      {loading && !customerReports[activeTab] ? (
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
                customerReports[activeTab] ? 'text-green-600' : 'text-red-600'
              }`}>{customerReports[activeTab] ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;