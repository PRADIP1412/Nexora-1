import React, { useState, useEffect, useCallback } from 'react';
import { 
    FaTachometerAlt, 
    FaList, 
    FaMoneyBillWave, 
    FaChartLine, 
    FaExclamationTriangle,
    FaTruck,
    FaDownload,
    FaPlus,
    FaTrophy,
    FaSync
} from 'react-icons/fa';
import { useDeliveryContext } from '../../../context/DeliveryContext';

// Import all components from the components folder
import DeliveryStatsCard from '../../../components/Admin/Delivery/DeliveryStatsCard';
import DeliveryList from '../../../components/Admin/Delivery/DeliveryList';
import DeliveryEarnings from '../../../components/Admin/Delivery/DeliveryEarnings';
import DeliveryPerformance from '../../../components/Admin/Delivery/DeliveryPerformance';
import DeliveryIssuesList from '../../../components/Admin/Delivery/DeliveryIssuesList';
import DeliveryFilters from '../../../components/Admin/Delivery/DeliveryFilters';
import DeliveryAssignModal from '../../../components/Admin/Delivery/DeliveryAssignModal';
import DeliveryStatusUpdate from '../../../components/Admin/Delivery/DeliveryStatusUpdate';
import DeliveryDetailsModal from '../../../components/Admin/Delivery/DeliveryDetailsModal';

const Delivery = () => {
    const {
        adminDeliveries,
        deliveryStats,
        deliveryEarnings,
        deliveryPerformance,
        deliveryIssues,
        deliveryPersons,
        loading,
        adminGetAllDeliveries,
        adminGetDeliveryStats,
        adminGetDeliveryEarnings,
        adminGetDeliveryPersonPerformance,
        adminGetDeliveryIssues,
        adminGetAllDeliveryPersons
    } = useDeliveryContext();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    
    // Load initial data once
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    adminGetAllDeliveries(),
                    adminGetDeliveryStats(),
                    adminGetDeliveryEarnings(),
                    adminGetDeliveryPersonPerformance(),
                    adminGetDeliveryIssues(),
                    adminGetAllDeliveryPersons()
                ]);
                setHasLoaded(true);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };

        if (!hasLoaded) {
            loadInitialData();
        }
    }, [hasLoaded]);

    // Handle delivery selection for modals
    const handleViewDetails = (delivery) => {
        setSelectedDelivery(delivery);
        setShowDetailsModal(true);
    };

    const handleAssignClick = (delivery) => {
        setSelectedDelivery(delivery);
        setShowAssignModal(true);
    };

    const handleStatusUpdateClick = (delivery) => {
        setSelectedDelivery(delivery);
        setShowStatusModal(true);
    };

    const handleModalSuccess = () => {
        setShowAssignModal(false);
        setShowStatusModal(false);
        setSelectedDelivery(null);
        refreshCurrentTabData();
    };

    const handleModalClose = () => {
        setShowAssignModal(false);
        setShowStatusModal(false);
        setShowDetailsModal(false);
        setSelectedDelivery(null);
    };

    const refreshCurrentTabData = async () => {
        try {
            switch (activeTab) {
                case 'dashboard':
                    await Promise.all([
                        adminGetDeliveryStats(),
                        adminGetDeliveryEarnings(),
                        adminGetDeliveryPersonPerformance(),
                        adminGetDeliveryIssues(),
                        adminGetAllDeliveryPersons()
                    ]);
                    break;
                case 'deliveries':
                    await adminGetAllDeliveries();
                    break;
                case 'earnings':
                    await adminGetDeliveryEarnings();
                    break;
                case 'performance':
                    await Promise.all([
                        adminGetDeliveryPersonPerformance(),
                        adminGetAllDeliveryPersons()
                    ]);
                    break;
                case 'issues':
                    await adminGetDeliveryIssues();
                    break;
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    const handleRefreshAll = async () => {
        try {
            await Promise.all([
                adminGetAllDeliveries(),
                adminGetDeliveryStats(),
                adminGetDeliveryEarnings(),
                adminGetDeliveryPersonPerformance(),
                adminGetDeliveryIssues(),
                adminGetAllDeliveryPersons()
            ]);
        } catch (error) {
            console.error('Error refreshing all data:', error);
        }
    };

    // Tabs configuration
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
        { id: 'deliveries', label: 'All Deliveries', icon: <FaList /> },
        { id: 'earnings', label: 'Earnings', icon: <FaMoneyBillWave /> },
        { id: 'performance', label: 'Performance', icon: <FaChartLine /> },
        { id: 'issues', label: 'Issues', icon: <FaExclamationTriangle /> }
    ];

    // Render content based on active tab
    const renderContent = () => {
        if (loading && !hasLoaded) {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                                    </div>
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <DeliveryStatsCard />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DeliveryEarnings />
                            <DeliveryPerformance />
                        </div>
                        <DeliveryIssuesList />
                    </div>
                );
            case 'deliveries':
                return (
                    <DeliveryList 
                        onViewDetails={handleViewDetails}
                        onAssignClick={handleAssignClick}
                        onStatusUpdateClick={handleStatusUpdateClick}
                    />
                );
            case 'earnings':
                return <DeliveryEarnings />;
            case 'performance':
                return <DeliveryPerformance />;
            case 'issues':
                return <DeliveryIssuesList />;
            default:
                return <DeliveryStatsCard />;
        }
    };

    // Get header title and button based on active tab
    const getHeaderConfig = () => {
        const configs = {
            dashboard: {
                title: 'Delivery Management',
                subtitle: 'Manage deliveries, track performance, and handle issues',
                icon: <FaTruck className="text-blue-600" />,
                button: null
            },
            deliveries: {
                title: 'All Deliveries',
                subtitle: `Manage and track ${adminDeliveries.length} delivery operations`,
                icon: <FaTruck className="text-blue-600" />,
                button: (
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <FaDownload />
                        Export
                    </button>
                )
            },
            earnings: {
                title: 'Delivery Earnings',
                subtitle: 'Track earnings and commissions',
                icon: <FaMoneyBillWave className="text-green-600" />,
                button: (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <FaDownload />
                        Download Report
                    </button>
                )
            },
            performance: {
                title: 'Delivery Performance',
                subtitle: `Monitoring ${deliveryPersons.length} delivery persons`,
                icon: <FaChartLine className="text-yellow-600" />,
                button: (
                    <div className="flex items-center gap-2 text-yellow-600">
                        <FaTrophy />
                        <span className="font-semibold">Performance Analytics</span>
                    </div>
                )
            },
            issues: {
                title: 'Delivery Issues',
                subtitle: `Report and resolve ${deliveryIssues.length} delivery-related issues`,
                icon: <FaExclamationTriangle className="text-red-600" />,
                button: (
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <FaPlus />
                        Report Issue
                    </button>
                )
            }
        };

        return configs[activeTab] || configs.dashboard;
    };

    const headerConfig = getHeaderConfig();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {headerConfig.icon}
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {headerConfig.title}
                                    </h1>
                                    <p className="text-gray-600 mt-1">{headerConfig.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleRefreshAll}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                {headerConfig.button && headerConfig.button}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {renderContent()}
                </div>
            </main>

            {/* Modals */}
            {showAssignModal && selectedDelivery && (
                <DeliveryAssignModal
                    delivery={selectedDelivery}
                    deliveryPersons={deliveryPersons}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}

            {showStatusModal && selectedDelivery && (
                <DeliveryStatusUpdate
                    delivery={selectedDelivery}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            )}

            {showDetailsModal && selectedDelivery && (
                <DeliveryDetailsModal
                    delivery={selectedDelivery}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default Delivery;