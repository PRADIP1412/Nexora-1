import React, { useState } from 'react';
import { useOrderAdminContext } from '../../../../context/OrderAdminContext';
import './OrderItems.css';

const OrderItems = ({ items, orderId, onUpdate }) => {
    const { updateOrderItemQty, removeOrderItem } = useOrderAdminContext();
    const [editingItem, setEditingItem] = useState(null);
    const [newQty, setNewQty] = useState('');

    const handleEditClick = (item) => {
        setEditingItem(item.variant_id);
        setNewQty(item.quantity);
    };

    const handleSaveQty = async (variantId) => {
        if (newQty && newQty > 0) {
            const result = await updateOrderItemQty(orderId, variantId, parseInt(newQty));
            if (result.success) {
                setEditingItem(null);
                onUpdate();
            }
        }
    };

    const handleRemoveItem = async (variantId) => {
        if (window.confirm('Are you sure you want to remove this item from the order?')) {
            const result = await removeOrderItem(orderId, variantId);
            if (result.success) {
                onUpdate();
            }
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Order Items ({items.length})</h2>
                <div className="text-lg font-medium">
                    Items Total: ${calculateTotal().toFixed(2)}
                </div>
            </div>

            {items.length === 0 ? (
                <p className="text-gray-500">No items in this order.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={`${item.order_id}-${item.variant_id}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.variant?.product?.name || `Variant #${item.variant_id}`}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.variant?.variant_name || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ${parseFloat(item.price).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingItem === item.variant_id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={newQty}
                                                    onChange={(e) => setNewQty(e.target.value)}
                                                    className="w-20 px-2 py-1 border rounded-md"
                                                />
                                                <button
                                                    onClick={() => handleSaveQty(item.variant_id)}
                                                    className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(null)}
                                                    className="px-2 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleEditClick(item)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${parseFloat(item.total).toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveItem(item.variant_id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderItems;