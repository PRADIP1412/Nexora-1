import React, { useState } from 'react';
import { useOrderAdminContext } from '../../../../context/OrderAdminContext';
import './IssueModal.css';

const IssueModal = ({ issue, onClose, onActionComplete }) => {
    const { resolveOrderIssue } = useOrderAdminContext();
    const [resolutionNote, setResolutionNote] = useState('');

    const handleResolve = async () => {
        if (!resolutionNote.trim()) {
            alert('Please provide a resolution note');
            return;
        }
        
        const result = await resolveOrderIssue(issue.order_id, issue.issue_id, resolutionNote);
        if (result.success) {
            onActionComplete();
        }
    };

    if (!issue) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Resolve Issue</h3>
                    <p className="text-sm text-gray-600">Issue #{issue.issue_id} for Order #{issue.order_id}</p>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-700 mb-2">Issue Description:</p>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p>{issue.description}</p>
                    </div>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution Note
                    </label>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Describe how this issue was resolved..."
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                    />
                </div>
                
                <div className="flex space-x-3">
                    <button
                        onClick={handleResolve}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    >
                        Mark as Resolved
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueModal;