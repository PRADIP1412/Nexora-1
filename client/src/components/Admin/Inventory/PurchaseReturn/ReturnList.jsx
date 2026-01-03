// src/components/inventory/PurchaseReturn/ReturnList.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaPlus, FaFileInvoice } from 'react-icons/fa';
import InventoryTable from '../Common/InventoryTable';
import InventorySearch from '../Common/InventorySearch';

const ReturnList = () => {
  const { purchaseReturns, fetchPurchaseReturns, loading } = useInventoryContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPurchaseReturns();
  }, []);

  useEffect(() => {
    let filtered = [...purchaseReturns];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(returnItem =>
        returnItem.reason?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(returnItem => returnItem.status === statusFilter);
    }

    setFilteredReturns(filtered);
  }, [searchTerm, statusFilter, purchaseReturns]);

  const columns = [
    { key: 'return_id', label: 'Return ID', sortable: true },
    { 
      key: 'purchase_id', 
      label: 'Purchase ID', 
      sortable: true,
      render: (value) => `Purchase #${value}`
    },
    { key: 'reason', label: 'Reason', sortable: true },
    { 
      key: 'total_refund', 
      label: 'Refund Amount', 
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'APPROVED' ? 'bg-green-100 text-green-800' :
          value === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'return_date', 
      label: 'Return Date', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'];

  const getStats = () => {
    const total = purchaseReturns.length;
    const pending = purchaseReturns.filter(r => r.status === 'PENDING').length;
    const totalRefund = purchaseReturns.reduce((sum, r) => sum + parseFloat(r.total_refund), 0);

    return { total, pending, totalRefund };
  };

  const stats = getStats();

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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaExchangeAlt />
            Purchase Returns
          </h1>
          <p className="text-gray-600">Manage purchase returns and refunds</p>
        </div>
        <Link
          to="/inventory/returns/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          New Return
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaExchangeAlt className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Returns</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaFileInvoice className="text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Refund</p>
              <p className="text-2xl font-bold">${stats.totalRefund.toFixed(2)}</p>
            </div>
            <FaFileInvoice className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <InventorySearch
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by reason..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  Status: {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <InventoryTable
          columns={columns}
          data={filteredReturns}
          onView={(returnItem) => window.location.href = `/inventory/returns/${returnItem.return_id}`}
        />
      </div>

      {filteredReturns.length === 0 && (
        <div className="text-center py-12">
          <FaExchangeAlt className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No returns found</p>
          {searchTerm && <p className="text-sm mt-1">Try adjusting your search or filters</p>}
        </div>
      )}
    </div>
  );
};

export default ReturnList;