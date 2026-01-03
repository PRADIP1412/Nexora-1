import React from 'react';

const StockStatusCard = ({ product }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'OUT_OF_STOCK': return 'bg-red-500';
            case 'LOW_STOCK': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'OUT_OF_STOCK': return 'Out of Stock';
            case 'LOW_STOCK': return 'Low Stock';
            default: return 'In Stock';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-medium text-gray-900">{product.product_name}</h4>
                    <p className="text-sm text-gray-500">{product.variant_name}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(product.status)}`}></div>
            </div>
            
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-2xl font-bold text-gray-900">{product.current_stock}</div>
                    <div className="text-sm text-gray-600">Units in stock</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'OUT_OF_STOCK' 
                        ? 'bg-red-100 text-red-800'
                        : product.status === 'LOW_STOCK'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                }`}>
                    {getStatusText(product.status)}
                </span>
            </div>
        </div>
    );
};

export default StockStatusCard;