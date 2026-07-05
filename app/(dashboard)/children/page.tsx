'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Child } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, GamepadIcon, ChevronRight, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

const avatarColors = [
  { bg: 'linear-gradient(135deg, #305F72, #567B8B)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #A988A9, #CBAACB)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #D48660, #F5A97C)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #4D8AB2, #6DAED9)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #5C9A5B, #7FB77E)', text: '#fff' },
];

export default function ChildrenPage() {
  const [search, setSearch] = useState('');

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ['educator-children', search],
    queryFn: async () => {
      const { data } = await api.get('/educator/children', {
        params: search ? { search } : undefined,
      });
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Crianças" description="Perfis cadastrados no aplicativo" badge={children.length} />

      {/* Mini stat strip */}
      {!isLoading && children.length > 0 && (
        <div className="grid gap-3 grid-cols-3">
          {[
            {
              label: 'Total',
              value: children.length,
              icon: Users,
              color: '#305F72',
              bg: 'rgba(48,95,114,0.08)',
            },
            {
              label: 'Com TEA',
              value: children.filter((c) => c.hasAutism === 'yes').length,
              icon: Sparkles,
              color: '#A988A9',
              bg: 'rgba(203,170,203,0.14)',
            },
            {
              label: 'Sessões totais',
              value: children.reduce((sum, c) => sum + (c._count?.gameSessions ?? 0), 0),
              icon: GamepadIcon,
              color: '#D48660',
              bg: 'rgba(245,169,124,0.14)',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 ring-1"
              style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: stat.bg }}
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold leading-none" style={{ color: '#1F4352' }}>{stat.value}</p>
                <p className="text-xs mt-1 truncate" style={{ color: '#6B7F88' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
        <Input
          placeholder="Buscar por nome..."
          className="pl-10 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm"
          style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl" style={{ background: '#F6EEE6' }} />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-28 rounded" style={{ background: '#F6EEE6' }} />
                  <div className="h-3 w-20 rounded" style={{ background: '#F6EEE6' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : children.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhuma criança encontrada"
          description="Tente buscar por outro nome"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child, idx) => {
            const color = avatarColors[idx % avatarColors.length];
            const teaLevelColors: Record<string, { bg: string; text: string }> = {
              '1': { bg: '#E4F1E3', text: '#5C9A5B' },
              '2': { bg: '#FBEED1', text: '#B98A2D' },
              '3': { bg: '#FBE5E2', text: '#B85048' },
            };
            const teaColor = child.autismLevel ? teaLevelColors[child.autismLevel] : null;

            return (
              <Link key={child.id} href={`/children/${child.id}`}>
                <div
                  className="bg-white rounded-2xl p-5 ring-1 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
                >
                  <div className="flex items-start gap-4">
                    {child.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={child.photo}
                        alt={child.name}
                        className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{ background: color.bg, color: color.text }}
                      >
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{child.name}</p>
                          {child.nickname && (
                            <p className="text-xs truncate" style={{ color: '#98A5AB' }}>"{child.nickname}"</p>
                          )}
                        </div>
                        <ChevronRight
                          className="h-4 w-4 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5"
                          style={{ color: '#C2C8CB' }}
                        />
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {child.age && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(48,95,114,0.06)', color: '#567B8B' }}
                          >
                            {child.age} anos
                          </span>
                        )}
                        {child.hasAutism === 'yes' && teaColor && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: teaColor.bg, color: teaColor.text }}
                          >
                            TEA {child.autismLevel && `N${child.autismLevel}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-4 pt-4 flex items-center justify-between text-xs"
                    style={{ borderTop: '1px solid rgba(48,95,114,0.08)', color: '#98A5AB' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <GamepadIcon className="h-3.5 w-3.5" />
                      <span>{child._count?.gameSessions ?? 0} sessões</span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(child.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
