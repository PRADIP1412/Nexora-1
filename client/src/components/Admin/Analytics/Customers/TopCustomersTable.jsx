import React from 'react';

const TopCustomersTable = ({ customers }) => {
    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Top Customers</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="text-left text-xs text-gray-500 uppercase">Customer</th>
                            <th className="text-left text-xs text-gray-500 uppercase">Orders</th>
                            <th className="text-left text-xs text-gray-500 uppercase">Spent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.user_id} className="border-t">
                                <td className="py-3">
                                    <div>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-gray-500">{customer.email}</div>
                                    </div>
                                </td>
                                <td className="py-3">{customer.total_orders}</td>
                                <td className="py-3 font-semibold">${customer.total_spent.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopCustomersTable;