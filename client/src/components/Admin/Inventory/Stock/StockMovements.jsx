// src/components/inventory/Stock/StockMovements.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaFilter, FaDownload } from 'react-icons/fa';
import InventoryFilters from '../Common/InventoryFilters';

const StockMovements = () => {
  const { stockMovements, fetchStockMovements, loading } = useInventoryContext();
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    type: '',
    status: ''
  });

  useEffect(() => {
    fetchStockMovements();
  }, []);

  useEffect(() => {
    let filtered = [...stockMovements];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(movement =>
        movement.remark?.toLowerCase().includes(searchLower) ||
        movement.reference_type?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(movement => movement.movement_type === filters.type);
    }

    // Apply date filter
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(movement => new Date(movement.moved_at) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(movement => new Date(movement.moved_at) <= end);
    }

    setFilteredMovements(filtered);
  }, [stockMovements, filters]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        search: '',
        startDate: '',
        endDate: '',
        type: '',
        status: ''
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'IN':
        return <FaArrowUp className="text-green-600" />;
      case 'OUT':
        return <FaArrowDown className="text-red-600" />;
      case 'RETURN':
        return <FaExchangeAlt className="text-blue-600" />;
      default:
        return <FaExchangeAlt className="text-gray-600" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'IN':
        return 'text-green-700 bg-green-50';
      case 'OUT':
        return 'text-red-700 bg-red-50';
      case 'RETURN':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Movements</h1>
          <p className="text-gray-600">Track all inventory movements and transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FaDownload />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <InventoryFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => (
                  <tr key={movement.movement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(movement.moved_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                        {getMovementIcon(movement.movement_type)}
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium">Variant #{movement.variant_id}</p>
                        <p className="text-sm text-gray-500">Cost: ${movement.unit_cost || '0.00'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${movement.movement_type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.movement_type === 'IN' ? '+' : '-'}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium">{movement.reference_type}</p>
                        <p className="text-xs text-gray-500">ID: {movement.reference_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {movement.remark || 'No remarks'}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FaFilter className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p>No movements found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Total Movements</p>
          <p className="text-2xl font-bold">{filteredMovements.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Inbound</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredMovements.filter(m => m.movement_type === 'IN').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-gray-600">Outbound</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredMovements.filter(m => m.movement_type === 'OUT').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockMovements;