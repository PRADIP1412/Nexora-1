import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../context/ReportsContext';
import ErrorBoundary from '../../../components/Admin/Reports/ErrorBoundary';

// Dashboard Components
import ReportsDashboard from '../../../components/Admin/Reports/Dashboard/ReportsDashboard';
import ReportCategoryCard from '../../../components/Admin/Reports/Dashboard/ReportCategoryCard';
import QuickStatsPanel from '../../../components/Admin/Reports/Dashboard/QuickStatsPanel';
import DateRangeSelector from '../../../components/Admin/Reports/Dashboard/DateRangeSelector';

// Product Reports
import ProductReportsView from '../../../components/Admin/Reports/ProductReports/ProductReportsView';
import StockAlertsWidget from '../../../components/Admin/Reports/ProductReports/StockAlertsWidget';

// Sales Reports
import SalesDashboard from '../../../components/Admin/Reports/SalesReports/SalesDashboard';
import SalesCharts from '../../../components/Admin/Reports/SalesReports/SalesCharts';
import OrdersView from '../../../components/Admin/Reports/SalesReports/OrdersView';

// Customer Reports
import CustomerDashboard from '../../../components/Admin/Reports/CustomerReports/CustomerDashboard';
import EngagementView from '../../../components/Admin/Reports/CustomerReports/EngagementView';
import CustomersView from '../../../components/Admin/Reports/CustomerReports/CustomersView';

// Inventory Reports
import InventoryDashboard from '../../../components/Admin/Reports/InventoryReports/InventoryDashboard';
import StockView from '../../../components/Admin/Reports/InventoryReports/StockView';

// Delivery Reports
import DeliveryDashboard from '../../../components/Admin/Reports/DeliveryReports/DeliveryDashboard';

// Marketing Reports
import MarketingDashboard from '../../../components/Admin/Reports/MarketingReports/MarketingDashboard';

// Common Components
import LoadingState from '../../../components/Admin/Reports/Common/LoadingState';
import EmptyState from '../../../components/Admin/Reports/Common/EmptyState';

const Reports = () => {
  const { loading, error, getReportsSummary, clearError } = useReportsContext();
  const [selectedCategory, setSelectedCategory] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });

  useEffect(() => {
    // Load initial summary data
    getReportsSummary();
  }, [getReportsSummary]);

  const handleDateChange = (start, end) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const categories = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Overview of all metrics' },
    { id: 'products', label: 'Products', icon: '📦', description: 'Product analytics' },
    { id: 'sales', label: 'Sales', icon: '💰', description: 'Sales performance' },
    { id: 'customers', label: 'Customers', icon: '👥', description: 'Customer insights' },
    { id: 'inventory', label: 'Inventory', icon: '📋', description: 'Stock management' },
    { id: 'delivery', label: 'Delivery', icon: '🚚', description: 'Delivery tracking' },
    { id: 'marketing', label: 'Marketing', icon: '📢', description: 'Campaign analytics' },
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    clearError();
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <QuickStatsPanel dateRange={dateRange} />
            <ReportsDashboard dateRange={dateRange} />
          </div>
        );
      
      case 'products':
        return (
          <div className="space-y-6">
            <StockAlertsWidget threshold={10} autoRefresh={true} />
            <ProductReportsView dateRange={dateRange} />
          </div>
        );
      
      case 'sales':
        return (
          <div className="space-y-6">
            <SalesDashboard dateRange={dateRange} />
          </div>
        );
      
      case 'customers':
        return (
          <div className="space-y-6">
            <CustomerDashboard dateRange={dateRange} />
          </div>
        );
      
      case 'inventory':
        return (
          <div className="space-y-6">
            <InventoryDashboard dateRange={dateRange} />
          </div>
        );
      
      case 'delivery':
        return (
          <div className="space-y-6">
            <DeliveryDashboard dateRange={dateRange} />
          </div>
        );
      
      case 'marketing':
        return (
          <div className="space-y-6">
            <MarketingDashboard dateRange={dateRange} />
          </div>
        );
      
      default:
        return <EmptyState title="Select a category" message="Choose a report category from above" />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive business intelligence and reporting</p>
          </div>
          <DateRangeSelector
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={handleDateChange}
            className="w-full md:w-auto"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-500 mr-3">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-red-800">Error Loading Data</p>
                <p className="text-red-700 text-sm">{typeof error === 'string' ? error : 'An error occurred'}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 px-3 py-1 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Category Navigation */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => (
              <ReportCategoryCard
                key={category.id}
                icon={category.icon}
                label={category.label}
                description={category.description}
                isActive={selectedCategory === category.id}
                onClick={() => handleCategorySelect(category.id)}
              />
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && selectedCategory === 'dashboard' ? (
          <LoadingState message="Loading dashboard data..." size="lg" />
        ) : (
          <div className="transition-opacity duration-300">
            {renderCategoryContent()}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Reports are updated in real-time. Last updated: {new Date().toLocaleTimeString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data ranges from {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Reports;