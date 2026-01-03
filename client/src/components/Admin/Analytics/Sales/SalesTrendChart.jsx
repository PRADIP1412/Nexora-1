import React from 'react';

const SalesTrendChart = ({ trends }) => {
    return (
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Sales Trend</h4>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Sales chart visualization</p>
            </div>
        </div>
    );
};

export default SalesTrendChart;