// src/components/inventory/Batch/BatchItemList.jsx
import React from 'react';
import { FaBox, FaHashtag, FaInfoCircle } from 'react-icons/fa';

const BatchItemList = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <FaBox className="mx-auto text-4xl text-gray-300 mb-2" />
        <p className="text-gray-500">No items in this batch</p>
      </div>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800">Batch Items</h3>
            <p className="text-sm text-gray-600">{items.length} items, {totalQuantity} total units</p>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <FaInfoCircle />
            <span className="text-sm">These items are part of this batch</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">
                  <FaBox />
                  Variant ID
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">
                  <FaHashtag />
                  Quantity
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">
                  <FaInfoCircle />
                  Details
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">Variant #{item.variant_id}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {item.quantity} units
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    <p>Batch allocation for inventory</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-6 py-4 text-right font-medium text-gray-700">
                Total:
              </td>
              <td className="px-6 py-4">
                <p className="text-xl font-bold text-green-600">
                  {totalQuantity} units
                </p>
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BatchItemList;