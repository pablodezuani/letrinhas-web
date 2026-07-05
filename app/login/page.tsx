'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles, Eye, EyeOff, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';

const FLOATING_LETTERS = [
  { char: 'A', x: '12%',  y: '18%', delay: '0s',    size: 52, rotate: -8 },
  { char: 'B', x: '72%',  y: '12%', delay: '0.7s',  size: 40, rotate: 10 },
  { char: 'C', x: '82%',  y: '52%', delay: '1.4s',  size: 48, rotate: -5 },
  { char: 'D', x: '18%',  y: '72%', delay: '2.1s',  size: 36, rotate: 8 },
  { char: 'E', x: '55%',  y: '78%', delay: '1.8s',  size: 44, rotate: -12 },
  { char: 'Z', x: '42%',  y: '30%', delay: '0.4s',  size: 32, rotate: 6 },
  { char: 'M', x: '65%',  y: '35%', delay: '1.1s',  size: 38, rotate: -4 },
  { char: 'S', x: '30%',  y: '48%', delay: '2.5s',  size: 30, rotate: 9 },
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

      {/* ── Left panel: illustration ─────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
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

        {/* Floating letter bubbles */}
        {FLOATING_LETTERS.map(({ char, x, y, delay, size, rotate }) => (
          <div
            key={char}
            className="absolute flex items-center justify-center rounded-2xl font-bold select-none pointer-events-none animate-float-letter"
            style={{
              left: x,
              top: y,
              width: size,
              height: size,
              fontSize: size * 0.48,
              animationDelay: delay,
              animationDuration: `${4 + Math.random() * 2}s`,
              background: 'rgba(255,255,255,0.07)',
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(4px)',
              rotate: `${rotate}deg`,
            }}
          >
            {char}
          </div>
        ))}

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
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

        {/* Hero text */}
        <div className="relative z-10">
          {/* Decorative tags */}
          <div className="flex items-center gap-2 mb-6">
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

          <h2 className="text-[2rem] font-bold text-white leading-snug mb-4">
            Acompanhe a evolução<br />
            <span style={{ color: '#F5A97C' }}>de cada criança</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Painel educacional para monitorar o progresso, gerenciar conteúdos e apoiar o desenvolvimento de crianças com TEA.
          </p>

          {/* Testimonial */}
          <div
            className="mt-8 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              "Conseguimos acompanhar o progresso de cada aluno de forma muito mais clara e personalizada."
            </p>
            <div className="flex items-center gap-2.5 mt-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #CBAACB, #F5A97C)' }}
              >
                A
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Ana Paula</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Educadora especialista</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom dots */}
        <div className="relative z-10 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: i === 1 ? 28 : 10,
                background: i === 1 ? '#F5A97C' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
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
