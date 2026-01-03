import React, { useEffect, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import FailedOperationsView from './FailedOperationsView';
import { 
  FiServer, 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiBarChart2
} from 'react-icons/fi';

const HealthDashboard = () => {
  const {
    fetchSystemHealthStatus,
    fetchApiUsageOverview,
    fetchFailedOperationsSummary,
    systemHealth,
    loading,
    error,
    clearError
  } = useSystemContext();

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchSystemHealthStatus(),
        fetchApiUsageOverview(),
        fetchFailedOperationsSummary()
      ]);
    } catch (err) {
      console.error('Error loading health data:', err);
    }
  }, [fetchSystemHealthStatus, fetchApiUsageOverview, fetchFailedOperationsSummary]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600 bg-gray-100';
    
    switch(status.toUpperCase()) {
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      case 'DEGRADED': return 'text-yellow-600 bg-yellow-100';
      case 'UNHEALTHY': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <FiActivity className="text-gray-500" />;
    
    switch(status.toUpperCase()) {
      case 'HEALTHY': return <FiCheckCircle className="text-green-500" />;
      case 'DEGRADED': return <FiAlertTriangle className="text-yellow-500" />;
      case 'UNHEALTHY': return <FiXCircle className="text-red-500" />;
      default: return <FiActivity className="text-gray-500" />;
    }
  };

  const healthComponents = systemHealth?.healthStatus?.components || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Health</h1>
          <p className="text-gray-600">Monitor system performance and health metrics</p>
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
              <FiAlertTriangle className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Overall Health Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FiServer className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Overall System Health</h3>
              <p className="text-gray-600">Current system status and performance</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(systemHealth?.healthStatus?.overall_status)}`}>
            {systemHealth?.healthStatus?.overall_status || 'LOADING'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(healthComponents).map(([component, status]) => (
            <div key={component} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700 capitalize">
                  {component.replace(/_/g, ' ')}
                </span>
                {getStatusIcon(status)}
              </div>
              <div className={`text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(status)}`}>
                {status || 'UNKNOWN'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Performance */}
      {systemHealth?.apiUsageOverview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <FiBarChart2 className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">API Response Time</h4>
                <p className="text-sm text-gray-600">Average response time</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {systemHealth.apiUsageOverview.avg_response_time || systemHealth.apiUsageOverview.average_response_time || 0}ms
            </div>
            <div className="text-sm text-gray-600">
              Target: {systemHealth.apiUsageOverview.target_response_time || 500}ms
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FiActivity className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Total Requests</h4>
                <p className="text-sm text-gray-600">Last 24 hours</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {(systemHealth.apiUsageOverview.total_requests || 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <FiCheckCircle className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Success Rate</h4>
                <p className="text-sm text-gray-600">API success percentage</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {systemHealth.apiUsageOverview.success_rate 
                ? `${Math.round(systemHealth.apiUsageOverview.success_rate)}%`
                : 'N/A'
              }
            </div>
          </div>
        </div>
      )}

      {/* Component Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Component Details</h3>
        <div className="space-y-4">
          {Object.entries(healthComponents).map(([component, status]) => {
            const details = systemHealth?.healthStatus?.details?.[component];
            return (
              <div key={component} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(status)}
                    <span className="ml-2 font-medium text-gray-800 capitalize">
                      {component.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
                    {status || 'UNKNOWN'}
                  </span>
                </div>
                
                {details && (
                  <div className="mt-3 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      {details.version && (
                        <div>
                          <span className="font-medium">Version:</span> {details.version}
                        </div>
                      )}
                      {details.uptime && (
                        <div>
                          <span className="font-medium">Uptime:</span> {details.uptime}
                        </div>
                      )}
                      {details.last_check && (
                        <div>
                          <span className="font-medium">Last Check:</span> {details.last_check}
                        </div>
                      )}
                      {details.message && (
                        <div className="col-span-2">
                          <span className="font-medium">Message:</span> {details.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Failed Operations */}
      <FailedOperationsView />
    </div>
  );
};

export default HealthDashboard;