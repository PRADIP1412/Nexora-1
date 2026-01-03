import React, { useEffect, useState } from 'react';
import { useOrderAdminContext } from '../../../context/OrderAdminContext';
import DeliveryInfo from '../../../components/Admin/Orders/Delivery/DeliveryInfo';
import DeliveryModals from '../../../components/Admin/Orders/Delivery/DeliveryModals';
import './DeliveryManagement.css';
const DeliveryManagement = () => {
    const { 
        orders, 
        loading, 
        error, 
        fetchAllOrders, 
        clearError 
    } = useOrderAdminContext();
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionType, setActionType] = useState('');
    const [deliveryOrders, setDeliveryOrders] = useState([]);

    useEffect(() => {
        fetchAllOrders();
    }, []);

    useEffect(() => {
        if (orders.length > 0) {
            // Filter orders that need delivery management
            const deliveryOrders = orders.filter(order => 
                ['PLACED', 'PROCESSING', 'SHIPPED'].includes(order.order_status)
            );
            setDeliveryOrders(deliveryOrders);
        }
    }, [orders]);

    const handleAssign = (order) => {
        setSelectedOrder(order);
        setActionType('assign');
    };

    const handleUpdate = (order) => {
        setSelectedOrder(order);
        setActionType('update');
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setActionType('view');
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setActionType('');
    };

    const handleActionComplete = () => {
        handleCloseModal();
        fetchAllOrders();
    };

    if (loading && !orders.length) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading delivery orders...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-gray-600 mt-2">Assign and track delivery personnel</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveryOrders.map((order) => (
                    <div key={order.order_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <DeliveryInfo 
                            order={order}
                            onAssign={() => handleAssign(order)}
                            onUpdate={() => handleUpdate(order)}
                            onViewDetails={() => handleViewDetails(order)}
                        />
                    </div>
                ))}
                
                {deliveryOrders.length === 0 && !loading && (
                    <div className="col-span-full">
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">No Orders Requiring Delivery</h3>
                            <p className="text-gray-600">All orders are either delivered, cancelled, or already assigned.</p>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <DeliveryModals 
                    order={selectedOrder}
                    actionType={actionType}
                    onClose={handleCloseModal}
                    onActionComplete={handleActionComplete}
                />
            )}
        </div>
    );
};

export default DeliveryManagement;