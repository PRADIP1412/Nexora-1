import React from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { 
  FiUsers, 
  FiActivity, 
  FiServer, 
  FiBell, 
  FiShield, 
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';

const QuickMetricsGrid = () => {
  const {
    userAccess,
    sessions,
    systemHealth,
    notifications,
    adminLogs
  } = useSystemContext();

  const getColorClasses = (color) => {
    switch(color) {
      case 'blue': return { bg: 'bg-blue-100', text: 'text-blue-600', bgLight: 'bg-blue-50' };
      case 'green': return { bg: 'bg-green-100', text: 'text-green-600', bgLight: 'bg-green-50' };
      case 'purple': return { bg: 'bg-purple-100', text: 'text-purple-600', bgLight: 'bg-purple-50' };
      case 'yellow': return { bg: 'bg-yellow-100', text: 'text-yellow-600', bgLight: 'bg-yellow-50' };
      case 'red': return { bg: 'bg-red-100', text: 'text-red-600', bgLight: 'bg-red-50' };
      case 'orange': return { bg: 'bg-orange-100', text: 'text-orange-600', bgLight: 'bg-orange-50' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', bgLight: 'bg-gray-50' };
    }
  };

  const metrics = [
    {
      title: 'Active Users',
      value: userAccess.activeUsersCount?.active_users || userAccess.activeUsersCount?.count || 0,
      icon: <FiUsers className="text-blue-600 text-2xl" />,
      color: 'blue',
      colorClasses: getColorClasses('blue')
    },
    {
      title: 'Active Sessions',
      value: Array.isArray(sessions.activeSessions) ? sessions.activeSessions.length : 0,
      icon: <FiActivity className="text-green-600 text-2xl" />,
      color: 'green',
      colorClasses: getColorClasses('green')
    },
    {
      title: 'System Health',
      value: systemHealth?.healthStatus?.overall_status || 'LOADING',
      icon: <FiServer className="text-purple-600 text-2xl" />,
      status: true,
      color: 'purple',
      colorClasses: getColorClasses('purple')
    },
    {
      title: 'Unread Notifications',
      value: notifications.unreadCount?.count || notifications.unreadCount?.unread_count || 0,
      icon: <FiBell className="text-yellow-600 text-2xl" />,
      color: 'yellow',
      colorClasses: getColorClasses('yellow')
    },
    {
      title: 'Critical Actions (7d)',
      value: Array.isArray(adminLogs.criticalAdminActions) ? adminLogs.criticalAdminActions.length : 0,
      icon: <FiAlertTriangle className="text-red-600 text-2xl" />,
      color: 'red',
      colorClasses: getColorClasses('red')
    },
    {
      title: 'Failed Operations',
      value: systemHealth?.failedOperationsSummary?.total_failed || systemHealth?.failedOperationsSummary?.count || 0,
      icon: <FiShield className="text-orange-600 text-2xl" />,
      color: 'orange',
      colorClasses: getColorClasses('orange')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${metric.colorClasses.bgLight}`}>
              {metric.icon}
            </div>
          </div>
          
          <div className="mb-1">
            <div className="text-2xl font-bold text-gray-800">
              {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">{metric.title}</p>
          </div>
          
          {metric.status && (
            <div className="mt-3">
              <div className={`h-2 rounded-full ${metric.colorClasses.bgLight}`}>
                <div 
                  className={`h-full rounded-full ${metric.colorClasses.bg}`}
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickMetricsGrid;