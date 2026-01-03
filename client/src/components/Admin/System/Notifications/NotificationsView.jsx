import React, { useEffect, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { 
  FiBell, 
  FiCheckCircle, 
  FiXCircle, 
  FiSend,
  FiRefreshCw,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const NotificationsView = () => {
  const {
    fetchNotificationDeliverySummary,
    fetchUnreadNotificationsCount,
    notifications,
    loading,
    error,
    clearError
  } = useSystemContext();

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchNotificationDeliverySummary(),
        fetchUnreadNotificationsCount()
      ]);
    } catch (err) {
      console.error('Error loading notification data:', err);
    }
  }, [fetchNotificationDeliverySummary, fetchUnreadNotificationsCount]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = notifications.deliverySummary;
  const unreadCount = notifications.unreadCount;

  const getStatusIcon = (status) => {
    if (!status) return <FiBell className="text-gray-500" />;
    
    switch(status.toLowerCase()) {
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      case 'failed': return <FiXCircle className="text-red-500" />;
      case 'pending': return <FiSend className="text-yellow-500" />;
      default: return <FiBell className="text-gray-500" />;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <FiTrendingUp className="text-green-500" />;
    if (trend < 0) return <FiTrendingDown className="text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">Monitor notification delivery and status</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiXCircle className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Unread Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FiBell className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Unread</h3>
              <p className="text-sm text-gray-600">Require attention</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {unreadCount?.count || unreadCount?.unread_count || 0}
          </div>
          {unreadCount?.trend !== undefined && (
            <div className={`text-sm flex items-center ${
              unreadCount.trend > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {getTrendIcon(unreadCount.trend)}
              <span className="ml-1">
                {unreadCount.trend > 0 ? '+' : ''}{unreadCount.trend}%
              </span>
            </div>
          )}
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FiCheckCircle className="text-green-600 text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Success Rate</h3>
              <p className="text-sm text-gray-600">Delivery success</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {summary?.success_rate 
              ? `${Math.round(summary.success_rate)}%`
              : 'N/A'
            }
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500"
              style={{ width: `${summary?.success_rate || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Total Sent */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <FiSend className="text-purple-600 text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Total Sent</h3>
              <p className="text-sm text-gray-600">Last 7 days</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {(summary?.total_sent || 0).toLocaleString()}
          </div>
        </div>

        {/* Avg Delivery Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <FiBarChart2 className="text-orange-600 text-2xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Avg. Delivery</h3>
              <p className="text-sm text-gray-600">Time to deliver</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {summary?.avg_delivery_time 
              ? `${summary.avg_delivery_time}s`
              : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Status Breakdown */}
          {summary.delivery_breakdown && summary.delivery_breakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Status</h3>
              <div className="space-y-4">
                {summary.delivery_breakdown.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(status.status)}
                      <span className="ml-3 font-medium text-gray-700 capitalize">
                        {status.status || 'unknown'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">
                        {(status.count || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {summary.total_sent ? Math.round((status.count / summary.total_sent) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Channel Performance */}
          {summary.channel_performance && summary.channel_performance.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Channel Performance</h3>
              <div className="space-y-4">
                {summary.channel_performance.map((channel, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 capitalize">
                        {channel.channel || 'unknown'}
                      </span>
                      <span className="text-gray-800">
                        {channel.success_rate ? `${Math.round(channel.success_rate)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${channel.success_rate || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Sent: {(channel.sent || 0).toLocaleString()}</span>
                      <span>Delivered: {(channel.delivered || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Notifications */}
      {summary?.recent_notifications && summary.recent_notifications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Notifications</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.recent_notifications.slice(0, 10).map((notification, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(notification.status)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium text-gray-900">
                        {notification.title || 'Notification'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {notification.sent_at ? new Date(notification.sent_at).toLocaleString() : 'Unknown time'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message || 'No message'}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="capitalize">{notification.channel || 'unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>To: {notification.recipient_count || 0} users</span>
                      {notification.status === 'failed' && notification.error && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-red-600">Error: {notification.error}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;