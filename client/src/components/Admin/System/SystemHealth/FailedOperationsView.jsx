import React, { useState, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { FiAlertTriangle, FiFilter, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const FailedOperationsView = () => {
  const {
    systemHealth,
    fetchFailedOperationsSummary
  } = useSystemContext();

  const [timeRange, setTimeRange] = useState(7); // 7 days
  const [loadingTimeRange, setLoadingTimeRange] = useState(false);

  const handleTimeRangeChange = useCallback(async (days) => {
    setTimeRange(days);
    setLoadingTimeRange(true);
    try {
      await fetchFailedOperationsSummary(days);
    } catch (err) {
      console.error('Error fetching failed operations:', err);
    } finally {
      setLoadingTimeRange(false);
    }
  }, [fetchFailedOperationsSummary]);

  const failedOps = systemHealth?.failedOperationsSummary;

  if (!failedOps && !loadingTimeRange) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading failed operations data...</p>
        </div>
      </div>
    );
  }

  const timeRanges = [
    { days: 1, label: '24 Hours' },
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' }
  ];

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <FiTrendingUp className="text-red-500" />;
    } else if (trend < 0) {
      return <FiTrendingDown className="text-green-500" />;
    }
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-red-600';
    if (trend < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const totalFailed = failedOps?.total_failed || failedOps?.count || 0;
  const errorDistribution = failedOps?.error_distribution || failedOps?.errors || [];
  const recentFailures = failedOps?.recent_failures || failedOps?.recent || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <FiAlertTriangle className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Failed Operations</h3>
              <p className="text-sm text-gray-600">System errors and failures overview</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.days}
                onClick={() => handleTimeRangeChange(range.days)}
                disabled={loadingTimeRange}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range.days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${loadingTimeRange ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {totalFailed}
            </div>
            <p className="text-sm text-gray-600">Total Failed Operations</p>
            {failedOps?.failure_trend !== undefined && (
              <div className={`mt-2 text-sm flex items-center justify-center ${getTrendColor(failedOps.failure_trend)}`}>
                {getTrendIcon(failedOps.failure_trend)}
                <span className="ml-1">
                  {failedOps.failure_trend > 0 ? '+' : ''}{failedOps.failure_trend}%
                </span>
              </div>
            )}
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {failedOps?.unique_errors || errorDistribution.length || 0}
            </div>
            <p className="text-sm text-gray-600">Unique Error Types</p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {failedOps?.resolution_rate 
                ? `${Math.round(failedOps.resolution_rate)}%`
                : 'N/A'
              }
            </div>
            <p className="text-sm text-gray-600">Resolution Rate</p>
          </div>
        </div>
      </div>

      {/* Error Distribution */}
      {errorDistribution.length > 0 && (
        <div className="p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Error Type Distribution</h4>
          <div className="space-y-4">
            {errorDistribution.map((error, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{error.error_type || error.type || 'Unknown Error'}</span>
                  <span className="font-medium text-gray-800">{error.count || 0} occurrences</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ 
                      width: `${totalFailed > 0 ? ((error.count || 0) / totalFailed) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                {error.last_occurrence && (
                  <div className="text-xs text-gray-500">
                    Last: {new Date(error.last_occurrence).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Failures */}
      {recentFailures.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Recent Failures</h4>
          <div className="space-y-3">
            {recentFailures.slice(0, 5).map((failure, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-red-800">
                      {failure.operation_name || failure.endpoint || 'Unknown Operation'}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {failure.error_message || failure.message || 'Unknown error'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">
                      {failure.timestamp ? new Date(failure.timestamp).toLocaleTimeString() : 'Unknown time'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {failure.user_id ? `User: ${failure.user_id}` : 'System'}
                    </div>
                  </div>
                </div>
                {failure.endpoint && (
                  <div className="mt-2 text-xs text-gray-600">
                    Endpoint: {failure.endpoint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FailedOperationsView;