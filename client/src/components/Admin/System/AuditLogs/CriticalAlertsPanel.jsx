import React from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { FiAlertTriangle, FiClock, FiUser, FiActivity } from 'react-icons/fi';

const CriticalAlertsPanel = () => {
  const { adminLogs } = useSystemContext();

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 60) {
        return `${diffMins} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return 'N/A';
    }
  };

  const criticalActions = Array.isArray(adminLogs.criticalAdminActions) ? adminLogs.criticalAdminActions : [];

  if (criticalActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-red-100 border-b border-red-200">
        <div className="flex items-center">
          <FiAlertTriangle className="text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-800">Critical Actions Alert</h3>
          <span className="ml-3 px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
            {criticalActions.length} Critical
          </span>
        </div>
        <p className="text-red-700 text-sm mt-1">
          These actions require immediate attention and review
        </p>
      </div>

      <div className="divide-y divide-red-100">
        {criticalActions.slice(0, 5).map((action, index) => (
          <div key={index} className="p-4 hover:bg-red-50/50 transition-colors">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <FiAlertTriangle className="text-red-500" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <p className="font-medium text-red-900">
                    {action.action_description || action.description || 'Critical Action'}
                  </p>
                  <span className="text-xs text-red-700">
                    {formatTime(action.timestamp || action.created_at)}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-red-700">
                  <FiUser className="mr-1" size={14} />
                  <span className="font-medium">{action.admin_name || action.admin_username || 'Unknown Admin'}</span>
                  <span className="mx-2">•</span>
                  <FiActivity className="mr-1" size={14} />
                  <span className="capitalize">{action.action_type || 'action'}</span>
                  {action.resource_type && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{action.resource_type}</span>
                    </>
                  )}
                </div>
                {action.ip_address && (
                  <div className="mt-1 text-xs text-red-600">
                    IP: {action.ip_address}
                  </div>
                )}
                {action.reason && (
                  <div className="mt-2 p-2 bg-red-100/50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      Reason: {action.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {criticalActions.length > 5 && (
        <div className="p-4 border-t border-red-200 text-center">
          <button className="text-red-700 hover:text-red-900 text-sm font-medium transition-colors">
            View All {criticalActions.length} Critical Actions →
          </button>
        </div>
      )}
    </div>
  );
};

export default CriticalAlertsPanel;