// src/components/inventory/Stock/StockSummary.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaBox, FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';
import VariantStockCard from './VariantStockCard';

const StockSummary = () => {
  const { stockSummary, fetchStockSummary, loading } = useInventoryContext();
  const [filteredStock, setFilteredStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStockSummary();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stockSummary.filter(item =>
        item.variant_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStock(filtered);
    } else {
      setFilteredStock(stockSummary);
    }
  }, [searchTerm, stockSummary]);

  const totalValue = stockSummary.reduce((sum, item) => {
    const value = item.total_value || (item.current_stock * (item.average_cost || 0));
    return sum + value;
  }, 0);

  const lowStockItems = stockSummary.filter(item => item.current_stock < 10).length;
  const outOfStockItems = stockSummary.filter(item => item.current_stock === 0).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">{stockSummary.length}</p>
            </div>
            <FaBox className="text-blue-600 text-2xl" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-800">
                ${typeof totalValue === 'number' && !isNaN(totalValue) 
                    ? totalValue.toFixed(2) 
                    : '0.00'}
                </p>
            </div>
            <FaArrowUp className="text-green-600 text-2xl" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-800">{lowStockItems}</p>
            </div>
            <FaExclamationTriangle className="text-yellow-600 text-2xl" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-800">{outOfStockItems}</p>
            </div>
            <FaArrowDown className="text-red-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search variants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStock.length > 0 ? (
          filteredStock.map((item) => (
            <VariantStockCard key={item.variant_id} item={item} />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <FaBox className="mx-auto text-4xl text-gray-300 mb-2" />
            <p>No stock items found</p>
            {searchTerm && <p>Try adjusting your search term</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSummary;