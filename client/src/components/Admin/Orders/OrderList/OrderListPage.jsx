import React from 'react';
import { Link } from 'react-router-dom';
import OrdersTable from './OrdersTable';
import './OrderListPage.css';
const OrderListPage = ({ orders, onViewOrder, loading }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
                    <p className="text-gray-600 mt-1">
                        {orders.length} orders found
                    </p>
                </div>
                <div className="flex space-x-4">
                    <Link
                        to="/admin/orders/analytics"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Analytics
                    </Link>
                    <Link
                        to="/admin/orders/returns"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        View Returns
                    </Link>
                </div>
            </div>
            
            <OrdersTable 
                orders={orders}
                onViewOrder={onViewOrder}
                loading={loading}
            />
        </div>
    );
};

export default OrderListPage;