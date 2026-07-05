'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/password-reset/request', { email });
      setSent(true);
    } catch {
      toast.error('Erro ao solicitar recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFF8F4' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#305F72' }}>Letrinhas Encantadas</span>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm ring-1" style={{ '--tw-ring-color': 'rgba(48,95,114,0.1)' } as React.CSSProperties}>
          {sent ? (
            <div className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#E4F1E3' }}
              >
                <CheckCircle2 className="w-7 h-7" style={{ color: '#7FB77E' }} />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: '#1F4352' }}>E-mail enviado</h2>
              <p className="text-sm mb-6" style={{ color: '#6B7F88' }}>
                Se o e-mail estiver cadastrado, você receberá as instruções em breve.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: '#305F72' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold mb-1" style={{ color: '#1F4352' }}>Recuperar senha</h1>
                <p className="text-sm" style={{ color: '#6B7F88' }}>
                  Informe seu e-mail para receber o link de recuperação.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#305F72' }}>
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl border-0 bg-[#FFF8F4] shadow-sm ring-1 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
                >
                  {loading ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: '#6B7F88' }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
