// src/components/inventory/Company/CompanyList.jsx
import React, { useEffect, useState } from 'react';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { Link } from 'react-router-dom';
import { FaBuilding, FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import InventoryTable from '../Common/InventoryTable';
import InventorySearch from '../Common/InventorySearch';

const CompanyList = () => {
  const { companies, fetchCompanies, deleteCompany, loading } = useInventoryContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.gst_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const columns = [
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'gst_number', label: 'GST Number', sortable: true },
    { key: 'contact_email', label: 'Email', sortable: true },
    { key: 'contact_phone', label: 'Phone', sortable: true },
    { 
      key: 'created_at', 
      label: 'Created', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const handleDelete = async (company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      await deleteCompany(company.company_id);
      fetchCompanies();
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
            <FaBuilding />
            Companies
          </h1>
          <p className="text-gray-600">Manage your business companies</p>
        </div>
        <Link
          to="/inventory/companies/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaPlus />
          Add Company
        </Link>
      </div>

      <div className="mb-6">
        <InventorySearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search companies by name, GST, or email..."
        />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <InventoryTable
          columns={columns}
          data={filteredCompanies}
          onView={(company) => window.location.href = `/inventory/companies/${company.company_id}`}
          onEdit={(company) => window.location.href = `/inventory/companies/${company.company_id}/edit`}
          onDelete={handleDelete}
        />
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <FaBuilding className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">No companies found</p>
          {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
        </div>
      )}
    </div>
  );
};

export default CompanyList;