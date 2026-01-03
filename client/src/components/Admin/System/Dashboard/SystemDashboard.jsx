import React, { useEffect, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import QuickMetricsGrid from './QuickMetricsGrid';
import RecentActivityFeed from './RecentActivityFeed';
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { FaUserCheck, FaServer, FaBell, FaChartLine } from 'react-icons/fa';

const SystemDashboard = () => {
  const {
    fetchAllSystemData,
    dashboard,
    userAccess,
    sessions,
    systemHealth,
    notifications,
    loading,
    error,
    clearError
  } = useSystemContext();

  const handleRefresh = useCallback(() => {
    fetchAllSystemData();
  }, [fetchAllSystemData]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (loading && !dashboard && !userAccess.activeUsersCount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button onClick={clearError} className="text-red-600 hover:text-red-800">
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and analytics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Quick Metrics */}
      <QuickMetricsGrid />

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              systemHealth?.healthStatus?.overall_status === 'HEALTHY' 
                ? 'bg-green-100 text-green-800' 
                : systemHealth?.healthStatus?.overall_status === 'DEGRADED'
                ? 'bg-yellow-100 text-yellow-800'
                : systemHealth?.healthStatus?.overall_status === 'UNHEALTHY'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {systemHealth?.healthStatus?.overall_status || 'LOADING'}
            </div>
          </div>
          
          {systemHealth?.healthStatus?.components && (
            <div className="space-y-3">
              {Object.entries(systemHealth.healthStatus.components).map(([component, status]) => (
                <div key={component} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{component.replace('_', ' ')}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    status === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                    status === 'DEGRADED' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'UNHEALTHY' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaUserCheck className="text-blue-600 text-2xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {userAccess.activeUsersCount?.active_users || userAccess.activeUsersCount?.count || 0}
              </div>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <FaServer className="text-green-600 text-2xl" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {Array.isArray(sessions.activeSessions) ? sessions.activeSessions.length : 0}
              </div>
              <p className="text-sm text-gray-600">Active Sessions</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unread Notifications</span>
              <span className="text-2xl font-bold text-gray-800">
                {notifications.unreadCount?.count || notifications.unreadCount?.unread_count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Delivery Rate</span>
              <span className="text-2xl font-bold text-gray-800">
                {notifications.deliverySummary?.success_rate 
                  ? `${Math.round(notifications.deliverySummary.success_rate)}%`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Response Time</span>
              <span className="text-lg font-bold text-gray-800">
                {systemHealth?.apiUsageOverview?.avg_response_time 
                  ? `${systemHealth.apiUsageOverview.avg_response_time}ms`
                  : systemHealth?.apiUsageOverview?.average_response_time
                  ? `${systemHealth.apiUsageOverview.average_response_time}ms`
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Request Count</span>
              <span className="text-lg font-bold text-gray-800">
                {systemHealth?.apiUsageOverview?.total_requests || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <RecentActivityFeed />
    </div>
  );
};

export default SystemDashboard;