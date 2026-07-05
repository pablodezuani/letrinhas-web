'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Parent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Mail, Baby, Contact, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

const avatarGradients = [
  'linear-gradient(135deg, #305F72, #567B8B)',
  'linear-gradient(135deg, #A988A9, #CBAACB)',
  'linear-gradient(135deg, #D48660, #F5A97C)',
  'linear-gradient(135deg, #4D8AB2, #6DAED9)',
  'linear-gradient(135deg, #5C9A5B, #7FB77E)',
];

export default function ResponsaveisPage() {
  const [search, setSearch] = useState('');

  const { data: parents = [], isLoading } = useQuery<Parent[]>({
    queryKey: ['parents', search],
    queryFn: async () => {
      const { data } = await api.get('/educator/parents', {
        params: search ? { search } : undefined,
      });
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Responsáveis"
        description="Pais e responsáveis cadastrados no aplicativo"
        badge={parents.length}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-10 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm"
          style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" style={{ background: '#F6EEE6' }} />
          ))}
        </div>
      ) : parents.length === 0 ? (
        <EmptyState
          icon={search ? Search : Contact}
          title={search ? 'Nenhum responsável encontrado' : 'Nenhum responsável cadastrado'}
          description={search ? 'Tente buscar por outro nome ou e-mail' : 'Responsáveis aparecem aqui assim que se cadastram no aplicativo'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {parents.map((parent, idx) => (
            <Link key={parent.id} href={`/responsaveis/${parent.id}`}>
              <div
                className="bg-white rounded-2xl p-5 ring-1 flex items-center gap-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: avatarGradients[idx % avatarGradients.length] }}
                >
                  {parent.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{parent.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 flex-shrink-0" style={{ color: '#98A5AB' }} />
                    <p className="text-xs truncate" style={{ color: '#6B7F88' }}>{parent.email}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(48,95,114,0.06)', color: '#567B8B' }}
                  >
                    <Baby className="h-3 w-3" />
                    {parent._count?.children ?? 0}
                  </span>
                  {parent.created_at && (
                    <p className="text-xs hidden sm:block" style={{ color: '#98A5AB' }}>
                      {formatDistanceToNow(new Date(parent.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  )}
                </div>

                <ChevronRight
                  className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: '#C2C8CB' }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
