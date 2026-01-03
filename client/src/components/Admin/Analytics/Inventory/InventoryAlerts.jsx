import React from 'react';

const InventoryAlerts = ({ alerts }) => {
    const outOfStock = alerts.filter(a => a.status === 'OUT_OF_STOCK');
    const lowStock = alerts.filter(a => a.status === 'LOW_STOCK');

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Inventory Alerts</h2>
                <div className="flex space-x-2">
                    {outOfStock.length > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                            {outOfStock.length} Out of Stock
                        </span>
                    )}
                    {lowStock.length > 0 && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                            {lowStock.length} Low Stock
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.variant_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                            <div className="font-medium text-gray-900">{alert.product_name}</div>
                            {alert.variant_name && (
                                <div className="text-sm text-gray-500">Variant: {alert.variant_name}</div>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className={`text-lg font-bold ${
                                    alert.status === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                    {alert.current_stock} units
                                </div>
                                <div className="text-sm text-gray-500">Current stock</div>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    alert.status === 'OUT_OF_STOCK'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {alert.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Low Stock'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryAlerts;