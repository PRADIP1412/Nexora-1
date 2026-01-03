// src/components/inventory/Batch/BatchList.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { Link } from 'react-router-dom';
import { FaTags, FaPlus, FaCalendar, FaBox } from 'react-icons/fa';
import InventoryTable from '../Common/InventoryTable';
import InventorySearch from '../Common/InventorySearch';

const BatchList = () => {
  const { batches, fetchBatches, loading } = useInventoryContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBatches, setFilteredBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = batches.filter(batch =>
        batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches(batches);
    }
  }, [searchTerm, batches]);

  const columns = [
    { key: 'batch_number', label: 'Batch Number', sortable: true },
    { 
      key: 'purchase_id', 
      label: 'Purchase ID', 
      sortable: true,
      render: (value) => `Purchase #${value}`
    },
    { 
      key: 'manufactured_at', 
      label: 'Manufactured', 
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'expires_at', 
      label: 'Expires', 
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const getStats = () => {
    const total = batches.length;
    const expired = batches.filter(batch => {
      if (!batch.expires_at) return false;
      return new Date(batch.expires_at) < new Date();
    }).length;

    return { total, expired };
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
            <FaTags />
            Product Batches
          </h1>
          <p className="text-gray-600">Manage product batches and expiration dates</p>
        </div>
        <Link
          to="/inventory/batches/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          New Batch
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Batches</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaTags className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Batches</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <FaCalendar className="text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Batches</p>
              <p className="text-2xl font-bold text-green-600">{stats.total - stats.expired}</p>
            </div>
            <FaBox className="text-green-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <InventorySearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by batch number..."
        />
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <InventoryTable
          columns={columns}
          data={filteredBatches}
          onView={(batch) => window.location.href = `/inventory/batches/${batch.batch_id}`}
          onEdit={(batch) => window.location.href = `/inventory/batches/${batch.batch_id}/edit`}
        />
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12">
          <FaTags className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No batches found</p>
          {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
        </div>
      )}
    </div>
  );
};

export default BatchList;