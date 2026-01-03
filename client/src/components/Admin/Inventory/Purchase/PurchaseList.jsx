// src/components/inventory/Purchase/PurchaseList.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaFilter, FaFileInvoice } from 'react-icons/fa';
import InventoryTable from '../Common/InventoryTable';
import InventorySearch from '../Common/InventorySearch';

const PurchaseList = () => {
  const { purchases, fetchPurchases, loading } = useInventoryContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    let filtered = [...purchases];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(purchase =>
        purchase.invoice_number?.toLowerCase().includes(searchLower) ||
        purchase.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    setFilteredPurchases(filtered);
  }, [searchTerm, statusFilter, purchases]);

  const columns = [
    { key: 'invoice_number', label: 'Invoice #', sortable: true },
    { 
      key: 'supplier_id', 
      label: 'Supplier', 
      sortable: true,
      render: (value) => `Supplier #${value}`
    },
    { 
      key: 'total_cost', 
      label: 'Total Cost', 
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
          value === 'RECEIVED' ? 'bg-green-100 text-green-800' :
          value === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'purchase_date', 
      label: 'Purchase Date', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const statusOptions = ['ALL', 'PENDING', 'RECEIVED', 'CANCELLED', 'RETURNED'];

  const getStats = () => {
    const total = purchases.length;
    const pending = purchases.filter(p => p.status === 'PENDING').length;
    const received = purchases.filter(p => p.status === 'RECEIVED').length;
    const totalValue = purchases.reduce((sum, p) => sum + parseFloat(p.total_cost), 0);

    return { total, pending, received, totalValue };
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
            <FaShoppingCart />
            Purchases
          </h1>
          <p className="text-gray-600">Manage purchase orders and invoices</p>
        </div>
        <Link
          to="/inventory/purchases/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          New Purchase
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaShoppingCart className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaFileInvoice className="text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-green-600">{stats.received}</p>
            </div>
            <FaFileInvoice className="text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
            </div>
            <FaFileInvoice className="text-purple-600" />
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
              placeholder="Search by invoice number or notes..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
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

      {/* Purchases Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <InventoryTable
          columns={columns}
          data={filteredPurchases}
          onView={(purchase) => window.location.href = `/inventory/purchases/${purchase.purchase_id}`}
          onEdit={(purchase) => window.location.href = `/inventory/purchases/${purchase.purchase_id}/edit`}
        />
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-12">
          <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No purchases found</p>
          {searchTerm && <p className="text-sm mt-1">Try adjusting your search or filters</p>}
        </div>
      )}
    </div>
  );
};

export default PurchaseList;