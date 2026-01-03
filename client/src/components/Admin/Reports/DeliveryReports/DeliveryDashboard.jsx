import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import { 
  FaTruck, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaUser,
  FaStar,
  FaMapMarkerAlt,
  FaSpinner,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

import {
  safeToLocaleString,
  safeFormatPercent,
  safeFormatRating,
  safeArray,
  safeFormatDollar
} from '../../../../utils/safeRender';

const DeliveryDashboard = () => {
  const {
    deliveryReports,
    loading,
    error: contextError,
    getDeliveryPerformanceReport,
    getDeliveryPersonRanking,
    getDeliveryIssueSummary,
    getAllDeliveryPersonsReport,
    getDeliveryRatingsReport,
    exportReport
  } = useReportsContext();

  const [activeTab, setActiveTab] = useState('performance');
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
    
    const loadDeliveryData = async () => {
      if (!isMounted) return;
      
      try {
        setDataLoadError(null);
        const formattedStartDate = formatDateForAPI(localDateRange.startDate);
        const formattedEndDate = formatDateForAPI(localDateRange.endDate);

        console.log('Loading delivery data for:', {
          tab: activeTab,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        switch (activeTab) {
          case 'performance':
            await getDeliveryPerformanceReport(formattedStartDate, formattedEndDate);
            break;
          case 'persons':
            await getDeliveryPersonRanking(formattedStartDate, formattedEndDate);
            await getAllDeliveryPersonsReport();
            break;
          case 'issues':
            await getDeliveryIssueSummary(formattedStartDate, formattedEndDate);
            break;
          case 'ratings':
            await getDeliveryRatingsReport(formattedStartDate, formattedEndDate);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Delivery ${activeTab} load error:`, error);
        if (isMounted) {
          setDataLoadError(`Failed to load ${activeTab} data: ${error.message || 'Unknown error'}`);
        }
      }
    };

    loadDeliveryData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localDateRange, getDeliveryPerformanceReport, getDeliveryPersonRanking, getDeliveryIssueSummary, getAllDeliveryPersonsReport, getDeliveryRatingsReport]);

  const tabs = [
    { id: 'performance', label: 'Performance', icon: <FaTruck /> },
    { id: 'persons', label: 'Delivery Persons', icon: <FaUser /> },
    { id: 'issues', label: 'Issues', icon: <FaExclamationTriangle /> },
    { id: 'ratings', label: 'Ratings', icon: <FaStar /> }
  ];

  const deliveryFilters = [
    { key: 'status', label: 'Delivery Status', type: 'select', options: [
      { value: 'delivered', label: 'Delivered' },
      { value: 'in_transit', label: 'In Transit' },
      { value: 'delayed', label: 'Delayed' },
      { value: 'failed', label: 'Failed' }
    ]},
    { key: 'zone', label: 'Delivery Zone', type: 'select', options: [] },
    { key: 'minRating', label: 'Min Rating', type: 'number', placeholder: '1' },
    { key: 'maxRating', label: 'Max Rating', type: 'number', placeholder: '5' }
  ];

  const personColumns = [
    { 
      field: 'delivery_person_name', 
      header: 'Delivery Person',
      width: '25%',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <FaUser className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{value || 'Unknown'}</p>
            <p className="text-xs text-gray-600">{row.vehicle_type || 'N/A'}</p>
          </div>
        </div>
      )
    },
    { field: 'total_deliveries', header: 'Deliveries', 
      render: (value) => safeToLocaleString(value) 
    },
    { field: 'successful_deliveries', header: 'Successful', 
      render: (value) => safeToLocaleString(value) 
    },
    { field: 'success_rate', header: 'Success Rate', render: (value) => (
      <span className={`font-bold ${
        (value || 0) >= 95 ? 'text-green-600' :
        (value || 0) >= 90 ? 'text-yellow-600' :
        'text-red-600'
      }`}>
        {safeFormatPercent(value, 1)}
      </span>
    )},
    { field: 'avg_delivery_time', header: 'Avg. Time', 
      render: (value) => `${safeToLocaleString(value)} min` 
    },
    { field: 'rating', header: 'Rating', render: (value) => (
      <div className="flex items-center">
        <span className="text-yellow-500 mr-1">★</span>
        {safeFormatRating(value)}
      </div>
    )}
  ];

  const handleExport = async (format) => {
    // Map dashboard tabs to actual report types
    const reportTypeMap = {
      performance: 'delivery',
      persons: 'delivery',
      issues: 'delivery',
      ratings: 'delivery'
    };

    const reportType = reportTypeMap[activeTab] || 'delivery';

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

  const renderPerformance = () => {
    const performance = deliveryReports.performance || {};
    
    const statusData = [
      { label: 'Delivered', value: performance.successful_deliveries || 0, color: '#10B981' },
      { label: 'In Transit', value: performance.in_transit || 0, color: '#3B82F6' },
      { label: 'Delayed', value: performance.delayed_deliveries || 0, color: '#F59E0B' },
      { label: 'Failed', value: performance.failed_deliveries || 0, color: '#EF4444' }
    ];

    return (
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {safeFormatPercent(performance.success_rate || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaCheckCircle className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-700">
              {safeToLocaleString(performance.successful_deliveries || 0)} successful
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg. Delivery Time</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {safeToLocaleString(performance.avg_delivery_time || 0)} min
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaClock className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              Target: 30 minutes
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-yellow-600">On-Time Rate</p>
                <p className="text-2xl font-bold text-yellow-800 mt-1">
                  {safeFormatPercent(performance.on_time_rate || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaClock className="text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              {safeToLocaleString(performance.on_time_deliveries || 0)} on-time
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-red-600">Issues Reported</p>
                <p className="text-2xl font-bold text-red-800 mt-1">
                  {safeToLocaleString(performance.issues_reported || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaExclamationTriangle className="text-red-600" />
              </div>
            </div>
            <p className="text-sm text-red-700">
              {performance.issue_rate ? `${performance.issue_rate}% rate` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="Delivery Status Distribution"
            data={statusData}
            type="pie"
            height={350}
            loading={loading}
            emptyMessage="No delivery status data available"
          />
          
          <ReportChart
            title="Delivery Time Distribution"
            data={safeArray(performance.delivery_time_distribution)}
            xAxisKey="time_range"
            yAxisKey="count"
            type="bar"
            height={350}
            loading={loading}
            emptyMessage="No delivery time data available"
          />
        </div>

        {/* Detailed Metrics */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-800">
                {safeToLocaleString(performance.total_deliveries || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Distance</p>
              <p className="text-2xl font-bold text-gray-800">
                {performance.avg_distance ? `${performance.avg_distance} km` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {performance.avg_customer_rating?.toFixed(1) || '0.0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cost per Delivery</p>
              <p className="text-2xl font-bold text-gray-800">
                {safeFormatDollar(performance.avg_cost_per_delivery || 0, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersons = () => {
    const personRanking = safeArray(deliveryReports.personRanking);
    
    return (
      <div className="space-y-6">
        <ReportTable
          title="Delivery Person Performance"
          data={personRanking}
          columns={personColumns}
          loading={loading}
          emptyMessage="No delivery person data available"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="Success Rate Distribution"
            data={personRanking.map(person => ({
              label: person.delivery_person_name,
              value: person.success_rate
            }))}
            type="bar"
            height={300}
            loading={loading}
            emptyMessage="No success rate data available"
          />
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {personRanking.slice(0, 3).map((person, index) => (
                <div key={person.delivery_person_name || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{person.delivery_person_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{safeToLocaleString(person.total_deliveries || 0)} deliveries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{safeFormatPercent(person.success_rate || 0)}</p>
                    <p className="text-sm text-gray-600">Success rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderIssues = () => {
    const issues = deliveryReports.issueSummary || {};
    
    const issueTypes = Object.entries(issues.issue_types || {}).map(([type, count]) => ({
      label: type.replace(/_/g, ' '),
      value: count
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-red-800 mb-2">Total Issues</h4>
            <p className="text-3xl font-bold text-red-600">
              {safeToLocaleString(issues.total_issues || 0)}
            </p>
            <p className="text-sm text-red-700 mt-2">
              {issues.issue_rate ? `${issues.issue_rate}% of deliveries` : 'N/A'}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">Most Common Issue</h4>
            <p className="text-xl font-bold text-yellow-600">
              {issues.most_common_issue || 'N/A'}
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              {safeToLocaleString(issues.most_common_count || 0)} occurrences
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">Avg. Resolution Time</h4>
            <p className="text-3xl font-bold text-blue-600">
              {issues.avg_resolution_time ? `${issues.avg_resolution_time} hours` : 'N/A'}
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Time to resolve issues
            </p>
          </div>
        </div>
        
        {issueTypes.length > 0 && (
          <ReportChart
            title="Issue Type Distribution"
            data={issueTypes}
            type="bar"
            height={350}
            loading={loading}
          />
        )}
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Resolution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Resolved Issues</span>
              <span className="font-bold text-green-600">
                {safeToLocaleString(issues.resolved_issues || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Issues</span>
              <span className="font-bold text-yellow-600">
                {safeToLocaleString(issues.pending_issues || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Escalated Issues</span>
              <span className="font-bold text-red-600">
                {safeToLocaleString(issues.escalated_issues || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRatings = () => {
    const ratings = safeArray(deliveryReports.ratings);
    const totalRatings = ratings.reduce((sum, r) => sum + (r.count || 0), 0);
    const avgRating = totalRatings > 0 
      ? (ratings.reduce((sum, r) => sum + (r.rating || 0) * (r.count || 0), 0) / totalRatings)
      : 0;
    const fiveStarRatings = ratings.find(r => r.rating === 5)?.count || 0;

    return (
      <div className="space-y-6">
        <ReportChart
          title="Customer Ratings Distribution"
          data={ratings}
          xAxisKey="rating"
          yAxisKey="count"
          type="bar"
          height={350}
          loading={loading}
          emptyMessage="No rating data available"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-yellow-600 mr-2">
                    {avgRating.toFixed(1)}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(avgRating) ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Ratings</span>
                <span className="font-bold text-gray-800">
                  {safeToLocaleString(totalRatings)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">5-Star Ratings</span>
                <span className="font-bold text-green-600">
                  {safeToLocaleString(fiveStarRatings)}
                </span>
              </div>
            </div>
          </div>
          
          <ReportTable
            title="Rating Distribution"
            data={ratings}
            columns={[
              { 
                field: 'rating', 
                header: 'Rating',
                render: (value) => (
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < value ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                    <span className="ml-2 font-medium">({value})</span>
                  </div>
                )
              },
              { field: 'count', header: 'Number of Ratings' },
              { 
                field: 'percentage', 
                header: 'Percentage', 
                render: (value, row) => {
                  const percentage = totalRatings > 0 ? ((row.count || 0) / totalRatings * 100).toFixed(1) : 0;
                  return `${percentage}%`;
                }
              }
            ]}
            loading={loading}
            emptyMessage="No rating data available"
            showPagination={false}
          />
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return renderPerformance();
      case 'persons':
        return renderPersons();
      case 'issues':
        return renderIssues();
      case 'ratings':
        return renderRatings();
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
          <h2 className="text-2xl font-bold text-gray-800">Delivery Reports</h2>
          <p className="text-gray-600">Monitor delivery performance and logistics</p>
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
        filters={deliveryFilters}
        onFilterChange={setFilters}
        onApply={() => console.log('Delivery filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Content */}
      {loading && !deliveryReports[activeTab] ? (
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
                deliveryReports[activeTab] ? 'text-green-600' : 'text-red-600'
              }`}>{deliveryReports[activeTab] ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;