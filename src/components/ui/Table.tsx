import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="w-full space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-slate-800/40 rounded-xl animate-pulse border border-slate-800"
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium text-sm">No data found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-4">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`group transition-colors duration-150 ${
                onRowClick ? 'cursor-pointer hover:bg-indigo-500/5' : 'hover:bg-slate-800/30'
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 text-slate-300 group-hover:text-white">
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, any>)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
