import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import FilterPanel from '../Common/FilterPanel';
import ExportControls from '../Common/ExportControls';
import { 
  FaBox, 
  FaChartBar, 
  FaStar, 
  FaDollarSign,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';
import {
  safeFormatDollar,
  safeToLocaleString,
  safeFormatPercent,
  safeFormatRating,
  safeArray
} from '../../../../utils/safeRender';

const ProductReportsView = () => {
  const {
    productReports,
    loading,
    error: contextError,
    getProductPerformance,
    getTopSellingProducts,
    getProductConversionRate,
    getProductRatingDistribution,
    getAllProductsReport,
    getProductSalesSummary,
    getProductReviewsReport,
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
    
    const loadProductData = async () => {
      if (!isMounted) return;
      
      try {
        setDataLoadError(null);
        const formattedStartDate = formatDateForAPI(localDateRange.startDate);
        const formattedEndDate = formatDateForAPI(localDateRange.endDate);

        console.log('Loading product data for:', {
          tab: activeTab,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        switch (activeTab) {
          case 'performance':
            await getProductPerformance(formattedStartDate, formattedEndDate);
            break;
          case 'top':
            await getTopSellingProducts(formattedStartDate, formattedEndDate, 10);
            break;
          case 'conversion':
            await getProductConversionRate(formattedStartDate, formattedEndDate);
            break;
          case 'ratings':
            await getProductRatingDistribution();
            break;
          case 'all':
            await getAllProductsReport();
            break;
          case 'reviews':
            await getProductReviewsReport();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`Product ${activeTab} load error:`, error);
        if (isMounted) {
          setDataLoadError(`Failed to load ${activeTab} data: ${error.message || 'Unknown error'}`);
        }
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, localDateRange, getProductPerformance, getTopSellingProducts, getProductConversionRate, getProductRatingDistribution, getAllProductsReport, getProductReviewsReport]);

  const tabs = [
    { id: 'performance', label: 'Performance', icon: <FaChartBar /> },
    { id: 'top', label: 'Top Sellers', icon: <FaSortAmountUp /> },
    { id: 'conversion', label: 'Conversion', icon: <FaDollarSign /> },
    { id: 'ratings', label: 'Ratings', icon: <FaStar /> },
    { id: 'all', label: 'All Products', icon: <FaBox /> },
    { id: 'reviews', label: 'Reviews', icon: <FaStar /> }
  ];

  const productFilters = [
    { key: 'category', label: 'Category', type: 'select', options: [] },
    { key: 'brand', label: 'Brand', type: 'select', options: [] },
    { key: 'minPrice', label: 'Min Price', type: 'number', placeholder: '0' },
    { key: 'maxPrice', label: 'Max Price', type: 'number', placeholder: '1000' }
  ];

  const performanceColumns = [
    { field: 'product_name', header: 'Product', width: '30%' },
    { field: 'sales', header: 'Sales', 
      render: (value) => safeFormatDollar(value || 0, '$0') 
    },
    { field: 'units_sold', header: 'Units Sold', 
      render: (value) => safeToLocaleString(value || 0) 
    },
    { field: 'views', header: 'Views', 
      render: (value) => safeToLocaleString(value || 0) 
    },
    { field: 'conversion_rate', header: 'Conversion', 
      render: (value) => safeFormatPercent(value || 0, 1) 
    },
    { field: 'avg_rating', header: 'Rating', render: (value) => (
      <div className="flex items-center">
        <span className="text-yellow-500 mr-1">★</span>
        {safeFormatRating(value || 0)}
      </div>
    )}
  ];

  const topProductsColumns = [
    { field: 'product_name', header: 'Product', width: '25%' },
    { field: 'category', header: 'Category' },
    { field: 'units_sold', header: 'Units Sold', 
      render: (value) => safeToLocaleString(value || 0) 
    },
    { field: 'revenue', header: 'Revenue', 
      render: (value) => safeFormatDollar(value || 0, '$0') 
    },
    { field: 'growth', header: 'Growth', render: (value) => (
      <span className={value >= 0 ? 'text-green-600' : 'text-red-600'}>
        {value >= 0 ? '+' : ''}{safeFormatPercent(value || 0, 1)}
      </span>
    )}
  ];

  const allProductsColumns = [
    { field: 'product_name', header: 'Product', width: '25%' },
    { field: 'category', header: 'Category' },
    { field: 'brand', header: 'Brand' },
    { field: 'price', header: 'Price', render: (value) => safeFormatDollar(value || 0) },
    { field: 'stock', header: 'Stock', render: (value) => (
      <span className={value < 10 ? 'text-red-600 font-medium' : 'text-gray-700'}>
        {safeToLocaleString(value || 0)}
      </span>
    )},
    { field: 'status', header: 'Status', render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'active' ? 'bg-green-100 text-green-800' :
        value === 'inactive' ? 'bg-gray-100 text-gray-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {value || 'unknown'}
      </span>
    )}
  ];

  const handleExport = async (format) => {
    // Map dashboard tabs to actual report types
    const reportTypeMap = {
      performance: 'product',
      top: 'product',
      conversion: 'product',
      ratings: 'product',
      all: 'product',
      reviews: 'product'
    };

    const reportType = reportTypeMap[activeTab] || 'product';

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
    const performanceData = safeArray(productReports.performance);
    const conversionData = safeArray(productReports.conversionRate);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportChart
            title="Sales Distribution"
            data={performanceData.slice(0, 8)}
            xAxisKey="product_name"
            yAxisKey="sales"
            type="bar"
            height={300}
            loading={loading}
            emptyMessage="No performance data available"
          />
          <ReportChart
            title="Conversion Rate"
            data={conversionData}
            xAxisKey="product_name"
            yAxisKey="conversion_rate"
            type="line"
            height={300}
            loading={loading}
            emptyMessage="No conversion data available"
          />
        </div>
        <ReportTable
          title="Product Performance"
          data={performanceData}
          columns={performanceColumns}
          loading={loading}
          emptyMessage="No performance data available"
        />
      </div>
    );
  };

  const renderTop = () => {
    const topSellingData = safeArray(productReports.topSelling);

    return (
      <div className="space-y-6">
        <ReportChart
          title="Top Selling Products"
          data={topSellingData}
          xAxisKey="product_name"
          yAxisKey="revenue"
          type="bar"
          height={350}
          loading={loading}
          emptyMessage="No top selling products data"
        />
        <ReportTable
          title="Top 10 Selling Products"
          data={topSellingData}
          columns={topProductsColumns}
          loading={loading}
          emptyMessage="No top selling products data"
        />
      </div>
    );
  };

  const renderConversion = () => {
    const conversionData = safeArray(productReports.conversionRate);
    
    const avgConversion = conversionData.length > 0 
      ? conversionData.reduce((sum, item) => sum + (item.conversion_rate || 0), 0) / conversionData.length
      : 0;
    
    const lowConversionCount = conversionData.filter(item => (item.conversion_rate || 0) < 5).length;
    const bestProduct = conversionData[0]?.product_name || 'N/A';

    return (
      <div className="space-y-6">
        <ReportChart
          title="Conversion Rates"
          data={conversionData}
          xAxisKey="product_name"
          yAxisKey="conversion_rate"
          type="bar"
          height={350}
          loading={loading}
          emptyMessage="No conversion data available"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h4 className="text-sm font-medium text-blue-700 mb-2">Avg. Conversion</h4>
            <p className="text-2xl font-bold text-blue-800">
              {safeFormatPercent(avgConversion, 1)}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <h4 className="text-sm font-medium text-green-700 mb-2">Best Product</h4>
            <p className="text-xl font-bold text-green-800 truncate">
              {bestProduct}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-6">
            <h4 className="text-sm font-medium text-orange-700 mb-2">Improvement Needed</h4>
            <p className="text-2xl font-bold text-orange-800">
              {safeToLocaleString(lowConversionCount)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderRatings = () => {
    const ratingData = safeArray(productReports.ratingDistribution);
    const totalProducts = ratingData.reduce((sum, item) => sum + (item.count || 0), 0);

    return (
      <div className="space-y-6">
        <ReportChart
          title="Rating Distribution"
          data={ratingData}
          xAxisKey="rating"
          yAxisKey="count"
          type="pie"
          height={350}
          loading={loading}
          emptyMessage="No rating data available"
        />
        <ReportTable
          title="Product Ratings"
          data={ratingData}
          columns={[
            { field: 'rating', header: 'Rating', render: (value) => (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < (value || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
            )},
            { field: 'count', header: 'Number of Products', render: (value) => safeToLocaleString(value || 0) },
            { 
              field: 'percentage', 
              header: 'Percentage', 
              render: (value, row) => {
                const percentage = totalProducts > 0 ? ((row.count || 0) / totalProducts * 100).toFixed(1) : 0;
                return `${percentage}%`;
              }
            }
          ]}
          loading={loading}
          emptyMessage="No rating data available"
        />
      </div>
    );
  };

  const renderAll = () => {
    return (
      <ReportTable
        title="All Products"
        data={safeArray(productReports.allProducts)}
        columns={allProductsColumns}
        loading={loading}
        emptyMessage="No product data available"
      />
    );
  };

  const renderReviews = () => {
    return (
      <ReportTable
        title="Product Reviews"
        data={safeArray(productReports.reviews)}
        columns={[
          { field: 'product_name', header: 'Product', width: '25%' },
          { field: 'customer_name', header: 'Customer' },
          { field: 'rating', header: 'Rating', render: (value) => (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              {safeFormatRating(value || 0)}
            </div>
          )},
          { field: 'review', header: 'Review', width: '40%' },
          { field: 'date', header: 'Date' }
        ]}
        loading={loading}
        emptyMessage="No review data available"
      />
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return renderPerformance();
      case 'top':
        return renderTop();
      case 'conversion':
        return renderConversion();
      case 'ratings':
        return renderRatings();
      case 'all':
        return renderAll();
      case 'reviews':
        return renderReviews();
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
          <h2 className="text-2xl font-bold text-gray-800">Product Reports</h2>
          <p className="text-gray-600">Analyze product performance and metrics</p>
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
        filters={productFilters}
        onFilterChange={setFilters}
        showDateRange={false}
        onApply={() => console.log('Filters applied:', filters)}
        onReset={() => setFilters({})}
        loading={loading}
      />

      {/* Content */}
      {loading && !productReports[activeTab] ? (
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
                productReports[activeTab] ? 'text-green-600' : 'text-red-600'
              }`}>{productReports[activeTab] ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReportsView;