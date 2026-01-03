import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const ReportCategoryCard = ({ 
  icon,
  label,
  description = '',
  count = null,
  isActive = false,
  onClick,
  className = ''
}) => {
  const getIcon = () => {
    if (typeof icon === 'string') {
      return <span className="text-2xl">{icon}</span>;
    }
    return icon;
  };

  const getCountColor = () => {
    if (count === null) return '';
    if (count > 10) return 'bg-red-500 text-white';
    if (count > 5) return 'bg-yellow-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg mr-3 ${
            isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h3 className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
              {label}
            </h3>
            {description && (
              <p className="text-xs text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {count !== null && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCountColor()}`}>
              {count}
            </span>
          )}
          <FaChevronRight className={`text-gray-400 ${isActive ? 'text-blue-500' : ''}`} />
        </div>
      </div>
      
      {isActive && (
        <div className="mt-2 pt-2 border-t border-blue-200">
          <div className="flex items-center text-xs text-blue-600">
            <div className="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
            <span className="ml-2">Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCategoryCard;