// src/components/inventory/Purchase/PurchaseItemList.jsx
import React from 'react';
import { FaBox, FaDollarSign, FaHashtag } from 'react-icons/fa';

const PurchaseItemList = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <FaBox className="mx-auto text-4xl text-gray-300 mb-2" />
        <p className="text-gray-500">No items in this purchase</p>
      </div>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalCost = items.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="font-bold text-gray-800">Purchase Items</h3>
        <p className="text-sm text-gray-600">{items.length} items, {totalQuantity} total units</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">
                  <FaBox />
                  Variant
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
                  <FaDollarSign />
                  Unit Cost
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <div className="flex items-center gap-1">
                  <FaDollarSign />
                  Total Cost
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
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">${parseFloat(item.cost_per_unit || 0).toFixed(2)}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-green-600">
                    ${parseFloat(item.total_cost || 0).toFixed(2)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className="px-6 py-4 text-right font-medium text-gray-700">
                Total:
              </td>
              <td className="px-6 py-4">
                <p className="text-xl font-bold text-green-600">
                  ${totalCost.toFixed(2)}
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default PurchaseItemList;