import React, { useEffect, useState } from 'react';
import { useOrderAdminContext } from '../../../context/OrderAdminContext';
import RefundsList from '../../../components/Admin/Orders/Refunds/Refunds';
import RefundModals from '../../../components/Admin/Orders/Refunds/RefundModals';
import './Refunds.css';
const Refunds = () => {
    const { 
        refunds, 
        loading, 
        error, 
        fetchAllRefunds, 
        clearError 
    } = useOrderAdminContext();
    
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [actionType, setActionType] = useState('');

    useEffect(() => {
        fetchAllRefunds();
    }, []);

    const handleUpdateStatus = (refund) => {
        setSelectedRefund(refund);
        setActionType('update');
    };

    const handleRetry = (refund) => {
        setSelectedRefund(refund);
        setActionType('retry');
    };

    const handleViewDetails = (refund) => {
        setSelectedRefund(refund);
        setActionType('view');
    };

    const handleCloseModal = () => {
        setSelectedRefund(null);
        setActionType('');
    };

    const handleActionComplete = () => {
        handleCloseModal();
        fetchAllRefunds();
    };

    if (loading && !refunds.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading refunds...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
                <p className="text-gray-600 mt-2">Process and track refunds</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex justify-between items-center">
                        <p className="text-red-700">{error}</p>
                        <button 
                            onClick={clearError}
                            className="text-red-700 hover:text-red-900"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <RefundsList 
                    refunds={refunds}
                    onUpdateStatus={handleUpdateStatus}
                    onRetry={handleRetry}
                    onViewDetails={handleViewDetails}
                    loading={loading}
                />
            </div>

            {selectedRefund && (
                <RefundModals 
                    refund={selectedRefund}
                    actionType={actionType}
                    onClose={handleCloseModal}
                    onActionComplete={handleActionComplete}
                />
            )}
        </div>
    );
};

export default Refunds;