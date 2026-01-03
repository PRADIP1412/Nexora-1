import React, { useState } from 'react';
import { FaFileExport, FaFileCsv, FaFileExcel, FaFilePdf, FaSpinner, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify'; // If you're using toast notifications

const ExportControls = ({
  onExport,
  formats = ['csv', 'excel'],
  loading = false,
  fileName = 'report',
  className = '',
  disabled = false,
  exportData = null
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <FaFileCsv className="text-green-600" /> },
    { value: 'excel', label: 'Excel', icon: <FaFileExcel className="text-green-700" /> },
    { value: 'pdf', label: 'PDF', icon: <FaFilePdf className="text-red-600" /> },
    { value: 'json', label: 'JSON', icon: <FaFileAlt className="text-blue-600" /> },
  ];

  const availableFormats = formatOptions.filter(f => formats.includes(f.value));

  const handleExport = async (format) => {
    if (disabled || loading || isExporting) {
      toast.warn('Please wait, another operation is in progress');
      return;
    }
    
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport(format, exportData);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = () => {
    const defaultFormat = availableFormats[0]?.value || 'csv';
    handleExport(defaultFormat);
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Export:</span>
        <button
          onClick={handleQuickExport}
          disabled={disabled || loading || isExporting}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <FaFileExport className="mr-2" />
              Export {availableFormats[0]?.label || 'CSV'}
            </>
          )}
        </button>
      </div>
      
      {availableFormats.length > 1 && (
        <div className="flex items-center space-x-2 border-l pl-4">
          <span className="text-sm text-gray-600">Other formats:</span>
          <div className="flex space-x-2">
            {availableFormats.slice(1).map((format) => (
              <button
                key={format.value}
                onClick={() => handleExport(format.value)}
                disabled={disabled || loading || isExporting}
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={`Export as ${format.label}`}
              >
                {format.icon}
                <span className="ml-1 text-sm">{format.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {fileName && (
        <div className="text-sm text-gray-500 italic">
          File: {fileName}
        </div>
      )}
    </div>
  );
};

export default ExportControls;