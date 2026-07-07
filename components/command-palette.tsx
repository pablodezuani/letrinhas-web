'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useAuth } from '@/contexts/auth-context';
import { useCommandPalette } from '@/contexts/command-palette-context';
import { NAV_ITEMS } from '@/lib/nav-items';
import { api } from '@/lib/api';
import { Child } from '@/lib/types';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Users } from 'lucide-react';

type ResultEntry =
  | { kind: 'nav'; key: string; label: string; sublabel: string; icon: React.ElementType; go: () => void }
  | { kind: 'child'; key: string; label: string; sublabel: string; icon: React.ElementType; go: () => void };

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the highlighted result whenever the query changes (adjusting state during render).
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [isOpen]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      close();
      setQuery('');
      setActiveIndex(0);
    }
  }

  const navResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_ITEMS
      .filter((item) => user && item.roles.includes(user.role))
      .filter((item) => !q || item.label.toLowerCase().includes(q))
      .map((item): ResultEntry => ({
        kind: 'nav',
        key: item.href,
        label: item.label,
        sublabel: 'Navegar',
        icon: item.icon,
        go: () => router.push(item.href),
      }));
  }, [query, user, router]);

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ['command-palette-children', query],
    queryFn: async () => {
      const { data } = await api.get('/educator/children', { params: { search: query } });
      return data;
    },
    enabled: isOpen && query.trim().length > 0,
  });

  const childResults = useMemo((): ResultEntry[] => {
    if (!query.trim()) return [];
    return children.slice(0, 6).map((child) => ({
      kind: 'child',
      key: child.id,
      label: child.name,
      sublabel: child.nickname ? `"${child.nickname}"` : 'Criança',
      icon: Users,
      go: () => router.push(`/children/${child.id}`),
    }));
  }, [children, query, router]);

  const results = [...navResults, ...childResults];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const entry = results[activeIndex];
      if (entry) {
        entry.go();
        close();
      }
    } else if (e.key === 'Escape') {
      close();
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className="fixed left-1/2 top-[14%] z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl bg-white outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
          style={{ boxShadow: '0 24px 64px rgba(13,37,53,0.28)' }}
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">Buscar e navegar</DialogPrimitive.Title>

          <div className="flex items-center gap-3 px-4 h-14 border-b" style={{ borderColor: 'rgba(48,95,114,0.08)' }}>
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: '#98A5AB' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar crianças ou navegar para uma seção..."
              className="flex-1 h-full bg-transparent text-sm outline-none placeholder:text-[#C2C8CB]"
              style={{ color: '#1F4352' }}
            />
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
              style={{ background: 'rgba(48,95,114,0.08)', color: '#567B8B' }}
            >
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: '#98A5AB' }}>
                Nenhum resultado encontrado.
              </p>
            ) : (
              <>
                {navResults.length > 0 && (
                  <ResultSection label="Navegar" entries={navResults} results={results} activeIndex={activeIndex} onSelect={close} />
                )}
                {childResults.length > 0 && (
                  <ResultSection label="Crianças" entries={childResults} results={results} activeIndex={activeIndex} onSelect={close} />
                )}
              </>
            )}
          </div>

          <div
            className="flex items-center gap-4 px-4 h-10 border-t text-[11px]"
            style={{ borderColor: 'rgba(48,95,114,0.08)', color: '#98A5AB', background: '#FFF8F4' }}
          >
            <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navegar</span>
            <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> selecionar</span>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ResultSection({
  label,
  entries,
  results,
  activeIndex,
  onSelect,
}: {
  label: string;
  entries: ResultEntry[];
  results: ResultEntry[];
  activeIndex: number;
  onSelect: () => void;
}) {
  return (
    <div className="px-2 mb-1">
      <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#C2C8CB' }}>
        {label}
      </p>
      {entries.map((entry) => {
        const Icon = entry.icon;
        const index = results.indexOf(entry);
        const active = index === activeIndex;
        return (
          <button
            key={entry.key}
            onMouseEnter={() => {}}
            onClick={() => {
              entry.go();
              onSelect();
            }}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors"
            style={active ? { background: 'rgba(48,95,114,0.07)' } : undefined}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(48,95,114,0.06)' }}
            >
              <Icon className="h-4 w-4" style={{ color: '#305F72' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#1F4352' }}>{entry.label}</p>
              <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{entry.sublabel}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
