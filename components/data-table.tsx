'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

export interface TableColumn<T> {
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  loadingRows?: number;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-4 rounded-lg animate-shimmer"
            style={{ width: i === 0 ? '55%' : i === cols - 1 ? '25%' : '40%' }}
          />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  loadingRows = 5,
  emptyIcon: EmptyIcon = InboxIcon,
  emptyTitle = 'Nenhum resultado',
  emptyDescription,
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid rgba(48,95,114,0.08)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(48,95,114,0.07)' }}>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]',
                    col.hideOnMobile && 'hidden sm:table-cell',
                    col.headerClassName,
                  )}
                  style={{ color: '#98A5AB', background: 'rgba(246,238,230,0.5)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(48,95,114,0.06)' }}
                    >
                      <EmptyIcon className="h-5 w-5" style={{ color: '#98A5AB' }} />
                    </div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#305F72' }}>
                      {emptyTitle}
                    </p>
                    {emptyDescription && (
                      <p className="text-xs max-w-xs leading-relaxed" style={{ color: '#98A5AB' }}>
                        {emptyDescription}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors duration-100 group',
                    onRowClick && 'cursor-pointer',
                  )}
                  style={
                    idx < data.length - 1
                      ? { borderBottom: '1px solid rgba(48,95,114,0.05)' }
                      : undefined
                  }
                  onMouseEnter={
                    onRowClick
                      ? (e) => (e.currentTarget.style.background = 'rgba(48,95,114,0.025)')
                      : undefined
                  }
                  onMouseLeave={
                    onRowClick
                      ? (e) => (e.currentTarget.style.background = '')
                      : undefined
                  }
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={cn(
                        'px-5 py-3.5 text-sm',
                        col.hideOnMobile && 'hidden sm:table-cell',
                        col.className,
                      )}
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
