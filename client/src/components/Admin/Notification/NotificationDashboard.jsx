import React, { useState, useEffect } from 'react';
import { 
    FaBell, FaChartBar, FaPaperPlane, FaBroadcastTower, FaTrash, 
    FaCog, FaUsers, FaSearch, FaExclamationCircle, FaHome 
} from 'react-icons/fa';
import { useNotificationAdminContext } from '../../../context/NotificationAdminContext';
import AllNotificationsList from './AllNotificationsList';
import AnalyticsPanel from './AnalyticsPanel';
import SendNotificationForm from './SendNotificationForm';
import BroadcastForm from './BroadcastForm';
import CleanupPanel from './CleanupPanel';
import NotificationDetailsModal from './NotificationDetailsModal';

const NotificationDashboard = () => {
    const {
        // State
        allNotifications,
        currentNotification,
        stats,
        typeStats,
        loading,
        error,
        pagination,
        
        // Functions
        fetchAllNotifications,
        fetchNotificationsByUser,
        fetchUnreadNotifications,
        searchNotifications,
        fetchNotificationStats,
        fetchNotificationCountByType,
        sendNotificationToUser,
        sendNotificationToMultipleUsers,
        broadcastNotification,
        markNotificationReadByAdmin,
        updateNotification,
        deleteNotificationByAdmin,
        deleteOldNotifications,
        setNotification,
        clearCurrentNotification,
        clearError,
        clearAllData
    } = useNotificationAdminContext();

    const [activeTab, setActiveTab] = useState('all');
    const [cleanupPreview, setCleanupPreview] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Initial data fetch
    useEffect(() => {
        fetchAllNotifications({ skip: 0, limit: 50 });
        fetchNotificationStats();
        fetchNotificationCountByType();
    }, []);

    const tabs = [
        { id: 'all', label: 'All Notifications', icon: FaBell, count: pagination?.total },
        { id: 'analytics', label: 'Analytics', icon: FaChartBar },
        { id: 'send', label: 'Send', icon: FaPaperPlane },
        { id: 'broadcast', label: 'Broadcast', icon: FaBroadcastTower },
        { id: 'cleanup', label: 'Cleanup', icon: FaTrash }
    ];

    const handleSendNotification = async (payload, mode) => {
        try {
            if (mode === 'single') {
                await sendNotificationToUser(
                    payload.userId,
                    payload.title,
                    payload.message,
                    payload.type,
                    payload.referenceId
                );
            } else {
                await sendNotificationToMultipleUsers(
                    payload.userIds,
                    payload.title,
                    payload.message,
                    payload.type,
                    payload.referenceId
                );
            }
            // Refresh data
            fetchAllNotifications({ skip: 0, limit: 50 });
            fetchNotificationStats();
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const handleBroadcast = async (broadcastData) => {
        try {
            await broadcastNotification(broadcastData);
            // Refresh data
            fetchAllNotifications({ skip: 0, limit: 50 });
            fetchNotificationStats();
        } catch (error) {
            console.error('Error broadcasting:', error);
        }
    };

    const handleMarkRead = async (notificationId) => {
        try {
            await markNotificationReadByAdmin(notificationId);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await deleteNotificationByAdmin(notificationId);
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleUpdateNotification = async (notificationId, updateData) => {
        try {
            await updateNotification(notificationId, updateData);
            setIsDetailsModalOpen(false);
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    const handleCleanup = async (days, confirm) => {
        try {
            const result = await deleteOldNotifications(days, confirm);
            if (!confirm) {
                setCleanupPreview(result.data);
            } else {
                setCleanupPreview(null);
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    };

    const handleViewDetails = (notification) => {
        setNotification(notification);
        setIsDetailsModalOpen(true);
    };

    const handleRefreshAnalytics = () => {
        fetchNotificationStats();
        fetchNotificationCountByType();
    };

    const handleDateRangeChange = (range, startDate, endDate) => {
        // Implement date-based filtering if needed
        console.log('Date range changed:', range, startDate, endDate);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FaBell className="text-blue-600" />
                                Notification Management
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manage system notifications, send alerts, and monitor user engagement
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center gap-3">
                            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {stats?.total_notifications || 0} Total
                            </div>
                            <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {stats?.total_unread || 0} Unread
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded flex items-start gap-3">
                        <FaExclamationCircle className="text-red-500 mt-0.5" />
                        <div className="flex-1">
                            <div className="font-medium text-red-800">Error</div>
                            <div className="text-sm text-red-700 mt-1">{error}</div>
                        </div>
                        <button
                            onClick={clearError}
                            className="text-red-600 hover:text-red-800"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                                            ${activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon />
                                        {tab.label}
                                        {tab.count !== undefined && (
                                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                                activeTab === tab.id 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="fixed top-4 right-4 z-50">
                        <div className="bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">Processing...</span>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div>
                    {activeTab === 'all' && (
                        <AllNotificationsList
                            notifications={allNotifications}
                            pagination={pagination}
                            loading={loading}
                            error={error}
                            onFetchAll={fetchAllNotifications}
                            onFilter={fetchAllNotifications}
                            onViewDetails={handleViewDetails}
                            onMarkRead={handleMarkRead}
                            onDelete={handleDelete}
                            onSendNotification={handleSendNotification}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsPanel
                            stats={stats}
                            typeStats={typeStats}
                            loading={loading}
                            onRefresh={handleRefreshAnalytics}
                            onDateRangeChange={handleDateRangeChange}
                        />
                    )}

                    {activeTab === 'send' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <SendNotificationForm
                                    onSubmit={handleSendNotification}
                                    loading={loading}
                                />
                            </div>
                            <div>
                                <div className="bg-white rounded-lg shadow p-6 border">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <FaUsers /> Quick Actions
                                    </h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                fetchUnreadNotifications(0, 20);
                                                setActiveTab('all');
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
                                        >
                                            <FaExclamationCircle />
                                            View Unread Notifications
                                        </button>
                                        <button
                                            onClick={() => {
                                                searchNotifications('important', 0, 20);
                                                setActiveTab('all');
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-3 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100 border border-yellow-200"
                                        >
                                            <FaSearch />
                                            Search "Important"
                                        </button>
                                        <button
                                            onClick={() => {
                                                clearAllData();
                                                fetchAllNotifications({ skip: 0, limit: 50 });
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 border border-gray-200"
                                        >
                                            <FaCog />
                                            Refresh All Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'broadcast' && (
                        <div className="max-w-2xl mx-auto">
                            <BroadcastForm
                                onSubmit={handleBroadcast}
                                loading={loading}
                            />
                        </div>
                    )}

                    {activeTab === 'cleanup' && (
                        <div className="max-w-2xl mx-auto">
                            <CleanupPanel
                                onCleanup={handleCleanup}
                                loading={loading}
                                cleanupPreview={cleanupPreview}
                            />
                        </div>
                    )}
                </div>

                {/* Notification Details Modal */}
                <NotificationDetailsModal
                    notification={currentNotification}
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        clearCurrentNotification();
                    }}
                    onUpdate={handleUpdateNotification}
                    onMarkRead={handleMarkRead}
                    loading={loading}
                />
            </main>

            {/* Footer Stats */}
            <div className="border-t bg-white mt-12">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FaBell className="text-blue-500" />
                                <span>System Status: <span className="font-medium text-green-600">Operational</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaHome className="text-gray-500" />
                                <span>Last Updated: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">{allNotifications.length}</span> notifications loaded
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDashboard;