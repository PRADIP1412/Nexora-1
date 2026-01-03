import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import LoadingState, { SkeletonLoader } from '../Common/LoadingState';
import EmptyState from '../Common/EmptyState';
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaUsers, 
  FaBox, 
  FaTruck, 
  FaTag,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const ReportsDashboard = ({ dateRange }) => {
  const {
    productReports,
    salesReports,
    customerReports,
    loading,
    getProductPerformance,
    getTotalSalesReport,
    getActiveUserCount,
    getDailySalesTrend,
    getSalesByCategory,
    getTopSellingProducts
  } = useReportsContext();

  const [dashboardData, setDashboardData] = useState({
    salesTrend: [],
    topProducts: [],
    salesByCategory: [],
    metrics: {
      totalSales: 0,
      activeUsers: 0,
      totalOrders: 0,
      conversionRate: 0
    }
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Load all dashboard data
        const [
          salesResult,
          usersResult,
          trendResult,
          categoryResult,
          productsResult,
          performanceResult
        ] = await Promise.allSettled([
          getTotalSalesReport(dateRange.startDate, dateRange.endDate),
          getActiveUserCount(dateRange.startDate, dateRange.endDate),
          getDailySalesTrend(dateRange.startDate, dateRange.endDate),
          getSalesByCategory(dateRange.startDate, dateRange.endDate),
          getTopSellingProducts(dateRange.startDate, dateRange.endDate, 5),
          getProductPerformance(dateRange.startDate, dateRange.endDate)
        ]);

        // Process results
        const newData = {
          salesTrend: trendResult.status === 'fulfilled' && trendResult.value.success 
            ? trendResult.value.data || []
            : [],
          topProducts: productsResult.status === 'fulfilled' && productsResult.value.success
            ? productsResult.value.data || []
            : [],
          salesByCategory: categoryResult.status === 'fulfilled' && categoryResult.value.success
            ? categoryResult.value.data || []
            : [],
          metrics: {
            totalSales: salesResult.status === 'fulfilled' && salesResult.value.success
              ? salesResult.value.data?.total_amount || 0
              : 0,
            activeUsers: usersResult.status === 'fulfilled' && usersResult.value.success
              ? usersResult.value.data?.active_users || 0
              : 0,
            totalOrders: salesResult.status === 'fulfilled' && salesResult.value.success
              ? salesResult.value.data?.total_orders || 0
              : 0,
            conversionRate: performanceResult.status === 'fulfilled' && performanceResult.value.success
              ? performanceResult.value.data?.conversion_rate || 0
              : 0
          }
        };

        setDashboardData(newData);
      } catch (error) {
        console.error('Dashboard load error:', error);
      }
    };

    loadDashboard();
  }, [dateRange, getTotalSalesReport, getActiveUserCount, getDailySalesTrend, getSalesByCategory, getTopSellingProducts, getProductPerformance]);

  const metrics = [
    {
      title: 'Total Sales',
      value: `$${dashboardData.metrics.totalSales.toLocaleString()}`,
      icon: <FaDollarSign className="text-green-600" />,
      change: '+12.5%',
      trend: 'up',
      color: 'bg-green-50 border-green-100'
    },
    {
      title: 'Active Users',
      value: dashboardData.metrics.activeUsers.toLocaleString(),
      icon: <FaUsers className="text-blue-600" />,
      change: '+8.2%',
      trend: 'up',
      color: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Total Orders',
      value: dashboardData.metrics.totalOrders.toLocaleString(),
      icon: <FaShoppingCart className="text-purple-600" />,
      change: '+5.7%',
      trend: 'up',
      color: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Conversion Rate',
      value: `${dashboardData.metrics.conversionRate}%`,
      icon: <FaChartLine className="text-orange-600" />,
      change: '+2.1%',
      trend: 'up',
      color: 'bg-orange-50 border-orange-100'
    }
  ];

  const topProductsColumns = [
    { field: 'product_name', header: 'Product', width: '40%' },
    { field: 'category', header: 'Category' },
    { field: 'units_sold', header: 'Units Sold', render: (value) => value.toLocaleString() },
    { field: 'revenue', header: 'Revenue', render: (value) => `$${value.toLocaleString()}` },
    { field: 'growth', header: 'Growth', render: (value) => (
      <span className={`inline-flex items-center ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
        {Math.abs(value)}%
      </span>
    )}
  ];

  if (loading) {
    return <SkeletonLoader type="grid" count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`rounded-xl border p-6 ${metric.color}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                {metric.icon}
              </div>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {metric.change}
              </span>
              <span className="text-gray-500 text-sm ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <ReportChart
          title="Sales Trend"
          data={dashboardData.salesTrend}
          xAxisKey="date"
          yAxisKey="amount"
          height={300}
          loading={loading}
          error={dashboardData.salesTrend.length === 0 ? 'No trend data available' : null}
        />

        {/* Sales by Category Chart */}
        <ReportChart
          title="Sales by Category"
          data={dashboardData.salesByCategory}
          xAxisKey="category"
          yAxisKey="sales"
          type="doughnut"
          height={300}
          loading={loading}
          error={dashboardData.salesByCategory.length === 0 ? 'No category data available' : null}
        />
      </div>

      {/* Top Products Table */}
      <ReportTable
        title="Top Selling Products"
        data={dashboardData.topProducts}
        columns={topProductsColumns}
        loading={loading}
        emptyMessage="No product data available"
        showPagination={false}
      />
    </div>
  );
};

export default ReportsDashboard;