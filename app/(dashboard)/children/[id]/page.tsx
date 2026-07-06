'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ChildDetail, GAME_LABELS } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Clock, Trophy, CheckCircle2, GamepadIcon } from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const gameColors: Record<string, string> = {
  READING: '#305F72',
  VOWELS: '#CBAACB',
  WORD_FORMATION: '#F5A97C',
  PHRASE_BUILDER: '#6DAED9',
};

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery<ChildDetail>({
    queryKey: ['child-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/educator/children/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 w-32 rounded" style={{ background: '#F6EEE6' }} />
        <div className="bg-white rounded-2xl p-6 h-28" style={{ background: '#F6EEE6' }} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24" style={{ background: '#F6EEE6' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { child, sessions, gameStats } = data;

  const progressChartData = sessions
    .slice().reverse().slice(-20)
    .map((s) => ({
      data: format(new Date(s.playedAt), 'dd/MM', { locale: ptBR }),
      acerto: s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0,
    }));

  const teaLevelLabel: Record<string, string> = { '1': 'Nível 1', '2': 'Nível 2', '3': 'Nível 3' };

  return (
    <div className="space-y-6">
      <Link
        href="/children"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: '#6B7F88' }}
      >
        <ArrowLeft className="h-4 w-4" />
        Crianças
      </Link>

      {/* Perfil header */}
      <div className="bg-white rounded-2xl p-6 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
          >
            {child.photo
              ? <img src={child.photo} alt={child.name} className="w-full h-full object-cover rounded-2xl" />
              : child.name.charAt(0).toUpperCase()
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-bold" style={{ color: '#1F4352' }}>{child.name}</h1>
              {child.nickname && (
                <span className="text-sm" style={{ color: '#98A5AB' }}>"{child.nickname}"</span>
              )}
              {child.hasAutism === 'yes' && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: child.autismLevel === '3' ? '#FBE5E2' : child.autismLevel === '2' ? '#FBEED1' : '#E4F1E3',
                    color: child.autismLevel === '3' ? '#B85048' : child.autismLevel === '2' ? '#B98A2D' : '#5C9A5B',
                  }}
                >
                  TEA {child.autismLevel && teaLevelLabel[child.autismLevel]}
                </span>
              )}
            </div>
            <div className="flex gap-4 text-sm flex-wrap" style={{ color: '#6B7F88' }}>
              {child.age && <span>{child.age} anos</span>}
              {child.gender && <span>{child.gender === 'male' ? 'Menino' : 'Menina'}</span>}
              {child.parent && <span>Resp.: {child.parent.name}</span>}
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-1"
              style={{ background: 'rgba(48,95,114,0.06)', color: '#567B8B' }}
            >
              <GamepadIcon className="h-3.5 w-3.5" />
              {sessions.length} sessões
            </div>
            <p className="text-xs" style={{ color: '#98A5AB' }}>
              Desde {formatDistanceToNow(new Date(child.createdAt), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats por jogo */}
      {gameStats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gameStats.map((stat) => {
            const color = gameColors[stat.gameType] ?? '#305F72';
            return (
              <div
                key={stat.gameType}
                className="bg-white rounded-2xl p-5 ring-1"
                style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium" style={{ color: '#6B7F88' }}>
                    {GAME_LABELS[stat.gameType] ?? stat.gameType}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: color }}
                  />
                </div>
                <p className="text-3xl font-bold mb-1.5" style={{ color: '#1F4352' }}>
                  {stat.avgScorePct}%
                </p>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(48,95,114,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${stat.avgScorePct}%`, background: color }}
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#98A5AB' }}>{stat.sessions} sessões</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="history">
        <TabsList className="rounded-xl p-1" style={{ background: 'rgba(48,95,114,0.06)' }}>
          <TabsTrigger value="history" className="rounded-lg text-sm">Histórico</TabsTrigger>
          <TabsTrigger value="chart" className="rounded-lg text-sm">Evolução</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg text-sm">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <div className="bg-white rounded-2xl ring-1 overflow-hidden" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
            {sessions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm" style={{ color: '#98A5AB' }}>Nenhuma sessão registrada ainda.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {sessions.map((session) => {
                  const pct = session.maxScore > 0 ? Math.round((session.score / session.maxScore) * 100) : null;
                  const color = gameColors[session.gameType] ?? '#305F72';

                  return (
                    <div key={session.id} className="flex items-center justify-between px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-8 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#305F72' }}>
                            {GAME_LABELS[session.gameType] ?? session.gameType}
                          </p>
                          <p className="text-xs" style={{ color: '#98A5AB' }}>
                            {format(new Date(session.playedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        {pct !== null && (
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5" style={{ color: '#E9B44C' }} />
                              <span
                                className="text-sm font-semibold"
                                style={{ color: pct >= 70 ? '#5C9A5B' : pct >= 40 ? '#B98A2D' : '#B85048' }}
                              >
                                {pct}%
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: '#98A5AB' }}>
                              {session.score}/{session.maxScore} pts
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-1" style={{ color: '#98A5AB' }}>
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs">{Math.round(session.timeSpent / 60)}min</span>
                        </div>
                        {session.completed ? (
                          <CheckCircle2 className="h-4 w-4" style={{ color: '#7FB77E' }} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#C2C8CB' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <div className="bg-white rounded-2xl p-6 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
            <h3 className="font-semibold mb-1" style={{ color: '#1F4352' }}>Evolução de acertos</h3>
            <p className="text-xs mb-6" style={{ color: '#6B7F88' }}>Percentual de acertos por sessão</p>
            {progressChartData.length < 2 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-sm" style={{ color: '#98A5AB' }}>
                  São necessárias pelo menos 2 sessões para gerar o gráfico.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={progressChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,95,114,0.06)" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#6B7F88' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7F88' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Acerto']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(48,95,114,0.1)', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="acerto"
                    stroke="#305F72"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#305F72', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#F5A97C', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { key: 'aboutMe', label: 'Sobre mim', value: child.aboutMe },
              { key: 'howToHelp', label: 'Como ajudar', value: child.howToHelp },
              { key: 'whenFrustrated', label: 'Quando frustrado(a)', value: child.whenFrustrated },
              { key: 'medicalInfo', label: 'Informações médicas', value: child.medicalInfo },
              { key: 'routine', label: 'Rotina', value: child.routine },
              { key: 'communication', label: 'Comunicação', value: child.communication },
            ].filter((f) => f.value).map((field) => (
              <div
                key={field.key}
                className="bg-white rounded-2xl p-5 ring-1"
                style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#98A5AB' }}>
                  {field.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#305F72' }}>{field.value}</p>
              </div>
            ))}

            {child.specialInterests && child.specialInterests.length > 0 && (
              <div
                className="bg-white rounded-2xl p-5 ring-1"
                style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#98A5AB' }}>
                  Interesses especiais
                </p>
                <div className="flex flex-wrap gap-2">
                  {child.specialInterests.map((interest, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'rgba(203,170,203,0.15)', color: '#A988A9' }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
