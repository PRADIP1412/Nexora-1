import React from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { FiMonitor, FiSmartphone, FiTablet, FiClock, FiMapPin } from 'react-icons/fi';

const ActiveSessionsPanel = () => {
  const { sessions, loading } = useSystemContext();

  const getDeviceIcon = (deviceType) => {
    if (!deviceType) return <FiMonitor className="text-gray-500" />;
    
    switch(deviceType.toLowerCase()) {
      case 'desktop': return <FiMonitor className="text-blue-500" />;
      case 'mobile': return <FiSmartphone className="text-green-500" />;
      case 'tablet': return <FiTablet className="text-purple-500" />;
      default: return <FiMonitor className="text-gray-500" />;
    }
  };

  const formatDuration = (startTime) => {
    if (!startTime) return 'N/A';
    try {
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now - start;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMins % 60}m`;
      }
      return `${diffMins}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  const activeSessions = Array.isArray(sessions.activeSessions) ? sessions.activeSessions : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Active Sessions</h3>
        <p className="text-sm text-gray-600">Real-time user sessions across the system</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sessions...</p>
          </div>
        ) : activeSessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          activeSessions.map((session, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4">
                    {getDeviceIcon(session.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-800">
                        {session.username || session.user_name || 'Unknown User'}
                      </p>
                      <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {session.role || 'User'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <FiClock className="mr-1" size={14} />
                      <span>{formatDuration(session.session_start || session.created_at)} active</span>
                      {session.ip_address && (
                        <>
                          <span className="mx-2">•</span>
                          <FiMapPin className="mr-1" size={14} />
                          <span>{session.ip_address}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600 capitalize">
                    {session.device_type || 'Device'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.browser || 'Browser'} • {session.os || 'OS'}
                  </div>
                </div>
              </div>
              
              {session.location && (
                <div className="mt-3 text-xs text-gray-500">
                  Location: {session.location.city}, {session.location.country}
                  {session.location.isp && ` • ${session.location.isp}`}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {activeSessions.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''}
            </span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
              View All Sessions →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSessionsPanel;