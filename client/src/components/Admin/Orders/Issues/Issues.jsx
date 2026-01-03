import React from 'react'; 
import './Issues.css';

const IssuesList = ({ issues, onResolve, loading }) => {
    if (loading && issues.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-lg">Loading issues...</div>
            </div>
        );
    }

    if (issues.length === 0 && !loading) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-500">No issues found.</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {issues.map((issue) => (
                <div key={issue.issue_id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Issue #{issue.issue_id}</h3>
                            <p className="text-sm text-gray-600">
                                Order #{issue.order_id} • {new Date(issue.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            issue.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {issue.resolved ? 'Resolved' : 'Open'}
                        </span>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-gray-700">{issue.description}</p>
                    </div>
                    
                    {issue.resolved && issue.resolution_note && (
                        <div className="mb-4 p-3 bg-green-50 rounded-md">
                            <p className="text-sm font-medium text-green-800 mb-1">Resolution:</p>
                            <p className="text-green-700">{issue.resolution_note}</p>
                        </div>
                    )}
                    
                    {!issue.resolved && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => onResolve(issue)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Resolve Issue
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default IssuesList;