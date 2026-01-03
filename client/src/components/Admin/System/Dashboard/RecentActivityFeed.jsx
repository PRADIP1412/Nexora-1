import React, { useEffect } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { FiUser, FiCalendar, FiActivity, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const RecentActivityFeed = () => {
  const {
    fetchRecentAdminActions,
    adminLogs,
    loading
  } = useSystemContext();

  useEffect(() => {
    const loadData = async () => {
      await fetchRecentAdminActions(24); // Last 24 hours
    };
    loadData();
  }, [fetchRecentAdminActions]);

  const getActionIcon = (actionType) => {
    if (!actionType) return <FiActivity className="text-gray-500" />;
    
    switch (actionType.toLowerCase()) {
      case 'create':
        return <FiCheckCircle className="text-green-500" />;
      case 'update':
        return <FiActivity className="text-blue-500" />;
      case 'delete':
        return <FiXCircle className="text-red-500" />;
      case 'critical':
        return <FiAlertCircle className="text-orange-500" />;
      default:
        return <FiActivity className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hr ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'N/A';
    }
  };

  const activities = adminLogs.recentAdminActions?.actions || 
                    adminLogs.recentAdminActions?.logs || 
                    adminLogs.recentAdminActions || 
                    [];

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Recent Admin Activity</h3>
        <p className="text-sm text-gray-600">Last 24 hours of system activities</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activities...</p>
          </div>
        ) : !activities.length ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No recent activities found</p>
          </div>
        ) : (
          activities.slice(0, 10).map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(activity.action_type)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action_description || activity.description || 'Action performed'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatTime(activity.timestamp || activity.created_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <FiUser className="mr-1" size={14} />
                    <span className="font-medium">{activity.admin_name || activity.admin_username || 'Unknown Admin'}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{activity.action_type || 'action'}</span>
                    {activity.resource_type && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{activity.resource_type}</span>
                      </>
                    )}
                  </div>
                  {activity.ip_address && (
                    <div className="mt-1 text-xs text-gray-500">
                      IP: {activity.ip_address}
                      {activity.user_agent && (
                        <>
                          <span className="mx-2">•</span>
                          Device: {activity.user_agent}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {activities.length > 10 && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Activities →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;