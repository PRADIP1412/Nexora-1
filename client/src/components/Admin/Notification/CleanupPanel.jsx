import React, { useState } from 'react';
import { FaTrash, FaCalendar, FaExclamationTriangle, FaHistory, FaInfoCircle } from 'react-icons/fa';

const CleanupPanel = ({ onCleanup, loading, cleanupPreview }) => {
    const [days, setDays] = useState(30);
    const [confirmText, setConfirmText] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const handlePreview = () => {
        onCleanup(days, false);
        setShowPreview(true);
    };

    const handleConfirmCleanup = () => {
        if (confirmText === 'DELETE') {
            onCleanup(days, true);
            setConfirmText('');
            setShowPreview(false);
        } else {
            alert('Please type "DELETE" to confirm');
        }
    };

    const ageOptions = [
        { days: 7, label: '1 Week' },
        { days: 30, label: '1 Month' },
        { days: 90, label: '3 Months' },
        { days: 180, label: '6 Months' },
        { days: 365, label: '1 Year' },
        { days: 730, label: '2 Years' }
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6 border">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FaTrash /> Cleanup Old Notifications
            </h3>

            {/* Warning Banner */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="text-red-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-red-800 mb-1">Warning: Irreversible Action</h4>
                        <p className="text-sm text-red-700">
                            This will permanently delete notifications older than the specified age. 
                            This action cannot be undone. Always preview before deleting.
                        </p>
                    </div>
                </div>
            </div>

            {/* Age Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium mb-3 flex items-center gap-2">
                    <FaCalendar /> Delete notifications older than:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ageOptions.map(option => (
                        <button
                            key={option.days}
                            type="button"
                            onClick={() => setDays(option.days)}
                            className={`p-4 border rounded text-center transition-colors ${
                                days === option.days 
                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                    : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            disabled={loading}
                        >
                            <div className="text-lg font-bold">{option.days} days</div>
                            <div className="text-sm text-gray-600">{option.label}</div>
                        </button>
                    ))}
                </div>
                <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                    <FaInfoCircle />
                    Notifications older than {days} days will be deleted
                </div>
            </div>

            {/* Preview Results */}
            {showPreview && cleanupPreview && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start gap-3">
                        <FaHistory className="text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-yellow-800 mb-1">Preview Results</h4>
                            <div className="text-sm text-yellow-700 space-y-1">
                                <p><strong>{cleanupPreview.would_delete_count || 0}</strong> notifications would be deleted</p>
                                <p>Notifications older than {cleanupPreview.days || days} days</p>
                                {cleanupPreview.confirm_required && (
                                    <p className="mt-2 text-red-600 font-medium">
                                        ⚠️ Confirm deletion by typing "DELETE" below
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
                <button
                    onClick={handlePreview}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
                >
                    <FaHistory />
                    {loading ? 'Generating Preview...' : 'Preview Deletion'}
                </button>

                {showPreview && cleanupPreview?.confirm_required && cleanupPreview.would_delete_count > 0 && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Type "DELETE" to confirm permanent deletion:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder="Type DELETE here"
                                className="w-full px-3 py-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500"
                                disabled={loading}
                            />
                        </div>
                        
                        <button
                            onClick={handleConfirmCleanup}
                            disabled={loading || confirmText !== 'DELETE'}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                        >
                            <FaTrash />
                            {loading ? 'Deleting...' : `Permanently Delete ${cleanupPreview.would_delete_count} Notifications`}
                        </button>
                    </>
                )}
            </div>

            {/* Information Section */}
            <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FaInfoCircle /> Cleanup Guidelines
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                    <li>Always preview before deleting</li>
                    <li>Consider archiving important notifications instead of deleting</li>
                    <li>Monthly cleanup is recommended for system performance</li>
                    <li>Notifications older than 90 days rarely need to be kept</li>
                    <li>System notifications can typically be cleaned up after 30 days</li>
                </ul>
            </div>
        </div>
    );
};

export default CleanupPanel;