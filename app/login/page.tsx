'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';

const LETTER_ROWS = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O'],
  ['P', 'Q', 'R', 'S', 'T'],
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#FFF8F4' }}>

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-[44%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0D2535 0%, #173345 35%, #1D4255 65%, #224E63 100%)' }}
      >
        {/* Ambient glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 30% 10%, rgba(245,169,124,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(203,170,203,0.14) 0%, transparent 50%)',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(245,169,124,0.2)', border: '1px solid rgba(245,169,124,0.3)' }}
          >
            <Sparkles className="w-5 h-5" style={{ color: '#F5A97C' }} />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Letrinhas</p>
            <p className="text-xs leading-tight" style={{ color: '#CBAACB' }}>Encantadas</p>
          </div>
        </div>

        {/* Letter grid */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3">
          {LETTER_ROWS.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="flex gap-3"
              style={{ transform: rowIdx % 2 === 1 ? 'translateX(28px)' : 'none' }}
            >
              {row.map((letter, colIdx) => (
                <div
                  key={letter}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold select-none pointer-events-none animate-float-letter"
                  style={{
                    animationDelay: `${(rowIdx * 5 + colIdx) * 120}ms`,
                    animationDuration: `${3.5 + ((rowIdx * 5 + colIdx) % 3) * 0.5}s`,
                    background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div className="relative z-10 flex-shrink-0">
          <div className="flex items-center gap-2 mb-5">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(245,169,124,0.2)', color: '#FAC7A6' }}
            >
              <BookOpen className="w-3 h-3" />
              Plataforma TEA
            </span>
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(203,170,203,0.2)', color: '#E2CDE2' }}
            >
              <Star className="w-3 h-3" />
              Educacional
            </span>
          </div>
          <h2 className="text-[2rem] font-bold text-white leading-snug mb-3">
            Acompanhe a evolução<br />
            <span style={{ color: '#F5A97C' }}>de cada criança</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Painel educacional para monitorar o progresso e apoiar o desenvolvimento de crianças com TEA.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: '#305F72' }}>Letrinhas Encantadas</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
              style={{ background: 'rgba(48,95,114,0.08)', color: '#567B8B' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7FB77E' }} />
              Sistema online
            </div>
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: '#1F4352' }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: '#6B7F88' }}>
              Acesso para educadores e administradores
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 rounded-xl border-0 text-sm"
                style={{
                  background: 'rgba(48,95,114,0.05)',
                  boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#F5A97C' }}
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 rounded-xl border-0 text-sm pr-10"
                  style={{
                    background: 'rgba(48,95,114,0.05)',
                    boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#98A5AB' }}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-11 rounded-xl text-sm font-semibold text-white overflow-hidden transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
            >
              {/* Shimmer on hover */}
              <span
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                }}
              />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

       
        </div>
      </div>
    </div>
  );
}
