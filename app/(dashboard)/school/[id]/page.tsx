'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolDetailQuery } from '@/lib/queries';
import { api } from '@/lib/api';
import { SCHOOL_STATUS_LABELS } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, MapPin, Phone, Users, GraduationCap, X,
  School as SchoolIcon, UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { EmptyState } from '@/components/empty-state';
import { EducatorPicker } from '@/components/educator-picker';

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);

  const { data: school, isLoading } = useQuery(schoolDetailQuery(id));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['school', id] });
    queryClient.invalidateQueries({ queryKey: ['schools'] });
  };

  const linkEducatorMutation = useMutation({
    mutationFn: (educatorId: string) => api.post(`/admin/schools/${id}/educators`, { educatorId }),
    onSuccess: () => {
      invalidate();
      toast.success('Educadora vinculada à unidade.');
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao vincular educadora.';
      toast.error(msg);
    },
  });

  const unlinkEducatorMutation = useMutation({
    mutationFn: (educatorId: string) => api.delete(`/admin/schools/${id}/educators/${educatorId}`),
    onSuccess: (res) => {
      invalidate();
      setUnlinkTarget(null);
      const affected = res.data?.affectedChildren ?? 0;
      toast.success(affected > 0 ? `Educadora desvinculada. ${affected} criança(s) ficaram sem educadora.` : 'Educadora desvinculada.');
    },
    onError: () => toast.error('Erro ao desvincular educadora.'),
  });

  const assignChildEducatorMutation = useMutation({
    mutationFn: ({ childId, educatorId }: { childId: string; educatorId: string | null }) =>
      api.patch(`/admin/children/${childId}/educator`, { educatorId }),
    onSuccess: () => {
      invalidate();
      toast.success('Educadora responsável atualizada.');
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao atribuir educadora.';
      toast.error(msg);
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

  if (!school) return null;

  const linkedEducatorIds = school.educators.map((e) => e.educator.id);
  const cardStyle = { '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties;

  return (
    <div className="space-y-6">
      <Link href="/school" className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: '#6B7F88' }}>
        <ArrowLeft className="h-4 w-4" />
        Escola
      </Link>

      <div className="bg-white rounded-2xl p-6 ring-1" style={cardStyle}>
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
          >
            <SchoolIcon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold" style={{ color: '#1F4352' }}>{school.name}</h1>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={school.status === 'ACTIVE' ? { background: '#E4F1E3', color: '#5C9A5B' } : { background: '#EEF0F1', color: '#6B7F88' }}
              >
                {SCHOOL_STATUS_LABELS[school.status]}
              </span>
            </div>
            <div className="flex gap-4 text-sm flex-wrap" style={{ color: '#6B7F88' }}>
              {(school.address || school.city) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {[school.address, school.city, school.state].filter(Boolean).join(', ')}
                </span>
              )}
              {school.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {school.phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-center flex-shrink-0">
            <div>
              <p className="text-lg font-bold" style={{ color: '#1F4352' }}>{school.children.length}</p>
              <p className="text-xs" style={{ color: '#98A5AB' }}>Crianças</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#1F4352' }}>{school.educators.length}</p>
              <p className="text-xs" style={{ color: '#98A5AB' }}>Educadoras</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="children">
        <TabsList className="rounded-xl p-1" style={{ background: 'rgba(48,95,114,0.06)' }}>
          <TabsTrigger value="children" className="rounded-lg text-sm">Crianças</TabsTrigger>
          <TabsTrigger value="educators" className="rounded-lg text-sm">Educadoras</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="mt-4">
          {school.children.length === 0 ? (
            <EmptyState icon={Users} title="Nenhuma criança nesta unidade" description="Vincule crianças pela tela de Crianças." />
          ) : (
            <div className="bg-white rounded-2xl ring-1 overflow-hidden" style={cardStyle}>
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {school.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between gap-4 px-5 py-3.5 flex-wrap">
                    <Link href={`/children/${child.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                      {child.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={child.photo} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(48,95,114,0.08)', color: '#305F72' }}>
                          {child.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1F4352' }}>{child.name}</p>
                        <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{child.parent?.name}</p>
                      </div>
                    </Link>

                    <div className="w-56 flex-shrink-0">
                      <Select
                        value={child.educator?.id ?? ''}
                        onValueChange={(v) => assignChildEducatorMutation.mutate({ childId: child.id, educatorId: v || null })}
                      >
                        <SelectTrigger className="w-full h-9 rounded-lg border-0 text-sm" style={{ background: 'rgba(48,95,114,0.05)' }}>
                          <SelectValue placeholder="Sem educadora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem educadora</SelectItem>
                          {school.educators.map(({ educator }) => (
                            <SelectItem key={educator.id} value={educator.id}>{educator.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="educators" className="mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 ring-1" style={cardStyle}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#98A5AB' }}>Vincular educadora</p>
            <EducatorPicker
              excludeIds={linkedEducatorIds}
              onSelect={(educator) => linkEducatorMutation.mutate(educator.id)}
            />
          </div>

          {school.educators.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Nenhuma educadora vinculada" description="Use a busca acima para vincular a primeira educadora à unidade." />
          ) : (
            <div className="bg-white rounded-2xl ring-1 overflow-hidden" style={cardStyle}>
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {school.educators.map(({ educator }) => (
                  <div key={educator.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {educator.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={educator.photo} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(48,95,114,0.08)' }}>
                          <UserCircle className="h-5 w-5" style={{ color: '#305F72' }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1F4352' }}>{educator.name}</p>
                        <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{educator.email}</p>
                      </div>
                    </div>

                    {unlinkTarget === educator.id ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs" style={{ color: '#B85048' }}>Remover vínculo?</span>
                        <button
                          onClick={() => unlinkEducatorMutation.mutate(educator.id)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white"
                          style={{ background: '#D9756B' }}
                        >
                          Confirmar
                        </button>
                        <button onClick={() => setUnlinkTarget(null)} className="text-xs px-2 py-1" style={{ color: '#98A5AB' }}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setUnlinkTarget(educator.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: 'rgba(217,117,107,0.08)' }}
                      >
                        <X className="h-4 w-4" style={{ color: '#D9756B' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
