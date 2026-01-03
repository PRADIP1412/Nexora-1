// src/components/inventory/Supplier/SupplierList.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { Link } from 'react-router-dom';
import { FaTruck, FaPlus, FaBuilding, FaPhone, FaEnvelope } from 'react-icons/fa';
import InventoryTable from '../Common/InventoryTable';
import InventorySearch from '../Common/InventorySearch';

const SupplierList = () => {
  const { suppliers, fetchSuppliers, deleteSupplier, loading } = useInventoryContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchTerm, suppliers]);

  const columns = [
    { key: 'name', label: 'Supplier Name', sortable: true },
    { 
      key: 'company_id', 
      label: 'Company', 
      sortable: true,
      render: (value) => `Company #${value}`
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { 
      key: 'is_active', 
      label: 'Status', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const handleDelete = async (supplier) => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      await deleteSupplier(supplier.supplier_id);
      fetchSuppliers();
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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaTruck />
            Suppliers
          </h1>
          <p className="text-gray-600">Manage your suppliers and vendors</p>
        </div>
        <Link
          to="/inventory/suppliers/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          Add Supplier
        </Link>
      </div>

      <div className="mb-6">
        <InventorySearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search suppliers by name, email, or phone..."
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
            <FaTruck className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.is_active).length}
              </p>
            </div>
            <FaBuilding className="text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold">
                {[...new Set(suppliers.map(s => s.company_id))].length}
              </p>
            </div>
            <FaBuilding className="text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <InventoryTable
          columns={columns}
          data={filteredSuppliers}
          onView={(supplier) => window.location.href = `/inventory/suppliers/${supplier.supplier_id}`}
          onEdit={(supplier) => window.location.href = `/inventory/suppliers/${supplier.supplier_id}/edit`}
          onDelete={handleDelete}
        />
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <FaTruck className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No suppliers found</p>
          {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
        </div>
      )}
    </div>
  );
};

export default SupplierList;