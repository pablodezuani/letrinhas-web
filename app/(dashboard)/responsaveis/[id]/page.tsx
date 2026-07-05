'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ParentDetail } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Mail, Calendar, GamepadIcon, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';

const avatarColors = [
  { bg: 'linear-gradient(135deg, #305F72, #567B8B)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #A988A9, #CBAACB)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #D48660, #F5A97C)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #4D8AB2, #6DAED9)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #5C9A5B, #7FB77E)', text: '#fff' },
];

const teaLevelColors: Record<string, { bg: string; text: string }> = {
  '1': { bg: '#E4F1E3', text: '#5C9A5B' },
  '2': { bg: '#FBEED1', text: '#B98A2D' },
  '3': { bg: '#FBE5E2', text: '#B85048' },
};

export default function ResponsavelDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<ParentDetail>({
    queryKey: ['parent-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/educator/parents/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-32 rounded" style={{ background: '#F6EEE6' }} />
        <div className="bg-white rounded-2xl p-6 h-28" style={{ background: '#F6EEE6' }} />
      </div>
    );
  }

  if (!data) return null;

  const { parent, children } = data;

  return (
    <div className="space-y-6">
      <Link
        href="/responsaveis"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: '#6B7F88' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Responsáveis
      </Link>

      {/* Perfil header */}
      <div className="bg-white rounded-2xl p-6 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
        <div className="flex items-center gap-5 flex-wrap">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
          >
            {parent.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold" style={{ color: '#1F4352' }}>{parent.name}</h1>
            <div className="flex gap-4 text-sm flex-wrap mt-1" style={{ color: '#6B7F88' }}>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {parent.email}
              </span>
              {parent.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Cadastrado {formatDistanceToNow(new Date(parent.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              )}
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(48,95,114,0.06)', color: '#567B8B' }}
          >
            <Users className="h-3.5 w-3.5" />
            {children.length} {children.length === 1 ? 'criança' : 'crianças'}
          </div>
        </div>
      </div>

      {/* Crianças */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#98A5AB' }}>
          Crianças vinculadas
        </h2>

        {children.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhuma criança cadastrada"
            description="Este responsável ainda não cadastrou nenhuma criança"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child, idx) => {
              const color = avatarColors[idx % avatarColors.length];
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
                        {format(new Date(child.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
