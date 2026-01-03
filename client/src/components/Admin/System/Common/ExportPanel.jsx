import React, { useState } from 'react';
import { FiDownload, FiFile, FiFileText, FiSpreadsheet } from 'react-icons/fi';

const ExportPanel = ({
  data,
  filename = 'export',
  formats = ['csv', 'json', 'excel'],
  onExport,
  className = ''
}) => {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <FiFileText /> },
    { value: 'json', label: 'JSON', icon: <FiFile /> },
    { value: 'excel', label: 'Excel', icon: <FiSpreadsheet /> }
  ].filter(option => formats.includes(option.value));

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);
    
    try {
      if (onExport) {
        await onExport(selectedFormat, data);
      } else {
        // Default export implementation
        exportData(selectedFormat, data, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportData = (format, data, filename) => {
    let content, mimeType, extension;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
      case 'csv':
        content = convertToCSV(data);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'excel':
        // For Excel, we'd typically use a library like xlsx
        // This is a simplified version that creates CSV (which Excel can open)
        content = convertToCSV(data);
        mimeType = 'application/vnd.ms-excel';
        extension = 'xls';
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    // Get all unique keys from all objects
    const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Export Data:</span>
          
          <div className="flex space-x-2">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFormat(option.value)}
                disabled={exporting}
                className={`flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedFormat === option.value
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || !data || data.length === 0}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiDownload className={`mr-2 ${exporting ? 'animate-pulse' : ''}`} />
          {exporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Exporting {data?.length || 0} records as {selectedFormat.toUpperCase()}</p>
        {data?.length === 0 && (
          <p className="text-red-600 mt-1">No data available for export</p>
        )}
      </div>
    </div>
  );
};

export default ExportPanel;