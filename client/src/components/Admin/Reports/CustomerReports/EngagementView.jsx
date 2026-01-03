import React, { useState, useEffect } from 'react';
import { useReportsContext } from '../../../../context/ReportsContext';
import ReportChart from '../Common/ReportChart';
import ReportTable from '../Common/ReportTable';
import { FaUsers, FaEye, FaShoppingCart, FaClock, FaChartLine } from 'react-icons/fa';

const EngagementView = ({ dateRange }) => {
  const {
    customerReports,
    loading,
    getUserEngagementReport
  } = useReportsContext();

  const [metrics, setMetrics] = useState({
    totalVisitors: 0,
    avgSessionDuration: 0,
    conversionRate: 0,
    bounceRate: 0,
    pageViews: 0
  });

  useEffect(() => {
    loadEngagementData();
  }, [dateRange]);

  const loadEngagementData = async () => {
    await getUserEngagementReport(dateRange.startDate, dateRange.endDate);
  };

  useEffect(() => {
    const engagementData = customerReports.engagement || [];
    if (engagementData.length > 0) {
      const totalVisitors = engagementData.reduce((sum, day) => sum + (day.visitors || 0), 0);
      const totalPageViews = engagementData.reduce((sum, day) => sum + (day.page_views || 0), 0);
      const totalConversions = engagementData.reduce((sum, day) => sum + (day.conversions || 0), 0);
      const totalSessions = engagementData.reduce((sum, day) => sum + (day.sessions || 0), 0);
      const totalDuration = engagementData.reduce((sum, day) => sum + (day.avg_session_duration || 0), 0);

      setMetrics({
        totalVisitors,
        avgSessionDuration: engagementData.length > 0 ? totalDuration / engagementData.length : 0,
        conversionRate: totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0,
        bounceRate: totalSessions > 0 ? (engagementData.reduce((sum, day) => sum + (day.bounce_rate || 0), 0) / engagementData.length) : 0,
        pageViews: totalPageViews
      });
    }
  }, [customerReports.engagement]);

  const engagementMetrics = [
    {
      title: 'Total Visitors',
      value: metrics.totalVisitors.toLocaleString(),
      icon: <FaUsers className="text-blue-600" />,
      change: '+12.5%',
      color: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Avg. Session',
      value: `${Math.round(metrics.avgSessionDuration)}m`,
      icon: <FaClock className="text-green-600" />,
      change: '+2.1m',
      color: 'bg-green-50 border-green-100'
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: <FaShoppingCart className="text-purple-600" />,
      change: '+0.8%',
      color: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Page Views',
      value: metrics.pageViews.toLocaleString(),
      icon: <FaEye className="text-orange-600" />,
      change: '+15.3%',
      color: 'bg-orange-50 border-orange-100'
    }
  ];

  const engagementColumns = [
    { field: 'date', header: 'Date' },
    { field: 'visitors', header: 'Visitors', render: (value) => value.toLocaleString() },
    { field: 'page_views', header: 'Page Views', render: (value) => value.toLocaleString() },
    { field: 'avg_session_duration', header: 'Avg Session', render: (value) => `${Math.round(value)}m` },
    { field: 'conversions', header: 'Conversions', render: (value) => value.toLocaleString() },
    { field: 'conversion_rate', header: 'Conversion Rate', render: (value) => `${value}%` },
    { field: 'bounce_rate', header: 'Bounce Rate', render: (value) => `${value}%` }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Engagement</h2>
          <p className="text-gray-600">Track customer interactions and behavior</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {engagementMetrics.map((metric, index) => (
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
              <span className="text-sm text-green-600 font-medium">
                {metric.change}
              </span>
              <span className="text-gray-500 text-sm ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Visitor Trends"
          data={customerReports.engagement || []}
          xAxisKey="date"
          yAxisKey="visitors"
          datasets={[
            { key: 'visitors', label: 'Visitors', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
            { key: 'conversions', label: 'Conversions', backgroundColor: 'rgba(16, 185, 129, 0.5)' }
          ]}
          type="line"
          height={350}
          loading={loading}
        />
        
        <ReportChart
          title="Engagement Metrics"
          data={customerReports.engagement?.slice(-7) || []}
          xAxisKey="date"
          yAxisKey="avg_session_duration"
          datasets={[
            { key: 'avg_session_duration', label: 'Session Duration (min)', backgroundColor: 'rgba(245, 158, 11, 0.5)' },
            { key: 'conversion_rate', label: 'Conversion Rate (%)', backgroundColor: 'rgba(139, 92, 246, 0.5)' },
            { key: 'bounce_rate', label: 'Bounce Rate (%)', backgroundColor: 'rgba(239, 68, 68, 0.5)' }
          ]}
          type="bar"
          height={350}
          loading={loading}
        />
      </div>

      {/* Detailed Table */}
      <ReportTable
        title="Daily Engagement Metrics"
        data={customerReports.engagement || []}
        columns={engagementColumns}
        loading={loading}
        emptyMessage="No engagement data available"
      />
    </div>
  );
};

export default EngagementView;