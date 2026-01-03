import React, { useEffect, useState } from 'react';
import { useOrderAdminContext } from '../../../context/OrderAdminContext';
import ReturnsList from '../../../components/Admin/Orders/Returns/Returns';
import ReturnModals from '../../../components/Admin/Orders/Returns/ReturnModals';
import './Returns.css';

const Returns = () => {
    const { 
        returns, 
        loading, 
        error, 
        fetchAllReturns, 
        clearError 
    } = useOrderAdminContext();
    
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [actionType, setActionType] = useState('');

    useEffect(() => {
        fetchAllReturns();
    }, []);

    const handleApprove = (returnItem) => {
        setSelectedReturn(returnItem);
        setActionType('approve');
    };

    const handleReject = (returnItem) => {
        setSelectedReturn(returnItem);
        setActionType('reject');
    };

    const handleViewItems = (returnItem) => {
        setSelectedReturn(returnItem);
        setActionType('view');
    };

    const handleCloseModal = () => {
        setSelectedReturn(null);
        setActionType('');
    };

    const handleActionComplete = () => {
        handleCloseModal();
        fetchAllReturns();
    };

    if (loading && !returns.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading returns...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Return Requests</h1>
                <p className="text-gray-600 mt-2">Manage customer return requests</p>
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
                <ReturnsList 
                    returns={returns}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewItems={handleViewItems}
                    loading={loading}
                />
            </div>

            {selectedReturn && (
                <ReturnModals 
                    returnItem={selectedReturn}
                    actionType={actionType}
                    onClose={handleCloseModal}
                    onActionComplete={handleActionComplete}
                />
            )}
        </div>
    );
};

export default Returns;