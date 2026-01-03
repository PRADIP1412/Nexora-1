import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import { 
  FaTag, 
  FaBullhorn, 
  FaChartLine, 
  FaUsers,
  FaDollarSign,
  FaPercentage,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

import {
  safeToLocaleString,
  safeFormatDollar,
  safeFormatPercent,
  safeArray
} from '../../../../utils/safeRender';

const MarketingDashboard = () => {
  const {
    marketingReports,
    loading,
    error: contextError,
    getCouponUsageReport,
    getOfferPerformanceReport,
    getPromotionalSummary,
    exportReport
  } = useReportsContext();

  const [activeTab, setActiveTab] = useState('coupons');
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
    
    const loadMarketingData = async () => {
      if (!isMounted) return;
      
      try {
        setDataLoadError(null);
        const formattedStartDate = formatDateForAPI(localDateRange.startDate);
        const formattedEndDate = formatDateForAPI(localDateRange.endDate);

        console.log('Loading marketing data for:', {
          tab: activeTab,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        switch (activeTab) {
          case 'coupons':
            await getCouponUsageReport(formattedStartDate, formattedEndDate);
            break;
          case 'offers':
            await getOfferPerformanceReport(formattedStartDate, formattedEndDate);
            break;
          case 'summary':
            await getPromotionalSummary(formattedStartDate, formattedEndDate);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Marketing ${activeTab} load error:`, error);
        if (isMounted) {
          setDataLoadError(`Failed to load ${activeTab} data: ${error.message || 'Unknown error'}`);
        }
      }
    };

    loadMarketingData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localDateRange, getCouponUsageReport, getOfferPerformanceReport, getPromotionalSummary]);

  const tabs = [
    { id: 'coupons', label: 'Coupons', icon: <FaTag /> },
    { id: 'offers', label: 'Offers', icon: <FaBullhorn /> },
    { id: 'summary', label: 'Summary', icon: <FaChartLine /> }
  ];

  const marketingFilters = [
    { key: 'type', label: 'Campaign Type', type: 'select', options: [
      { value: 'coupon', label: 'Coupon' },
      { value: 'discount', label: 'Discount' },
      { value: 'bundle', label: 'Bundle Offer' },
      { value: 'flash_sale', label: 'Flash Sale' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'expired', label: 'Expired' },
      { value: 'scheduled', label: 'Scheduled' }
    ]},
    { key: 'minDiscount', label: 'Min Discount', type: 'number', placeholder: '0' },
    { key: 'maxDiscount', label: 'Max Discount', type: 'number', placeholder: '100' }
  ];

  const couponColumns = [
    { field: 'coupon_code', header: 'Coupon Code', width: '15%' },
    { field: 'description', header: 'Description', width: '25%' },
    { field: 'discount_type', header: 'Type', render: (value) => (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {value || '-'}
      </span>
    )},
    { field: 'discount_value', header: 'Value', render: (value, row) => (
      <span className="font-bold text-green-600">
        {row.discount_type === 'percentage' ? `${value || 0}%` : safeFormatDollar(value || 0)}
      </span>
    )},
    { field: 'usage_count', header: 'Usage', render: (value) => 
      safeToLocaleString(value)
    },
    { field: 'total_discount', header: 'Total Discount', render: (value) => 
      safeFormatDollar(value)
    },
    { field: 'redemption_rate', header: 'Redemption Rate', render: (value) => (
      <span className={`font-bold ${
        (value || 0) >= 20 ? 'text-green-600' :
        (value || 0) >= 10 ? 'text-yellow-600' :
        'text-red-600'
      }`}>
        {safeFormatPercent(value || 0)}
      </span>
    )}
  ];

  const handleExport = async (format) => {
    // Map dashboard tabs to actual report types
    const reportTypeMap = {
      coupons: 'marketing',
      offers: 'marketing',
      summary: 'marketing'
    };

    const reportType = reportTypeMap[activeTab] || 'marketing';

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

  const renderCoupons = () => {
    const couponData = safeArray(marketingReports.couponUsage);
    const totalDiscount = couponData.reduce((sum, coupon) => sum + (coupon.total_discount || 0), 0);
    const totalUsage = couponData.reduce((sum, coupon) => sum + (coupon.usage_count || 0), 0);
    const avgRedemption = couponData.length > 0 
      ? couponData.reduce((sum, coupon) => sum + (coupon.redemption_rate || 0), 0) / couponData.length
      : 0;

    return (
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-600">Total Discount Given</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {safeFormatDollar(totalDiscount)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaDollarSign className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-700">
              Across all coupons
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Coupon Usage</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  {safeToLocaleString(totalUsage)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaTag className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              {couponData.length} active coupons
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg. Redemption Rate</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {avgRedemption.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaPercentage className="text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-purple-700">
              Industry avg: 15%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="Top Performing Coupons"
            data={couponData.slice(0, 8)}
            xAxisKey="coupon_code"
            yAxisKey="usage_count"
            type="bar"
            height={300}
            loading={loading}
            emptyMessage="No coupon data available"
          />
          
          <ReportChart
            title="Discount Distribution"
            data={couponData.map(coupon => ({
              label: coupon.coupon_code || 'Unknown',
              value: coupon.total_discount || 0
            }))}
            type="pie"
            height={300}
            loading={loading}
            emptyMessage="No discount distribution data"
          />
        </div>

        {/* Coupon Table */}
        <ReportTable
          title="Coupon Performance"
          data={couponData}
          columns={couponColumns}
          loading={loading}
          emptyMessage="No coupon data available"
        />
      </div>
    );
  };

  const renderOffers = () => {
    const offerData = safeArray(marketingReports.offerPerformance);
    const totalRevenue = offerData.reduce((sum, offer) => sum + (offer.revenue_generated || 0), 0);
    const totalConversions = offerData.reduce((sum, offer) => sum + (offer.conversions || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-2">Total Campaigns</h4>
            <p className="text-3xl font-bold text-blue-600">
              {safeToLocaleString(offerData.length)}
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-2">Revenue Generated</h4>
            <p className="text-3xl font-bold text-green-600">
              {safeFormatDollar(totalRevenue)}
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-purple-800 mb-2">Total Conversions</h4>
            <p className="text-3xl font-bold text-purple-600">
              {safeToLocaleString(totalConversions)}
            </p>
          </div>
        </div>

        <ReportChart
          title="Offer Performance"
          data={offerData}
          xAxisKey="offer_name"
          yAxisKey="revenue_generated"
          datasets={[
            { key: 'revenue_generated', label: 'Revenue', backgroundColor: 'rgba(16, 185, 129, 0.5)' },
            { key: 'conversions', label: 'Conversions', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
            { key: 'roi', label: 'ROI (%)', backgroundColor: 'rgba(245, 158, 11, 0.5)' }
          ]}
          type="bar"
          height={400}
          loading={loading}
          emptyMessage="No offer data available"
        />

        <ReportTable
          title="Campaign Performance"
          data={offerData}
          columns={[
            { field: 'offer_name', header: 'Campaign', width: '25%' },
            { field: 'type', header: 'Type' },
            { field: 'start_date', header: 'Start Date' },
            { field: 'end_date', header: 'End Date' },
            { field: 'budget', header: 'Budget', render: (value) => 
              safeFormatDollar(value)
            },
            { field: 'revenue_generated', header: 'Revenue', render: (value) => 
              safeFormatDollar(value)
            },
            { field: 'roi', header: 'ROI', render: (value) => (
              <span className={`font-bold ${
                (value || 0) >= 200 ? 'text-green-600' :
                (value || 0) >= 100 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {safeFormatPercent(value || 0)}
              </span>
            )},
            { field: 'conversion_rate', header: 'Conv. Rate', render: (value) => 
              safeFormatPercent(value || 0)
            }
          ]}
          loading={loading}
          emptyMessage="No offer data available"
        />
      </div>
    );
  };

  const renderSummary = () => {
    const summary = marketingReports.promotionalSummary || {};
    const campaignPerformance = safeArray(summary.campaign_performance);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-600">Total Promo Revenue</p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  {safeFormatDollar(summary.total_promo_revenue || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaDollarSign className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-700">
              {safeToLocaleString(summary.promo_orders || 0)} orders
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  ${(summary.avg_promo_order_value || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaChartLine className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-700">
              With promotions
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-purple-600">Customer Acquisition</p>
                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {safeToLocaleString(summary.new_customers_from_promo || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaUsers className="text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-purple-700">
              From promotions
            </p>
          </div>
          
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-orange-600">Promo Lift</p>
                <p className="text-2xl font-bold text-orange-800 mt-1">
                  {safeFormatPercent(summary.promo_lift || 0)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FaPercentage className="text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-orange-700">
              Revenue increase
            </p>
          </div>
        </div>

        {campaignPerformance.length > 0 && (
          <ReportChart
            title="Campaign Performance Over Time"
            data={campaignPerformance}
            xAxisKey="period"
            yAxisKey="revenue"
            datasets={[
              { key: 'revenue', label: 'Revenue', backgroundColor: 'rgba(16, 185, 129, 0.5)' },
              { key: 'orders', label: 'Orders', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
              { key: 'customers', label: 'New Customers', backgroundColor: 'rgba(139, 92, 246, 0.5)' }
            ]}
            type="line"
            height={350}
            loading={loading}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Promotion Effectiveness</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Best Performing Channel</p>
                <p className="text-xl font-bold text-gray-800">
                  {summary.best_channel || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Effective Offer Type</p>
                <p className="text-xl font-bold text-gray-800">
                  {summary.most_effective_offer || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Retention Rate</p>
                <p className="text-xl font-bold text-green-600">
                  {safeFormatPercent(summary.promo_customer_retention || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Marketing Spend</span>
                <span className="font-bold text-gray-800">
                  {safeFormatDollar(summary.total_marketing_spend || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost per Acquisition</span>
                <span className="font-bold text-gray-800">
                  ${(summary.cost_per_acquisition || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall ROI</span>
                <span className={`font-bold ${
                  (summary.overall_roi || 0) >= 200 ? 'text-green-600' :
                  (summary.overall_roi || 0) >= 100 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {safeFormatPercent(summary.overall_roi || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'coupons':
        return renderCoupons();
      case 'offers':
        return renderOffers();
      case 'summary':
        return renderSummary();
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
          <h2 className="text-2xl font-bold text-gray-800">Marketing Reports</h2>
          <p className="text-gray-600">Analyze marketing campaigns and promotions</p>
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
        filters={marketingFilters}
        onFilterChange={setFilters}
        onApply={() => console.log('Marketing filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Content */}
      {loading && !marketingReports[activeTab] ? (
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
                marketingReports[activeTab] ? 'text-green-600' : 'text-red-600'
              }`}>{marketingReports[activeTab] ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingDashboard;