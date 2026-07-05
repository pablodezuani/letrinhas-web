'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardMetrics, GAME_LABELS } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Users, GamepadIcon, TrendingUp, Sparkles, AlertCircle, Zap,
} from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { Sparkline } from '@/components/sparkline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const BAR_COLORS = ['#305F72', '#CBAACB', '#F5A97C', '#6DAED9'];

const STAT_DEFS = [
  { key: 'sessionsLast30Days', label: 'Sessões (30 dias)',     icon: TrendingUp,  color: '#5C9A5B', bg: 'rgba(127,183,126,0.14)', accentColor: '#7FB77E', hero: true },
  { key: 'totalChildren',      label: 'Crianças cadastradas', icon: Users,       color: '#305F72', bg: 'rgba(48,95,114,0.09)',   accentColor: '#305F72', hero: false },
  { key: 'totalParents',       label: 'Responsáveis',         icon: Users,       color: '#A988A9', bg: 'rgba(203,170,203,0.14)', accentColor: '#CBAACB', hero: false },
  { key: 'totalSessions',      label: 'Sessões de jogo',      icon: GamepadIcon, color: '#D48660', bg: 'rgba(245,169,124,0.14)', accentColor: '#F5A97C', hero: false },
];

const scoreColor = (pct: number) =>
  pct >= 70 ? '#5C9A5B' : pct >= 40 ? '#B98A2D' : '#B85048';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: metrics, isLoading, isError } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => (await api.get('/educator/dashboard')).data,
    retry: 1,
  });

  const chartData = metrics?.sessionsByGame.map((g, i) => ({
    name: GAME_LABELS[g.gameType] ?? g.gameType,
    sessões: g._count.id,
    color: BAR_COLORS[i % BAR_COLORS.length],
  })) ?? [];

  const sparklineData = (() => {
    if (!metrics?.recentSessions.length) return [];
    const byDay = new Map<string, number>();
    for (const session of metrics.recentSessions) {
      const day = session.playedAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, count]) => count);
  })();

  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? 'Boa noite' :
    hour < 12 ? 'Bom dia' :
    hour < 18 ? 'Boa tarde' : 'Boa noite';

  const greetingEmoji =
    hour < 5 ? '🌙' : hour < 12 ? '🌤️' : hour < 18 ? '☀️' : '🌙';

  const hasData = !isLoading && !isError && (metrics?.totalSessions ?? 0) > 0;

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Greeting banner ───────────────────────────────────────── */}
      <div
        className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D2535 0%, #173345 45%, #1D4255 75%, #224E63 100%)' }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 5% 50%, rgba(245,169,124,0.18) 0%, transparent 50%), radial-gradient(ellipse at 95% 20%, rgba(203,170,203,0.12) 0%, transparent 45%)',
          }}
        />

        <div className="relative flex items-center gap-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,169,124,0.18)', border: '1px solid rgba(245,169,124,0.28)' }}
          >
            <Sparkles className="h-5 w-5 animate-sparkle" style={{ color: '#F5A97C' }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight">
              {greeting}, {user?.name?.split(' ')[0]}! {greetingEmoji}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </p>
          </div>

          {hasData && (
            <div
              className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 px-5 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-2xl font-bold text-white leading-none">
                {metrics!.sessionsLast30Days}
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                sessões este mês
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Error state ───────────────────────────────────────────── */}
      {isError && (
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: 'rgba(217,117,107,0.08)',
            border: '1px solid rgba(217,117,107,0.2)',
          }}
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#C05050' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#C05050' }}>
              Erro ao carregar dados
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9B4B44' }}>
              Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
            </p>
          </div>
        </div>
      )}

      {/* ── Stat cards — mosaico bento ───────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {STAT_DEFS.map((def, i) => (
          <div
            key={def.key}
            className={`animate-fade-in-up ${def.hero ? 'col-span-2' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <StatCard
              label={def.label}
              value={isLoading ? 0 : (metrics?.[def.key as keyof DashboardMetrics] as number) ?? 0}
              icon={def.icon}
              color={def.color}
              bg={def.bg}
              accentColor={def.accentColor}
              loading={isLoading}
              size={def.hero ? 'hero' : 'default'}
              extra={
                def.hero && !isLoading && sparklineData.length >= 2 ? (
                  <div className="w-full">
                    <Sparkline data={sparklineData} color={def.color} height={44} />
                  </div>
                ) : undefined
              }
            />
          </div>
        ))}
      </div>

      {/* ── Charts / empty / loading ──────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div
            className="lg:col-span-3 bg-white rounded-2xl p-6 h-72 animate-pulse"
            style={{ boxShadow: '0 1px 4px rgba(48,95,114,0.07)' }}
          />
          <div
            className="lg:col-span-2 bg-white rounded-2xl p-6 h-72 animate-pulse"
            style={{ boxShadow: '0 1px 4px rgba(48,95,114,0.07)' }}
          />
        </div>
      ) : isError ? null : !hasData ? (

        /* Empty state */
        <div
          className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-center"
          style={{ boxShadow: '0 1px 4px rgba(48,95,114,0.07)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(48,95,114,0.06)' }}
          >
            <Zap className="h-7 w-7" style={{ color: '#98A5AB' }} />
          </div>
          <p className="text-lg font-bold mb-2" style={{ color: '#1F4352' }}>
            Nenhum dado registrado ainda
          </p>
          <p className="text-sm max-w-md leading-relaxed" style={{ color: '#6B7F88' }}>
            Os gráficos e sessões de jogo aparecerão aqui conforme as crianças utilizarem o aplicativo.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 w-full max-w-xl text-left">
            {[
              { step: '1', title: 'Cadastre crianças', desc: 'Peça aos responsáveis para criar o perfil no app mobile.', color: '#305F72' },
              { step: '2', title: 'Jogue os jogos', desc: 'As crianças acessam as atividades pelo aplicativo.', color: '#CBAACB' },
              { step: '3', title: 'Acompanhe aqui', desc: 'O progresso aparece em tempo real neste painel.', color: '#F5A97C' },
            ].map(({ step, title, desc, color }) => (
              <div
                key={step}
                className="rounded-xl p-4 animate-fade-in-up"
                style={{
                  background: 'rgba(48,95,114,0.03)',
                  border: '1px solid rgba(48,95,114,0.07)',
                  animationDelay: `${parseInt(step) * 100}ms`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white mb-3"
                  style={{ background: color }}
                >
                  {step}
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#305F72' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#98A5AB' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

      ) : (

        /* Charts with data */
        <div className="grid gap-5 lg:grid-cols-5">

          {/* Bar chart */}
          <div
            className="lg:col-span-3 bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 1px 4px rgba(48,95,114,0.07)' }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1F4352' }}>Sessões por jogo</p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7F88' }}>Total acumulado por tipo de atividade</p>
              </div>
              <div
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: 'rgba(48,95,114,0.06)', color: '#567B8B' }}
              >
                {chartData.reduce((s, d) => s + d.sessões, 0)} sessões
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={38} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,95,114,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7F88' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7F88' }} axisLine={false} tickLine={false} width={26} />
                <Tooltip
                  cursor={{ fill: 'rgba(48,95,114,0.04)', rx: 6 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: 12,
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="sessões" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div
              className="flex flex-wrap gap-4 mt-4 pt-4"
              style={{ borderTop: '1px solid rgba(48,95,114,0.05)' }}
            >
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs" style={{ color: '#6B7F88' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div
            className="lg:col-span-2 bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 1px 4px rgba(48,95,114,0.07)' }}
          >
            <p className="font-semibold text-sm mb-0.5" style={{ color: '#1F4352' }}>Atividade recente</p>
            <p className="text-xs mb-5" style={{ color: '#6B7F88' }}>Últimas sessões de jogo</p>

            {!metrics?.recentSessions.length ? (
              <div className="flex items-center justify-center h-44">
                <p className="text-sm" style={{ color: '#98A5AB' }}>Nenhuma atividade ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentSessions.slice(0, 7).map((session, i) => {
                  const pct =
                    session.maxScore > 0
                      ? Math.round((session.score / session.maxScore) * 100)
                      : null;
                  const gameIdx = ['READING', 'VOWELS', 'WORD_FORMATION', 'PHRASE_BUILDER'].indexOf(
                    session.gameType,
                  );
                  const color = BAR_COLORS[gameIdx >= 0 ? gameIdx : 0];

                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                        style={{ background: color }}
                      >
                        {session.child?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#305F72' }}>
                          {session.child?.name ?? '—'}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#98A5AB' }}>
                          {GAME_LABELS[session.gameType] ?? session.gameType}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {pct !== null && (
                          <p className="text-sm font-bold" style={{ color: scoreColor(pct) }}>
                            {pct}%
                          </p>
                        )}
                        <p className="text-xs" style={{ color: '#C2C8CB' }}>
                          {formatDistanceToNow(new Date(session.playedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
