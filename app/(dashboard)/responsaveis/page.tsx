'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parentsQuery } from '@/lib/queries';
import type { Parent } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Baby, Contact, ChevronRight, Mail } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/page-header';
import { DataTable, type TableColumn } from '@/components/data-table';

const avatarGradients = [
  'linear-gradient(135deg, #305F72, #567B8B)',
  'linear-gradient(135deg, #A988A9, #CBAACB)',
  'linear-gradient(135deg, #D48660, #F5A97C)',
  'linear-gradient(135deg, #4D8AB2, #6DAED9)',
  'linear-gradient(135deg, #5C9A5B, #7FB77E)',
];

export default function ResponsaveisPage() {
  const [search, setSearch] = useState('');

  const { data: parents = [], isLoading } = useQuery<Parent[]>(parentsQuery(search));

  const columns: TableColumn<Parent>[] = [
    {
      header: 'Responsável',
      render: (parent, idx) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: avatarGradients[idx % avatarGradients.length] }}
          >
            {parent.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{parent.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 flex-shrink-0" style={{ color: '#C2C8CB' }} />
              <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{parent.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Crianças',
      hideOnMobile: true,
      headerClassName: 'w-28',
      className: 'w-28',
      render: (parent) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(48,95,114,0.07)', color: '#567B8B' }}
        >
          <Baby className="h-3 w-3" />
          {parent._count?.children ?? 0}
        </span>
      ),
    },
    {
      header: 'Cadastro',
      hideOnMobile: true,
      headerClassName: 'w-36',
      className: 'w-36',
      render: (parent) =>
        parent.created_at ? (
          <span className="text-xs" style={{ color: '#98A5AB' }}>
            {formatDistanceToNow(new Date(parent.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        ) : (
          <span style={{ color: '#C2C8CB' }}>—</span>
        ),
    },
    {
      header: '',
      headerClassName: 'w-10',
      className: 'w-10 text-right',
      render: () => (
        <ChevronRight className="h-4 w-4 inline-block transition-transform group-hover:translate-x-0.5" style={{ color: '#C2C8CB' }} />
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader
        title="Responsáveis"
        description="Pais e responsáveis cadastrados no aplicativo"
        badge={parents.length}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className="pl-10 h-10 rounded-xl border-0 bg-white text-sm"
          style={{ boxShadow: 'var(--shadow-xs)', border: '1px solid rgba(48,95,114,0.1)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable<Parent>
        columns={columns}
        data={parents}
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
        emptyIcon={Contact}
        emptyTitle={search ? 'Nenhum responsável encontrado' : 'Nenhum responsável cadastrado'}
        emptyDescription={
          search
            ? 'Tente buscar por outro nome ou e-mail'
            : 'Responsáveis aparecem aqui assim que se cadastram no aplicativo'
        }
        onRowClick={(parent) => {
          window.location.href = `/responsaveis/${parent.id}`;
        }}
      />
    </div>
  );
}
