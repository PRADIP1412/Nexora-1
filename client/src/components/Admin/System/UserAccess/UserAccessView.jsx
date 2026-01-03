import React, { useEffect, useState, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import ActiveSessionsPanel from './ActiveSessionsPanel';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiPieChart, 
  FiRefreshCw,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import { FaDesktop, FaMobileAlt, FaTabletAlt } from 'react-icons/fa';

const UserAccessView = () => {
  const {
    fetchActiveUsersCount,
    fetchLoggedInUsers,
    fetchUserRoleDistribution,
    fetchActiveSessions,
    fetchDeviceLoginDistribution,
    userAccess,
    sessions,
    loading,
    error,
    clearError
  } = useSystemContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchActiveUsersCount(),
        fetchLoggedInUsers(),
        fetchUserRoleDistribution(),
        fetchActiveSessions(),
        fetchDeviceLoginDistribution()
      ]);
    } catch (err) {
      console.error('Error fetching all data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    fetchActiveUsersCount,
    fetchLoggedInUsers,
    fetchUserRoleDistribution,
    fetchActiveSessions,
    fetchDeviceLoginDistribution
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const filteredUsers = (userAccess.loggedInUsers || []).filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDeviceIcon = (deviceType) => {
    if (!deviceType) return <FaDesktop className="text-gray-500" />;
    
    switch(deviceType.toLowerCase()) {
      case 'desktop': return <FaDesktop className="text-blue-500" />;
      case 'mobile': return <FaMobileAlt className="text-green-500" />;
      case 'tablet': return <FaTabletAlt className="text-purple-500" />;
      default: return <FaDesktop className="text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'N/A';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiPieChart /> },
    { id: 'active-users', label: 'Active Users', icon: <FiUserCheck /> },
    { id: 'sessions', label: 'Sessions', icon: <FiUsers /> },
    { id: 'devices', label: 'Devices', icon: <FaDesktop /> }
  ];

  const totalActiveUsers = userAccess.activeUsersCount?.active_users || 
                          userAccess.activeUsersCount?.count || 
                          (userAccess.loggedInUsers || []).length || 
                          0;

  const totalSessions = Array.isArray(sessions.activeSessions) ? sessions.activeSessions.length : 0;
  const totalDevices = Array.isArray(sessions.deviceDistribution) ? 
    sessions.deviceDistribution.reduce((sum, device) => sum + (device.count || 0), 0) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Access Monitoring</h1>
          <p className="text-gray-600">Monitor active users, sessions, and device access</p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading || isRefreshing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${loading || isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiUserX className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="text-blue-600 text-2xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Active Users</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalActiveUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUserCheck className="text-green-600 text-2xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Logged In Users</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {(userAccess.loggedInUsers || []).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiUsers className="text-purple-600 text-2xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalSessions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaDesktop className="text-orange-600 text-2xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Unique Devices</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalDevices}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          {userAccess.userRoleDistribution && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
              <div className="space-y-4">
                {Array.isArray(userAccess.userRoleDistribution.distribution) ? 
                  userAccess.userRoleDistribution.distribution.map((role, index) => {
                    const totalUsers = userAccess.userRoleDistribution.total_users || 
                                     userAccess.userRoleDistribution.total || 
                                     1;
                    const percentage = Math.round((role.count / totalUsers) * 100);
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                          <span className="text-gray-700">{role.role_name || role.role || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-800 font-medium mr-2">{role.count || 0} users</span>
                          <span className="text-gray-500 text-sm">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-4 text-gray-500">
                      No role distribution data available
                    </div>
                  )
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Users Tab */}
      {activeTab === 'active-users' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Logged In Users</h3>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username || user.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(user.last_active || user.last_seen || user.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (user.status === 'active' || user.status === 'online') 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.ip_address || user.last_ip || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && <ActiveSessionsPanel />}

      {/* Devices Tab */}
      {activeTab === 'devices' && sessions.deviceDistribution && Array.isArray(sessions.deviceDistribution) && sessions.deviceDistribution.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Device Login Distribution</h3>
          <div className="space-y-6">
            {sessions.deviceDistribution.map((device, index) => {
              const totalDevicesCount = sessions.deviceDistribution.reduce((sum, d) => sum + (d.count || 0), 0);
              const percentage = totalDevicesCount > 0 ? Math.round((device.count / totalDevicesCount) * 100) : 0;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">
                        {device.device_type || 'Unknown Device'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {device.os || ''} {device.browser && device.os ? `• ${device.browser}` : device.browser || ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">
                      {device.count || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      {percentage}% of total
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccessView;