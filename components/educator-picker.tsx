'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { educatorsQuery } from '@/lib/queries';
import type { User } from '@/lib/types';
import { Search, GraduationCap } from 'lucide-react';

interface EducatorPickerProps {
  onSelect: (educator: User) => void;
  placeholder?: string;
  /** Restrict options to these educator ids (e.g. only educators already linked to a school). */
  onlyIds?: string[];
  excludeIds?: string[];
}

export function EducatorPicker({ onSelect, placeholder = 'Buscar educadora por nome...', onlyIds, excludeIds = [] }: EducatorPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: educators = [] } = useQuery(educatorsQuery());

  const options = educators.filter((e) => {
    if (excludeIds.includes(e.id)) return false;
    if (onlyIds && !onlyIds.includes(e.id)) return false;
    if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

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
          className="w-full pl-10 pr-3 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm outline-none"
          style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
        />
      </div>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-xl bg-white"
          style={{ boxShadow: 'var(--shadow-md)', border: '1px solid rgba(48,95,114,0.1)' }}
        >
          {options.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: '#98A5AB' }}>
              {onlyIds?.length === 0 ? 'Nenhuma educadora vinculada a esta unidade.' : 'Nenhuma educadora encontrada.'}
            </div>
          ) : (
            options.map((educator) => (
              <button
                key={educator.id}
                type="button"
                onClick={() => {
                  onSelect(educator);
                  setQuery('');
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.02]"
              >
                {educator.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={educator.photo} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(48,95,114,0.08)' }}>
                    <GraduationCap className="h-4 w-4" style={{ color: '#305F72' }} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#1F4352' }}>{educator.name}</p>
                  <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{educator.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
