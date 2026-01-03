// src/components/inventory/Company/CompanyCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const CompanyCard = ({ company, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <FaBuilding className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{company.name}</h3>
            {company.gst_number && (
              <p className="text-sm text-gray-600">GST: {company.gst_number}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/inventory/companies/${company.company_id}`}
            className="p-2 text-blue-600 hover:text-blue-800"
            title="View"
          >
            <FaEye />
          </Link>
          <button
            onClick={() => onEdit(company)}
            className="p-2 text-green-600 hover:text-green-800"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(company)}
            className="p-2 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {company.address_line && (
          <div className="flex items-start gap-2 text-gray-600">
            <FaMapMarkerAlt className="mt-1" />
            <p className="text-sm">{company.address_line}</p>
          </div>
        )}
        
        {company.contact_email && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaEnvelope />
            <p className="text-sm">{company.contact_email}</p>
          </div>
        )}
        
        {company.contact_phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaPhone />
            <p className="text-sm">{company.contact_phone}</p>
          </div>
        )}
        
        {company.website && (
          <div className="flex items-center gap-2 text-gray-600">
            <FaGlobe />
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
              {company.website}
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">
            Created: {new Date(company.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link
          to={`/inventory/companies/${company.company_id}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;