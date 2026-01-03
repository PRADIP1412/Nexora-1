import React from 'react';

const InventorySummary = ({ alerts }) => {
    const outOfStock = alerts.filter(a => a.status === 'OUT_OF_STOCK').length;
    const lowStock = alerts.filter(a => a.status === 'LOW_STOCK').length;
    const totalAlerts = outOfStock + lowStock;

    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Inventory Summary</h4>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-red-600 font-bold">!</span>
                        </div>
                        <div>
                            <div className="font-bold text-red-800">{outOfStock}</div>
                            <div className="text-sm text-red-600">Out of Stock</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-yellow-600 font-bold">!</span>
                        </div>
                        <div>
                            <div className="font-bold text-yellow-800">{lowStock}</div>
                            <div className="text-sm text-yellow-600">Low Stock</div>
                        </div>
                    </div>
                </div>
                <div className="text-center text-sm text-gray-500">
                    {totalAlerts} products need attention
                </div>
            </div>
        </div>
    );
};

export default InventorySummary;