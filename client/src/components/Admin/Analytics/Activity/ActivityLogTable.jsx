import React from 'react';

const ActivityLogTable = ({ logs }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getActionColor = (action) => {
        switch (action.toLowerCase()) {
            case 'create': return 'bg-green-100 text-green-800';
            case 'update': return 'bg-blue-100 text-blue-800';
            case 'delete': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Admin Activity</h2>
                <span className="text-sm text-gray-500">Last 50 actions</span>
            </div>

            <div className="space-y-4">
                {logs.slice(0, 10).map((log) => (
                    <div key={log.log_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                                    {log.action.toUpperCase()}
                                </span>
                                <span className="ml-2 text-sm text-gray-600">
                                    {log.entity_type} #{log.entity_id || 'N/A'}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                            <div className="flex items-center">
                                <span className="font-medium mr-2">Admin ID:</span>
                                <span>{log.admin_id}</span>
                            </div>
                            {log.ip_address && (
                                <div className="flex items-center mt-1">
                                    <span className="font-medium mr-2">IP:</span>
                                    <span className="font-mono text-xs">{log.ip_address}</span>
                                </div>
                            )}
                        </div>
                        
                        {(log.old_value || log.new_value) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    {log.old_value && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Old Value</div>
                                            <div className="text-sm bg-red-50 p-2 rounded truncate">
                                                {log.old_value}
                                            </div>
                                        </div>
                                    )}
                                    {log.new_value && (
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">New Value</div>
                                            <div className="text-sm bg-green-50 p-2 rounded truncate">
                                                {log.new_value}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLogTable;