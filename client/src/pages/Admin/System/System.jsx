import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { FiActivity, FiUsers, FiShield, FiAlertTriangle, FiBell, FiKey } from 'react-icons/fi';
import { CgPerformance } from 'react-icons/cg';
import { FaChartBar, FaUserLock } from 'react-icons/fa';

// Import Components
import SystemDashboard from '../../../components/Admin/System/Dashboard/SystemDashboard';
import UserAccessView from '../../../components/Admin/System/UserAccess/UserAccessView';
import AuditLogsView from '../../../components/Admin/System/AuditLogs/AuditLogsView';
import HealthDashboard from '../../../components/Admin/System/SystemHealth/HealthDashboard';
import NotificationsView from '../../../components/Admin/System/Notifications/NotificationsView';
import PermissionManager from '../../../components/Admin/System/Permissions/PermissionManager';
import RolePermissionsView from '../../../components/Admin/System/Permissions/RolePermissionsView';

const System = () => {
  const navItems = [
    { path: '', icon: <FaChartBar />, label: 'Dashboard', component: SystemDashboard },
    { path: 'user-access', icon: <FaUserLock />, label: 'User Access', component: UserAccessView },
    { path: 'audit-logs', icon: <FiShield />, label: 'Audit Logs', component: AuditLogsView },
    { path: 'system-health', icon: <CgPerformance />, label: 'System Health', component: HealthDashboard },
    { path: 'notifications', icon: <FiBell />, label: 'Notifications', component: NotificationsView },
    { path: 'permissions', icon: <FiKey />, label: 'Permissions', component: PermissionManager },
    { path: 'role-permissions', icon: <FiActivity />, label: 'Role Mapping', component: RolePermissionsView },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">System Management</h1>
            <p className="text-sm text-gray-600">Monitor and manage system operations</p>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path || 'dashboard'}
                to={`/admin/system/${item.path}`}
                end={item.path === ''}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <button className="w-full mb-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Refresh All Data
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Export Reports
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Routes>
            {navItems.map((item) => (
              <Route
                key={item.path || 'dashboard'}
                path={item.path || ''}
                element={<item.component />}
              />
            ))}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default System;