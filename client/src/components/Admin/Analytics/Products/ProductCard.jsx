import React from 'react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-medium text-gray-900 truncate">{product.product_name}</h4>
                    {product.variant_name && (
                        <p className="text-sm text-gray-500">{product.variant_name}</p>
                    )}
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    #{product.variant_id}
                </span>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sold:</span>
                    <span className="font-semibold">{product.total_sold}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="font-semibold text-green-600">${product.total_revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`font-semibold ${
                        product.stock_quantity === 0 ? 'text-red-600' : 
                        product.stock_quantity <= 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                        {product.stock_quantity} units
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;