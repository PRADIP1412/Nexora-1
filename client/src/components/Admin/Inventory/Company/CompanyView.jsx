// src/components/inventory/Company/CompanyView.jsx
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useInventoryContext } from '../../../../context/InventoryContext';
import { 
  FaBuilding, FaEnvelope, FaPhone, FaGlobe, 
  FaMapMarkerAlt, FaCalendar, FaEdit, FaTrash, 
  FaArrowLeft, FaTruck 
} from 'react-icons/fa';

const CompanyView = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { currentCompany, fetchCompanyById, deleteCompany, loading } = useInventoryContext();

  useEffect(() => {
    if (companyId) {
      fetchCompanyById(parseInt(companyId));
    }
  }, [companyId]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${currentCompany.name}?`)) {
      await deleteCompany(parseInt(companyId));
      navigate('/inventory/companies');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="text-center py-12">
        <FaBuilding className="mx-auto text-4xl text-gray-300 mb-3" />
        <p className="text-gray-500">Company not found</p>
        <Link to="/inventory/companies" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/inventory/companies"
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBuilding />
              {currentCompany.name}
            </h1>
            <p className="text-gray-600">Company Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/inventory/companies/${companyId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaEdit />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaTrash />
            Delete
          </button>
        </div>
      </div>

      {/* Company Details Card */}
      <div className="bg-white rounded-lg border overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaBuilding />
                Company Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium">{currentCompany.name}</p>
                </div>
                {currentCompany.gst_number && (
                  <div>
                    <p className="text-sm text-gray-600">GST Number</p>
                    <p className="font-medium">{currentCompany.gst_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Area ID</p>
                  <p className="font-medium">{currentCompany.area_id}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPhone />
                Contact Information
              </h3>
              <div className="space-y-3">
                {currentCompany.contact_email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{currentCompany.contact_email}</p>
                    </div>
                  </div>
                )}
                {currentCompany.contact_phone && (
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{currentCompany.contact_phone}</p>
                    </div>
                  </div>
                )}
                {currentCompany.website && (
                  <div className="flex items-center gap-2">
                    <FaGlobe className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a 
                        href={currentCompany.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {currentCompany.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {currentCompany.address_line && (
              <div className="md:col-span-2">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Address
                </h3>
                <p className="text-gray-700">{currentCompany.address_line}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaCalendar />
                <span>
                  Created: {new Date(currentCompany.created_at).toLocaleDateString()}
                </span>
              </div>
              {currentCompany.updated_at && (
                <div className="flex items-center gap-1">
                  <FaCalendar />
                  <span>
                    Updated: {new Date(currentCompany.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <Link
              to={`/inventory/suppliers?company=${companyId}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <FaTruck />
              View Suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* Related Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Suppliers</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Active Purchases</span>
              <span className="font-bold">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Value</span>
              <span className="font-bold">$0.00</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-gray-800 mb-4">Actions</h3>
          <div className="space-y-3">
            <Link
              to="/inventory/suppliers/new"
              className="block p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-center"
            >
              Add Supplier
            </Link>
            <Link
              to="/inventory/purchases/new"
              className="block p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-center"
            >
              Create Purchase Order
            </Link>
            <button
              onClick={() => navigate('/inventory/companies')}
              className="block w-full p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 text-center"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyView;