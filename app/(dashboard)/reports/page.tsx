'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { childrenQuery, childSessionsQuery } from '@/lib/queries';
import type { Child, GameSession } from '@/lib/types';
import { GAME_LABELS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Trophy, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

const gameColors: Record<string, string> = {
  READING: '#305F72',
  VOWELS: '#CBAACB',
  WORD_FORMATION: '#F5A97C',
  PHRASE_BUILDER: '#6DAED9',
};

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [gameFilter, setGameFilter] = useState('');

  const { data: children = [] } = useQuery<Child[]>(childrenQuery());

  const { data: sessions = [], isLoading } = useQuery<GameSession[]>({
    ...childSessionsQuery(selectedChild),
  });

  const filtered = sessions.filter((s) => !gameFilter || s.gameType === gameFilter);
  const filteredChildren = children.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedChildData = children.find((c) => c.id === selectedChild);

  const trendData = filtered
    .slice().reverse().slice(-20)
    .map((s) => ({
      data: format(new Date(s.playedAt), 'dd/MM', { locale: ptBR }),
      acerto: s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0,
    }));

  const totalSessions = filtered.length;
  const completedSessions = filtered.filter((s) => s.completed).length;
  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((acc, s) => acc + (s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0), 0) / filtered.length)
    : 0;

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader title="Relatórios" description="Histórico detalhado por criança" />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Painel esquerdo — seleção */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#98A5AB' }}>
              Selecionar criança
            </p>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#98A5AB' }} />
              <Input
                placeholder="Buscar..."
                className="pl-8 h-8 rounded-xl border-0 ring-1 text-xs"
                style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)', background: '#FFF8F4' } as React.CSSProperties}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-0.5 max-h-60 overflow-y-auto">
              {filteredChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm transition-all"
                  style={selectedChild === child.id
                    ? { background: 'rgba(48,95,114,0.08)', color: '#305F72', fontWeight: 600 }
                    : { color: '#6B7F88' }}
                >
                  {child.name}
                  {child.age && (
                    <span className="ml-1 text-xs" style={{ color: '#98A5AB' }}>({child.age}a)</span>
                  )}
                </button>
              ))}
              {filteredChildren.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: '#98A5AB' }}>Nenhuma encontrada.</p>
              )}
            </div>
          </div>

          {selectedChild && (
            <div className="bg-white rounded-2xl p-4 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#98A5AB' }}>Filtrar jogo</p>
              <Select value={gameFilter} onValueChange={(v) => setGameFilter(v ?? '')}>
                <SelectTrigger className="h-8 rounded-xl border-0 ring-1 text-xs w-full">
                  <SelectValue placeholder="Todos os jogos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os jogos</SelectItem>
                  {Object.entries(GAME_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-4">
          {!selectedChild ? (
            <EmptyState
              icon={BarChart3}
              title="Selecione uma criança"
              description="O histórico completo aparecerá aqui"
            />
          ) : (
            <>
              {/* Stats */}
              {!isLoading && filtered.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Sessões', value: totalSessions, color: '#305F72', bg: 'rgba(48,95,114,0.08)' },
                    { label: 'Concluídas', value: completedSessions, color: '#7FB77E', bg: 'rgba(127,183,126,0.12)' },
                    { label: 'Média', value: `${avgScore}%`, color: '#F5A97C', bg: 'rgba(245,169,124,0.12)' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white rounded-2xl p-4 text-center ring-1"
                      style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
                    >
                      <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7F88' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Header criança */}
              {selectedChildData && (
                <div className="flex items-center gap-2 px-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
                  >
                    {selectedChildData.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-sm" style={{ color: '#1F4352' }}>{selectedChildData.name}</span>
                  <span className="text-sm" style={{ color: '#98A5AB' }}>— {filtered.length} sessões</span>
                </div>
              )}

              {/* Tendência de acertos */}
              {!isLoading && trendData.length >= 2 && (
                <div className="bg-white rounded-2xl p-5 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: '#1F4352' }}>Tendência de acertos</p>
                  <p className="text-xs mb-4" style={{ color: '#6B7F88' }}>Percentual de acerto por sessão</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,95,114,0.06)" vertical={false} />
                      <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#6B7F88' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7F88' }} axisLine={false} tickLine={false} unit="%" width={34} />
                      <Tooltip
                        formatter={(v) => [`${v}%`, 'Acerto']}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(48,95,114,0.1)', fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="acerto"
                        stroke="#305F72"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#305F72', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#F5A97C', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Lista */}
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" style={{ background: '#F6EEE6' }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl flex items-center justify-center h-48 ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
                  <p className="text-sm" style={{ color: '#98A5AB' }}>Nenhuma sessão encontrada.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl ring-1 overflow-hidden" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
                  <div className="divide-y" style={{ '--tw-divide-color': 'rgba(48,95,114,0.06)' } as React.CSSProperties}>
                    {filtered.map((session) => {
                      const pct = session.maxScore > 0 ? Math.round((session.score / session.maxScore) * 100) : null;
                      const color = gameColors[session.gameType] ?? '#305F72';

                      return (
                        <div key={session.id} className="flex items-center justify-between px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-9 rounded-full flex-shrink-0" style={{ background: color }} />
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#305F72' }}>
                                {GAME_LABELS[session.gameType] ?? session.gameType}
                              </p>
                              <p className="text-xs" style={{ color: '#98A5AB' }}>
                                {format(new Date(session.playedAt), "dd 'de' MMM 'de' yyyy, HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-5">
                            {pct !== null && (
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3.5 w-3.5" style={{ color: '#E9B44C' }} />
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: pct >= 70 ? '#5C9A5B' : pct >= 40 ? '#B98A2D' : '#B85048' }}
                                >
                                  {pct}%
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1" style={{ color: '#98A5AB' }}>
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-xs">{Math.round(session.timeSpent / 60)}min</span>
                            </div>
                            {session.completed
                              ? <CheckCircle2 className="h-4 w-4" style={{ color: '#7FB77E' }} />
                              : <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#C2C8CB' }} />
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
