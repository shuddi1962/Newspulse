'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface BulkAction {
  label: string;
  onClick: (selected: string[]) => void;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  idKey?: string;
  searchable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  onRowClick?: (row: T) => void;
  bulkActions?: BulkAction[];
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  idKey = 'id',
  searchable,
  selectable,
  pagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  onRowClick,
  bulkActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(term);
      }),
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated = pagination ? sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage) : sorted;

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((r) => String(r[idKey]))));
    }
  };

  return (
    <div>
      {(searchable || bulkActions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
              />
            </div>
          )}
          {bulkActions && selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--color-admin-text-muted)]">{selected.size} selected</span>
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.onClick([...selected])}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium',
                    action.variant === 'destructive'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-100 text-[var(--color-admin-text)] hover:bg-gray-200',
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-[var(--color-admin-border)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-admin-border)] bg-gray-50">
              {selectable && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('px-4 py-3 font-medium text-[var(--color-admin-text-muted)]', col.sortable !== false && 'cursor-pointer hover:text-[var(--color-admin-text)]', col.className)}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (
                      <span className="text-xs">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={String(row[idKey]) ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-[var(--color-admin-border)] transition-colors last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-gray-50',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(String(row[idKey]))}
                        onChange={() => toggleSelect(String(row[idKey]))}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-[var(--color-admin-text)]', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--color-admin-text-muted)]">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="rounded border border-gray-200 px-2 py-1 text-sm"
            >
              {rowsPerPageOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>{sorted.length} total</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-sm',
                    page === pageNum
                      ? 'bg-[var(--color-crimson)] text-white'
                      : 'text-gray-500 hover:bg-gray-100',
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
