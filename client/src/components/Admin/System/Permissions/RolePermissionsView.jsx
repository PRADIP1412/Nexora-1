import React, { useEffect, useState, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { 
  FiUsers, 
  FiKey, 
  FiLink, 
  FiTrash2,
  FiSearch,
  FiRefreshCw,
  FiCheck,
  FiX
} from 'react-icons/fi';

const RolePermissionsView = () => {
  const {
    fetchAllPermissions,
    fetchPermissionUsageSummary,
    assignPermissionToRole,
    removePermissionFromRole,
    fetchPermissionsByRole,
    fetchRolesByPermission,
    permissions,
    rolePermissions,
    loading,
    error,
    clearError
  } = useSystemContext();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionId, setSelectedPermissionId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchAllPermissions(),
        fetchPermissionUsageSummary()
      ]);
    } catch (err) {
      console.error('Error loading permissions:', err);
    }
  }, [fetchAllPermissions, fetchPermissionUsageSummary]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignPermission = async () => {
    if (!selectedRoleId || !selectedPermissionId) {
      alert('Please select both a role and a permission');
      return;
    }

    setIsAssigning(true);
    setSuccessMessage('');

    try {
      const result = await assignPermissionToRole(parseInt(selectedRoleId), parseInt(selectedPermissionId));
      if (result.success) {
        setSuccessMessage('Permission assigned to role successfully!');
        // Refresh the permissions for this role
        await fetchPermissionsByRole(parseInt(selectedRoleId));
        await fetchRolesByPermission(parseInt(selectedPermissionId));
        setSelectedRoleId('');
        setSelectedPermissionId('');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(`Failed to assign permission: ${result.message}`);
      }
    } catch (err) {
      console.error('Error assigning permission:', err);
      alert('Failed to assign permission. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemovePermission = async (roleId, permissionId) => {
    if (window.confirm('Are you sure you want to remove this permission from the role?')) {
      try {
        const result = await removePermissionFromRole(roleId, permissionId);
        if (result.success) {
          await fetchPermissionsByRole(roleId);
          await fetchRolesByPermission(permissionId);
          setSuccessMessage('Permission removed from role successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          alert(`Failed to remove permission: ${result.message}`);
        }
      } catch (err) {
        console.error('Error removing permission:', err);
        alert('Failed to remove permission. Please try again.');
      }
    }
  };

  const loadRolePermissions = async (roleId) => {
    if (!roleId) return;
    setSelectedRoleId(roleId);
    try {
      await fetchPermissionsByRole(parseInt(roleId));
    } catch (err) {
      console.error('Error loading role permissions:', err);
    }
  };

  const loadPermissionRoles = async (permissionId) => {
    if (!permissionId) return;
    setSelectedPermissionId(permissionId);
    try {
      await fetchRolesByPermission(parseInt(permissionId));
    } catch (err) {
      console.error('Error loading permission roles:', err);
    }
  };

  const filteredPermissions = (permissions.allPermissions || []).filter(permission => 
    permission.permission_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usageSummary = permissions.permissionUsageSummary || [];

  const permissionsByRole = rolePermissions.permissionsByRole[selectedRoleId] || [];
  const rolesByPermission = rolePermissions.rolesByPermission[selectedPermissionId] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Role-Permission Mapping</h1>
          <p className="text-gray-600">Manage which permissions are assigned to which roles</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiKey className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FiLink className="text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Assignment Interface */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Assign Permission to Role</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Enter role ID..."
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <div className="text-sm text-gray-600">
                <p>Enter a role ID to view and manage its permissions.</p>
                <p className="mt-1">Common roles: 1 (Admin), 2 (Manager), 3 (User)</p>
              </div>
              {selectedRoleId && (
                <button
                  onClick={() => loadRolePermissions(selectedRoleId)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Load Role Permissions
                </button>
              )}
            </div>
          </div>

          {/* Permission Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Permission
            </label>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Enter permission ID..."
                value={selectedPermissionId}
                onChange={(e) => setSelectedPermissionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <div className="text-sm text-gray-600">
                <p>Enter a permission ID to view which roles have it.</p>
              </div>
              {selectedPermissionId && (
                <button
                  onClick={() => loadPermissionRoles(selectedPermissionId)}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Load Permission Roles
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Assign Button */}
        {selectedRoleId && selectedPermissionId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleAssignPermission}
              disabled={loading || isAssigning}
              className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiLink className={`mr-2 ${isAssigning ? 'animate-spin' : ''}`} />
              {isAssigning ? 'Assigning...' : 'Assign Permission to Role'}
            </button>
          </div>
        )}
      </div>

      {/* Role Permissions Display */}
      {selectedRoleId && permissionsByRole.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Permissions for Role ID: {selectedRoleId}
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {permissionsByRole.length} permission{permissionsByRole.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {permissionsByRole.map((permission, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      <FiKey className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {permission.permission_name || 'Unnamed Permission'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {permission.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      permission.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {permission.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleRemovePermission(selectedRoleId, permission.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Remove permission from role"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Roles Display */}
      {selectedPermissionId && rolesByPermission.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Roles with Permission ID: {selectedPermissionId}
              </h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {rolesByPermission.length} role{rolesByPermission.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {rolesByPermission.map((role, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-4">
                      <FiUsers className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Role ID: {role.role_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {role.role_name || 'Unnamed Role'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePermission(role.role_id, selectedPermissionId)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Remove permission from role"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Permissions with Usage */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">All Permissions</h3>
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned to Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users with Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map((permission) => {
                const usage = usageSummary.find(u => u.permission_id === permission.id);
                
                return (
                  <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {permission.permission_name || 'Unnamed Permission'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {permission.description || 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {usage ? (
                          <>
                            <span className="text-2xl font-bold text-gray-800 mr-2">
                              {usage.role_count || 0}
                            </span>
                            <span className="text-sm text-gray-600">roles</span>
                          </>
                        ) : (
                          <span className="text-gray-500">No data</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {usage ? (
                          <>
                            <span className="text-2xl font-bold text-gray-800 mr-2">
                              {usage.user_count || 0}
                            </span>
                            <span className="text-sm text-gray-600">users</span>
                          </>
                        ) : (
                          <span className="text-gray-500">No data</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => loadPermissionRoles(permission.id)}
                        className="flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <FiUsers className="mr-1" />
                        View Roles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsView;