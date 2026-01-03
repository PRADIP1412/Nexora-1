import React from 'react';
import StatusBadge from '../common/StatusBadge';
import './OrderDetails.css';

const OrderInfo = ({ order, history }) => {
    if (!order) return null;

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-medium">#{order.order_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Order Status</p>
                                    <p><StatusBadge status={order.order_status} type="order" /></p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <p><StatusBadge status={order.payment_status} type="payment" /></p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p className="font-medium">
                                        {new Date(order.placed_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Coupon Code</p>
                                    <p className="font-medium">{order.coupon_code || 'None'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            {order.user ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{order.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{order.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{order.user.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Customer ID</p>
                                        <p className="font-medium">#{order.user.user_id}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Customer information not available.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${parseFloat(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Discount</span>
                                <span className="font-medium text-red-600">
                                    -${parseFloat(order.discount_amount || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-medium">${parseFloat(order.delivery_fee || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">${parseFloat(order.tax_amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total Amount</span>
                                    <span className="font-bold text-lg">
                                        ${parseFloat(order.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderInfo;