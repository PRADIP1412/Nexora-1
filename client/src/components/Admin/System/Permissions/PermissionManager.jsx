import React, { useEffect, useState, useCallback } from 'react';
import { useSystemContext } from '../../../../context/SystemContext';
import { 
  FiKey, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const PermissionManager = () => {
  const {
    fetchAllPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    fetchPermissionUsageSummary,
    permissions,
    loading,
    error,
    clearError
  } = useSystemContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [formData, setFormData] = useState({
    permission_name: '',
    description: '',
    category: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const filteredPermissions = (permissions.allPermissions || []).filter(permission => 
    permission.permission_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.permission_name.trim()) {
      alert('Permission name is required');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setDeleteError('');

    try {
      const result = await createPermission(formData);
      if (result.success) {
        setSuccessMessage('Permission created successfully!');
        setShowCreateModal(false);
        setFormData({
          permission_name: '',
          description: '',
          category: '',
          is_active: true
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(`Failed to create permission: ${result.message}`);
      }
    } catch (err) {
      console.error('Error creating permission:', err);
      alert('Failed to create permission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      permission_name: permission.permission_name || '',
      description: permission.description || '',
      category: permission.category || '',
      is_active: permission.is_active !== undefined ? permission.is_active : true
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.permission_name.trim()) {
      alert('Permission name is required');
      return;
    }

    if (!selectedPermission) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setDeleteError('');

    try {
      // Use the correct ID field from selectedPermission
      const permissionId = selectedPermission.id || selectedPermission._id || selectedPermission.permission_id;
      if (!permissionId) {
        alert('Cannot update: Permission ID not found');
        return;
      }

      const result = await updatePermission(permissionId, formData);
      if (result.success) {
        setSuccessMessage('Permission updated successfully!');
        setShowEditModal(false);
        setSelectedPermission(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(`Failed to update permission: ${result.message}`);
      }
    } catch (err) {
      console.error('Error updating permission:', err);
      alert('Failed to update permission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (permission, permissionName) => {
    // Get the ID from permission object - check multiple possible fields
    const permissionId = permission.id || permission._id || permission.permission_id;
    
    // Debug logging
    console.log('Permission object:', permission);
    console.log('Extracted permissionId:', permissionId);
    
    if (!permissionId) {
      alert('Cannot delete: Permission ID not found');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete permission "${permissionName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteError('');
    setIsDeleting(true);
    setDeletingId(permissionId);

    try {
      const result = await deletePermission(permissionId);
      
      if (result.success) {
        setSuccessMessage(`Permission "${permissionName}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        // Refresh the data
        await loadData();
      } else {
        let errorMsg = result.message || 'Failed to delete permission';
        
        if (result.data?.detail) {
          if (Array.isArray(result.data.detail)) {
            errorMsg = result.data.detail.map(d => d.msg || d.message).join(', ');
          } else if (typeof result.data.detail === 'string') {
            errorMsg = result.data.detail;
          }
        }
        
        setDeleteError(errorMsg);
        console.error('Delete permission error from context:', result);
      }
    } catch (err) {
      console.error('Error deleting permission:', err);
      
      let errorMessage = 'Failed to delete permission. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(d => {
              if (typeof d === 'string') return d;
              if (typeof d === 'object') return d.msg || d.message || JSON.stringify(d);
              return String(d);
            }).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (typeof errorData.detail === 'object') {
            errorMessage = errorData.detail.message || errorData.detail.msg || JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setDeleteError(errorMessage);
      alert(`Delete failed: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const refreshData = () => {
    loadData();
  };

  const formatErrorMessage = (error) => {
    if (!error) return '';
    
    if (typeof error === 'string') return error;
    
    if (typeof error === 'object') {
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          return error.detail.map(d => {
            if (typeof d === 'string') return d;
            if (typeof d === 'object') return d.msg || d.message || JSON.stringify(d);
            return String(d);
          }).join(', ');
        } else if (typeof error.detail === 'string') {
          return error.detail;
        }
      }
      if (error.message) return error.message;
      return JSON.stringify(error);
    }
    
    return String(error);
  };

  // Get unique key for each permission
  const getPermissionKey = (permission, index) => {
    // Try multiple possible ID fields
    const id = permission.id || permission._id || permission.permission_id;
    if (id) {
      return `permission-${id}`;
    }
    // Fallback to index if no ID found
    return `permission-index-${index}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Permission Management</h1>
          <p className="text-gray-600">Create, update, and manage system permissions</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Create Permission
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiLock className="text-red-500 mr-2" />
              <span className="text-red-700">{formatErrorMessage(error)}</span>
            </div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiTrash2 className="text-red-500 mr-2" />
              <span className="text-red-700">{formatErrorMessage(deleteError)}</span>
            </div>
            <button onClick={() => setDeleteError('')} className="text-red-600 hover:text-red-800">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FiKey className="text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Permissions</h3>
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

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No permissions found matching your search' : 'No permissions found'}
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission, index) => {
                  const usage = (permissions.permissionUsageSummary || []).find(
                    u => u.permission_id === (permission.id || permission._id || permission.permission_id)
                  );
                  
                  return (
                    <tr key={getPermissionKey(permission, index)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <FiKey className="text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {permission.permission_name || 'Unnamed Permission'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {permission.id || permission._id || permission.permission_id || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {permission.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {permission.category && (
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {permission.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          permission.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {permission.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {usage ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {usage.role_count || 0} roles
                            </div>
                            <div className="text-sm text-gray-500">
                              {usage.user_count || 0} users
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No usage data</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(permission)}
                            disabled={isDeleting || loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 transition-colors"
                            title="Edit permission"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(permission, permission.permission_name)}
                            disabled={isDeleting && deletingId === (permission.id || permission._id || permission.permission_id)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                            title="Delete permission"
                          >
                            {isDeleting && deletingId === (permission.id || permission._id || permission.permission_id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Permission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Create New Permission</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name *
                </label>
                <input
                  type="text"
                  value={formData.permission_name}
                  onChange={(e) => setFormData({...formData, permission_name: e.target.value})}
                  placeholder="e.g., users.create"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this permission allows"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., Users, Settings, Reports"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active (permission will be available immediately)
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !formData.permission_name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Permission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit Permission</h3>
              <p className="text-sm text-gray-600 mt-1">
                ID: {selectedPermission.id || selectedPermission._id || selectedPermission.permission_id || 'N/A'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Name *
                </label>
                <input
                  type="text"
                  value={formData.permission_name}
                  onChange={(e) => setFormData({...formData, permission_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="edit_is_active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPermission(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSubmitting || !formData.permission_name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Permission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;