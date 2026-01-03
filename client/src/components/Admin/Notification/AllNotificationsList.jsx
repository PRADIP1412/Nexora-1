import React, { useState, useEffect } from 'react';
import { FaBell, FaFilter, FaRedo, FaPlus, FaExclamationCircle } from 'react-icons/fa';
import NotificationTable from './NotificationTable';
import NotificationFilters from './NotificationFilters';
import SendNotificationModal from './SendNotificationModal';

const AllNotificationsList = ({ 
    notifications,
    pagination,
    loading,
    error,
    onFetchAll,
    onFilter,
    onViewDetails,
    onMarkRead,
    onDelete,
    onSendNotification
}) => {
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [sendMode, setSendMode] = useState('single');

    useEffect(() => {
        if (currentPage > 1) {
            const newSkip = (currentPage - 1) * (pagination?.limit || 100);
            onFilter({ ...filters, skip: newSkip, limit: pagination?.limit || 100 });
        }
    }, [currentPage]);

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
        onFilter({ ...newFilters, skip: 0, limit: pagination?.limit || 100 });
    };

    const handleRefresh = () => {
        onFetchAll({ ...filters, skip: (currentPage - 1) * (pagination?.limit || 100), limit: pagination?.limit || 100 });
    };

    const handleSendNotification = (payload, mode) => {
        onSendNotification(payload, mode);
        setIsSendModalOpen(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-4 border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FaBell /> All Notifications
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Total: {pagination?.total || 0} notifications • 
                            Page {currentPage} of {pagination?.total_pages || 1}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                setSendMode('single');
                                setIsSendModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <FaPlus /> Send Notification
                        </button>
                        
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <FaRedo /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                    <FaExclamationCircle className="text-red-500 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-red-800">Error</h4>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <NotificationFilters 
                onFilter={handleFilter} 
                loading={loading}
            />

            {/* Table */}
            <NotificationTable 
                notifications={notifications}
                loading={loading}
                onViewDetails={onViewDetails}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
                currentPage={currentPage}
                totalPages={pagination?.total_pages || 1}
                onPageChange={handlePageChange}
            />

            {/* Send Notification Modal */}
            <SendNotificationModal 
                isOpen={isSendModalOpen}
                onClose={() => setIsSendModalOpen(false)}
                onSubmit={handleSendNotification}
                loading={loading}
                mode={sendMode}
            />
        </div>
    );
};

export default AllNotificationsList;