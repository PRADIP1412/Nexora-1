import React, { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaExclamationTriangle } from 'react-icons/fa';
import {
  safeToLocaleString,
  safeFormatDollar,
  safeFormatPercent,
  safeFormatRating
} from '../../../../utils/safeRender';

const ReportTable = ({
  data = [],
  columns = [],
  title = '',
  sortable = true,
  onSort,
  sortField = '',
  sortDirection = 'asc',
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  showPagination = true,
  pageSize = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localSortField, setLocalSortField] = useState(sortField);
  const [localSortDirection, setLocalSortDirection] = useState(sortDirection);

  // ✅ Normalize incoming data
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(row => {
      const normalized = {};
      Object.keys(row || {}).forEach(key => {
        const val = row[key];
        if (typeof val === 'number') {
          normalized[key] = isNaN(val) ? 0 : val;
        } else if (val === null || val === undefined) {
          normalized[key] = '';
        } else {
          normalized[key] = val;
        }
      });
      return normalized;
    });
  }, [data]);

  const totalPages = Math.ceil(safeData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (!showPagination) return safeData;
    const startIndex = (currentPage - 1) * pageSize;
    return safeData.slice(startIndex, startIndex + pageSize);
  }, [safeData, currentPage, pageSize, showPagination]);

  const handleSort = (field) => {
    if (!sortable) return;
    let dir = 'asc';
    if (localSortField === field) {
      dir = localSortDirection === 'asc' ? 'desc' : 'asc';
    }
    setLocalSortField(field);
    setLocalSortDirection(dir);
    onSort && onSort(field, dir);
  };

  const renderSortIcon = (field) => {
    if (!sortable) return null;
    if (localSortField === field) {
      return localSortDirection === 'asc'
        ? <FaSortUp className="ml-1 text-blue-600" />
        : <FaSortDown className="ml-1 text-blue-600" />;
    }
    return <FaSort className="ml-1 text-gray-300" />;
  };

  // ✅ BULLETPROOF CELL RENDERER
  const renderCellValue = (value, column, row) => {
    const safeValue =
      typeof value === 'number'
        ? (isNaN(value) ? 0 : value)
        : value ?? '';

    if (column.render) {
      try {
        return column.render(safeValue, row);
      } catch (err) {
        console.error('Error rendering cell:', err);
        return '-';
      }
    }

    if (typeof safeValue === 'number') {
      if (/amount|price|revenue|total|value/i.test(column.field)) {
        return safeFormatDollar(safeValue);
      }
      if (/percent|rate/i.test(column.field)) {
        return safeFormatPercent(safeValue);
      }
      if (/rating/i.test(column.field)) {
        return safeFormatRating(safeValue);
      }
      return safeToLocaleString(safeValue);
    }

    if (typeof safeValue === 'boolean') {
      return safeValue ? 'Yes' : 'No';
    }

    return safeValue || '-';
  };

  /* loading / error / empty unchanged */
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load</div>;
  if (!safeData.length) return <div className="p-6">{emptyMessage}</div>;

  return (
    <div className={`bg-white rounded-xl border ${className}`}>
      {title && <div className="px-6 py-4 font-semibold">{title}</div>}

      <table className="min-w-full divide-y">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.field} onClick={() => handleSort(col.field)}>
                {col.header} {renderSortIcon(col.field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.field}>
                  {renderCellValue(row[col.field], col, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
