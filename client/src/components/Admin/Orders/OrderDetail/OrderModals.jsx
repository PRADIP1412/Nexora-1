import React, { useState } from 'react';
import { useOrderAdminContext } from '../../../../context/OrderAdminContext';
import './OrderModals.css';

const OrderModals = ({ order, onUpdate }) => {
    const { updateOrder, cancelOrder, addOrderHistory } = useOrderAdminContext();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [updateData, setUpdateData] = useState({
        order_status: order?.order_status || '',
        payment_status: order?.payment_status || '',
        delivery_fee: order?.delivery_fee || 0,
        tax_amount: order?.tax_amount || 0
    });
    const [newStatus, setNewStatus] = useState('');

    const handleUpdateOrder = async () => {
        const result = await updateOrder(order.order_id, updateData);
        if (result.success) {
            setShowUpdateModal(false);
            onUpdate();
        }
    };

    const handleCancelOrder = async () => {
        const result = await cancelOrder(order.order_id);
        if (result.success) {
            setShowCancelModal(false);
            onUpdate();
        }
    };

    const handleAddHistory = async () => {
        if (newStatus) {
            const result = await addOrderHistory(order.order_id, newStatus);
            if (result.success) {
                setShowHistoryModal(false);
                setNewStatus('');
                onUpdate();
            }
        }
    };

    return (
        <>
            <div className="flex space-x-3">
                <button
                    onClick={() => setShowUpdateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Update Order
                </button>
                <button
                    onClick={() => setShowHistoryModal(true)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                    Add History
                </button>
                {order?.order_status !== 'CANCELLED' && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Cancel Order
                    </button>
                )}
            </div>

            {/* Update Order Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Update Order</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Order Status</label>
                                <select
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={updateData.order_status}
                                    onChange={(e) => setUpdateData({...updateData, order_status: e.target.value})}
                                >
                                    <option value="PLACED">Placed</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                                <select
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    value={updateData.payment_status}
                                    onChange={(e) => setUpdateData({...updateData, payment_status: e.target.value})}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="FAILED">Failed</option>
                                    <option value="REFUNDED">Refunded</option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleUpdateOrder}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Cancel Order</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancelOrder}
                                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                            >
                                Yes, Cancel Order
                            </button>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                            >
                                No, Keep Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Add Order History</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Enter status update"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleAddHistory}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                                >
                                    Add History
                                </button>
                                <button
                                    onClick={() => setShowHistoryModal(false)}
                                    className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderModals;