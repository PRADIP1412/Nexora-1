import React from 'react';

const DataTable = ({ columns, data, keyField = 'id', onRowClick }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((row) => (
                        <tr 
                            key={row[keyField]} 
                            onClick={() => onRowClick && onRowClick(row)}
                            className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                        >
                            {columns.map((column) => (
                                <td key={column.key} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;