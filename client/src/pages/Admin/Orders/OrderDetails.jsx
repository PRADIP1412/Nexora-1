import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderAdminContext } from '../../../context/OrderAdminContext';
import OrderInfo from '../../../components/Admin/Orders/OrderDetail/OrderDetails';
import OrderItems from '../../../components/Admin/Orders/OrderDetail/OrderItems';
import OrderModals from '../../../components/Admin/Orders/OrderDetail/OrderModals';
import StatusBadge from '../../../components/Admin/Orders/common/StatusBadge';
import './OrderDetails.css';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { 
        currentOrder, 
        loading, 
        error, 
        fetchOrderById, 
        fetchOrderItems,
        fetchOrderHistory,
        clearError,
        clearCurrentOrder 
    } = useOrderAdminContext();
    
    const [activeTab, setActiveTab] = useState('details');
    const [orderItems, setOrderItems] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);

    useEffect(() => {
        if (orderId) {
            fetchOrderById(orderId);
            loadOrderItems();
            loadOrderHistory();
        }
        
        return () => {
            clearCurrentOrder();
        };
    }, [orderId]);

    const loadOrderItems = async () => {
        const result = await fetchOrderItems(orderId);
        if (result.success) {
            setOrderItems(result.data);
        }
    };

    const loadOrderHistory = async () => {
        const result = await fetchOrderHistory(orderId);
        if (result.success) {
            setOrderHistory(result.data);
        }
    };

    const handleBack = () => {
        navigate('/admin/orders');
    };

    if (loading && !currentOrder) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading order details...</div>
            </div>
        );
    }

    if (!currentOrder && !loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    ← Back to Orders
                </button>
                
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Order #{currentOrder?.order_id}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <StatusBadge status={currentOrder?.order_status} type="order" />
                            <span className="text-gray-600">
                                Placed on {new Date(currentOrder?.placed_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    
                    <OrderModals 
                        order={currentOrder}
                        onUpdate={loadOrderItems}
                    />
                </div>
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

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {['details', 'items', 'history', 'delivery', 'issues', 'feedback'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {activeTab === 'details' && (
                    <OrderInfo 
                        order={currentOrder}
                        history={orderHistory}
                    />
                )}
                
                {activeTab === 'items' && (
                    <OrderItems 
                        items={orderItems}
                        orderId={orderId}
                        onUpdate={loadOrderItems}
                    />
                )}
                
                {activeTab === 'history' && (
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Order History</h2>
                        {orderHistory.length > 0 ? (
                            <div className="space-y-4">
                                {orderHistory.map((history) => (
                                    <div key={history.history_id} className="border-l-4 border-blue-500 pl-4 py-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{history.status}</span>
                                            <span className="text-gray-500 text-sm">
                                                {new Date(history.updated_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            Updated by: {history.updated_by || 'System'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No history available for this order.</p>
                        )}
                    </div>
                )}
                
                {activeTab === 'delivery' && (
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">Delivery Address</h3>
                                {currentOrder?.address ? (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p>{currentOrder.address.street}</p>
                                        <p>{currentOrder.address.city}, {currentOrder.address.state}</p>
                                        <p>{currentOrder.address.postal_code}</p>
                                        <p>{currentOrder.address.country}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No address information available.</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">Delivery Status</h3>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <StatusBadge status={currentOrder?.order_status} type="order" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        Delivery Person: {currentOrder?.delivery_user_id ? `User #${currentOrder.delivery_user_id}` : 'Not assigned'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'issues' && (
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Issues</h2>
                        <p className="text-gray-500">No issues reported for this order.</p>
                    </div>
                )}
                
                {activeTab === 'feedback' && (
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Customer Feedback</h2>
                        <p className="text-gray-500">No feedback available for this order.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;