import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
}

export default function ResponsiveTable<T extends { id: string }>({ data, columns }: Props<T>) {
  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="text-left p-3 text-sm font-semibold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="p-3 text-sm">
                    {String(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div key={row.id} className="bg-white rounded-lg shadow p-3">
            {columns.map((col) => (
              <div key={String(col.key)} className="flex justify-between py-1">
                <span className="text-gray-500 text-sm">{col.label}</span>
                <span className="text-sm font-medium">{String(row[col.key])}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
