import React from 'react';

const ProductPerformance = ({ performance }) => {
    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Product Performance</h4>
            <div className="space-y-4">
                {performance.map((product) => (
                    <div key={product.variant_id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h5 className="font-medium text-gray-900">{product.product_name}</h5>
                                <p className="text-sm text-gray-500">{product.variant_name}</p>
                            </div>
                            <span className="text-sm font-semibold">
                                {product.conversion_rate.toFixed(1)}% conversion
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="text-lg font-bold text-blue-600">{product.views}</div>
                                <div className="text-xs text-gray-500">Views</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-yellow-600">{product.cart_adds}</div>
                                <div className="text-xs text-gray-500">Cart Adds</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-green-600">{product.purchases}</div>
                                <div className="text-xs text-gray-500">Purchases</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductPerformance;