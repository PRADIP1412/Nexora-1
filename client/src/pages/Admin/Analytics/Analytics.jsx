import React, { useEffect } from 'react';
import { useAnalyticsContext } from '../../../context/AnalyticsContext';
import DashboardSummary from '../../../components/Admin/Analytics/Dashboard/DashboardSummary';
import SalesOverview from '../../../components/Admin/Analytics/Sales/SalesOverview';
import TopProductsTable from '../../../components/Admin/Analytics/Products/TopProductsTable';
import CustomerInsights from '../../../components/Admin/Analytics/Customers/CustomerInsights';
import InventoryAlerts from '../../../components/Admin/Analytics/Inventory/InventoryAlerts';
import SearchAnalytics from '../../../components/Admin/Analytics/Behavior/SearchAnalytics';
import ActivityLogTable from '../../../components/Admin/Analytics/Activity/ActivityLogTable';
import LoadingSkeleton from '../../../components/Admin/Analytics/Shared/LoadingSkeleton';

const Analytics = () => {
    const { 
        fetchAllAnalyticsData, 
        loading, 
        error, 
        clearError,
        dashboardSummary,
        salesReport,
        topSellingProducts,
        customerInsights,
        inventoryStatus,
        searchAnalytics,
        adminActivityLogs
    } = useAnalyticsContext();

    useEffect(() => {
        fetchAllAnalyticsData();
    }, [fetchAllAnalyticsData]);

    const handleRefresh = () => {
        fetchAllAnalyticsData();
    };

    if (loading && !dashboardSummary) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800 font-medium">{error}</span>
                            </div>
                            <button
                                onClick={clearError}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry Loading Analytics
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-2">
                                Comprehensive insights into your store's performance
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh Data
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Dashboard Summary */}
                {dashboardSummary && (
                    <div className="mb-8">
                        <DashboardSummary data={dashboardSummary} />
                    </div>
                )}

                {/* Analytics Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Sales Overview */}
                        {salesReport && (
                            <SalesOverview data={salesReport} />
                        )}

                        {/* Top Products */}
                        {topSellingProducts.length > 0 && (
                            <TopProductsTable products={topSellingProducts} />
                        )}

                        {/* Inventory Alerts */}
                        {inventoryStatus.length > 0 && (
                            <InventoryAlerts alerts={inventoryStatus} />
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Customer Insights */}
                        {customerInsights && (
                            <CustomerInsights data={customerInsights} />
                        )}

                        {/* Search Analytics */}
                        {searchAnalytics && (
                            <SearchAnalytics data={searchAnalytics} />
                        )}

                        {/* Admin Activity Logs */}
                        {adminActivityLogs.length > 0 && (
                            <ActivityLogTable logs={adminActivityLogs} />
                        )}
                    </div>
                </div>

                {/* Loading indicator for partial updates */}
                {loading && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating analytics...
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;