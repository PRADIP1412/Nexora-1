import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Filter, Calendar, BarChart3 } from 'lucide-react';
import AdminLayout from '../../../components/Admin/Layout/AdminLayout';
import RevenueCard from '../../../components/Admin/Dashboard/StatsCards/RevenueCard';
import OrdersCard from '../../../components/Admin/Dashboard/StatsCards/OrdersCard';
import CustomersCard from '../../../components/Admin/Dashboard/StatsCards/CustomersCard';
import ProductsCard from '../../../components/Admin/Dashboard/StatsCards/ProductsCard';
import SalesChart from '../../../components/Admin/Dashboard/Charts/SalesChart';
import RevenueChart from '../../../components/Admin/Dashboard/Charts/RevenueChart';
import OrdersChart from '../../../components/Admin/Dashboard/Charts/OrdersChart';
import TrafficChart from '../../../components/Admin/Dashboard/Charts/TrafficChart';
import RecentOrders from '../../../components/Admin/Dashboard/Widgets/RecentOrders';
import TopProducts from '../../../components/Admin/Dashboard/Widgets/TopProducts';
import LowStockAlerts from '../../../components/Admin/Dashboard/Widgets/LowStockAlerts';
import SystemAlerts from '../../../components/Admin/Dashboard/Widgets/SystemAlerts';
import { useDashboard } from '../../../context/admin/DashboardContext';
import './Dashboard.css';

const Dashboard = () => {
  const {
    overview,
    salesData,
    revenueData,
    recentOrders,
    topProducts,
    lowStockItems,
    alerts,
    trafficData,
    loading,
    refreshing,
    dateRange,
    revenuePeriod,
    refreshDashboard,
    updateDateRange,
    updateRevenuePeriod
  } = useDashboard();

  const [selectedChart, setSelectedChart] = useState('sales');
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    console.log('Dashboard loaded:', { overview, loading });
  }, [overview, loading]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ['Metric', 'Value', 'Growth %'],
        ['Total Revenue', `$${overview.totalRevenue?.toLocaleString() || '0'}`, `${overview.revenueGrowth || '0'}%`],
        ['Total Orders', overview.totalOrders?.toLocaleString() || '0', `${overview.ordersGrowth || '0'}%`],
        ['Total Customers', overview.totalCustomers?.toLocaleString() || '0', `${overview.customersGrowth || '0'}%`],
        ['Total Products', overview.totalProducts?.toLocaleString() || '0', `${overview.productsGrowth || '0'}%`],
        ['', '', ''],
        ['Date Range', dateRange, ''],
        ['Revenue Period', `${revenuePeriod} days`, '']
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month', default: true },
    { value: 'year', label: 'This Year' }
  ];

  const revenuePeriods = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days', default: true },
    { value: 90, label: 'Last 90 days' },
    { value: 365, label: 'Last year' }
  ];

  const chartTypes = [
    { value: 'sales', label: 'Sales Overview', icon: BarChart3 },
    { value: 'revenue', label: 'Revenue Trend', icon: BarChart3 },
    { value: 'orders', label: 'Order Trends', icon: BarChart3 },
    { value: 'traffic', label: 'Traffic Sources', icon: BarChart3 }
  ];

  const quickStats = [
    { label: 'Conversion Rate', value: '3.2%', trend: '+0.4%', positive: true },
    { label: 'Avg. Order Value', value: '$89.99', trend: '+$5.20', positive: true },
    { label: 'Return Rate', value: '2.1%', trend: '-0.3%', positive: false },
    { label: 'Customer Satisfaction', value: '4.8/5', trend: '+0.2', positive: true }
  ];

  return (
    <AdminLayout>
      <div className="dashboard-page">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Dashboard Overview</h1>
            <p className="dashboard-subtitle">
              Welcome back! Here's what's happening with your store today.
              {loading && <span className="loading-indicator">Loading...</span>}
            </p>
          </div>

          <div className="header-right">
            <div className="filters-container">
              <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} />
                <span>Filters</span>
                {showFilters && <div className="active-indicator"></div>}
              </button>

              {showFilters && (
                <div className="filters-dropdown">
                  <div className="filter-section">
                    <h4 className="filter-section-title">
                      <Calendar size={16} />
                      Time Range
                    </h4>
                    <div className="filter-options">
                      {timeRanges.map(range => (
                        <button
                          key={range.value}
                          className={`filter-option ${dateRange === range.value ? 'active' : ''}`}
                          onClick={() => updateDateRange(range.value)}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="filter-section">
                    <h4 className="filter-section-title">Revenue Period</h4>
                    <select 
                      value={revenuePeriod} 
                      onChange={(e) => updateRevenuePeriod(parseInt(e.target.value))}
                      className="filter-select"
                    >
                      {revenuePeriods.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-section">
                    <h4 className="filter-section-title">Chart Type</h4>
                    <div className="chart-type-selector">
                      {chartTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            className={`chart-type-btn ${selectedChart === type.value ? 'active' : ''}`}
                            onClick={() => setSelectedChart(type.value)}
                          >
                            <Icon size={16} />
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="refresh-btn" 
              onClick={refreshDashboard} 
              disabled={refreshing || loading}
            >
              <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button 
              className="export-btn" 
              onClick={handleExport}
              disabled={exportLoading || loading}
            >
              <Download size={18} />
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <RevenueCard 
            revenue={overview.totalRevenue} 
            growth={overview.revenueGrowth} 
            isLoading={loading} 
          />
          <OrdersCard 
            orders={overview.totalOrders} 
            growth={overview.ordersGrowth} 
            isLoading={loading} 
          />
          <CustomersCard 
            customers={overview.totalCustomers} 
            growth={overview.customersGrowth} 
            isLoading={loading} 
          />
          <ProductsCard 
            products={overview.totalProducts} 
            growth={overview.productsGrowth} 
            isLoading={loading} 
          />
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Left Column - Main Chart */}
          <div className="left-column">
            <div className="chart-section">
              {selectedChart === 'sales' && (
                <SalesChart data={salesData} height={400} isLoading={loading} />
              )}
              {selectedChart === 'revenue' && (
                <RevenueChart data={revenueData} height={400} isLoading={loading} />
              )}
              {selectedChart === 'orders' && (
                <OrdersChart data={salesData} height={400} isLoading={loading} />
              )}
              {selectedChart === 'traffic' && (
                <TrafficChart data={trafficData} height={400} isLoading={loading} />
              )}
            </div>

            {/* Recent Orders Widget */}
            <div className="widget-section">
              <RecentOrders orders={recentOrders} isLoading={loading} />
            </div>
          </div>

          {/* Right Column - Side Widgets */}
          <div className="right-column">
            <div className="widget-section">
              <TopProducts products={topProducts} isLoading={loading} />
            </div>
            <div className="widget-section">
              <LowStockAlerts alerts={lowStockItems} isLoading={loading} />
            </div>
            <div className="widget-section">
              <SystemAlerts alerts={alerts} isLoading={loading} />
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="quick-stats-section">
          <h3 className="section-title">Quick Stats</h3>
          <div className="quick-stats-grid">
            {quickStats.map((stat, index) => (
              <div className="quick-stat-card" key={index}>
                <div className="quick-stat-header">
                  <span className="quick-stat-label">{stat.label}</span>
                  <span className={`quick-stat-trend ${stat.positive ? 'positive' : 'negative'}`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="quick-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;