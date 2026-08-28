'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolsQuery } from '@/lib/queries';
import type { School } from '@/lib/types';
import { Search, School as SchoolIcon, Check, Loader2 } from 'lucide-react';

interface SchoolPickerProps {
  onSelect: (school: School) => void;
  placeholder?: string;
  excludeIds?: string[];
}

/**
 * Small hand-rolled searchable dropdown (no shadcn combobox/popover exists in this
 * project yet — every other list-picking UI here is bespoke too, so this follows
 * the same pattern instead of introducing a new dependency for one feature).
 */
export function SchoolPicker({ onSelect, placeholder = 'Buscar unidade por nome...', excludeIds = [] }: SchoolPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: schools = [], isFetching } = useQuery(schoolsQuery(query));
  const options = schools.filter((s) => s.status === 'ACTIVE' && !excludeIds.includes(s.id));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm outline-none"
          style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
        />
        {isFetching && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" style={{ color: '#98A5AB' }} />
        )}
      </div>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl bg-white"
          style={{ boxShadow: 'var(--shadow-md)', border: '1px solid rgba(48,95,114,0.1)' }}
        >
          {options.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: '#98A5AB' }}>
              {isFetching ? 'Buscando...' : 'Nenhuma unidade ativa encontrada.'}
            </div>
          ) : (
            options.map((school) => (
              <button
                key={school.id}
                type="button"
                onClick={() => {
                  onSelect(school);
                  setQuery('');
                  setOpen(false);
                }}
                className="w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.02]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(48,95,114,0.08)' }}
                >
                  <SchoolIcon className="h-4 w-4" style={{ color: '#305F72' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#1F4352' }}>{school.name}</p>
                  {(school.address || school.city) && (
                    <p className="text-xs truncate" style={{ color: '#98A5AB' }}>
                      {[school.address, school.city, school.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <Check className="h-4 w-4 ml-auto flex-shrink-0 opacity-0" style={{ color: '#5C9A5B' }} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
