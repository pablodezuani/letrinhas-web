'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AxiosError } from 'axios';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

interface EducatorFormData { name: string; email: string; password: string; }

const avatarGradients = [
  'linear-gradient(135deg, #305F72, #567B8B)',
  'linear-gradient(135deg, #A988A9, #CBAACB)',
  'linear-gradient(135deg, #D48660, #F5A97C)',
  'linear-gradient(135deg, #4D8AB2, #6DAED9)',
];

function EducatorForm({ onSave, loading }: { onSave: (d: EducatorFormData) => void; loading: boolean }) {
  const [form, setForm] = useState<EducatorFormData>({ name: '', email: '', password: '' });

  return (
    <div className="space-y-4">
      {[
        { id: 'name', label: 'Nome completo', placeholder: 'Nome do educador', type: 'text', field: 'name' },
        { id: 'email', label: 'E-mail', placeholder: 'educador@escola.com', type: 'email', field: 'email' },
        { id: 'password', label: 'Senha provisória', placeholder: 'Mínimo 6 caracteres', type: 'password', field: 'password' },
      ].map(({ id, label, placeholder, type, field }) => (
        <div key={id} className="space-y-1.5">
          <Label className="text-sm font-medium" style={{ color: '#305F72' }}>{label}</Label>
          <Input
            id={id}
            type={type}
            value={form[field as keyof EducatorFormData]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder={placeholder}
            className="h-10 rounded-xl border-0 bg-[#FFF8F4] ring-1 text-sm"
          />
        </div>
      ))}

      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
        disabled={loading || !form.name || !form.email || form.password.length < 6}
        onClick={() => onSave(form)}
      >
        {loading ? 'Criando...' : 'Criar educador'}
      </button>
    </div>
  );
}

export default function EducatorsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: educators = [], isLoading } = useQuery<User[]>({
    queryKey: ['educators'],
    queryFn: async () => {
      const { data } = await api.get('/admin/educators');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: EducatorFormData) => api.post('/admin/educators', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educators'] });
      setCreateOpen(false);
      toast.success('Educador criado!');
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao criar educador.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/educators/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['educators'] }); toast.success('Removido.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Educadores"
        description="Gerencie os acessos ao painel web"
        badge={educators.length}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
          >
            <Plus className="h-4 w-4" />
            Novo educador
          </button>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo educador</DialogTitle></DialogHeader>
          <EducatorForm onSave={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" style={{ background: '#F6EEE6' }} />
          ))}
        </div>
      ) : educators.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhum educador cadastrado"
          description="Crie o primeiro educador para dar acesso ao painel"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {educators.map((educator, idx) => (
            <div
              key={educator.id}
              className="bg-white rounded-2xl p-5 ring-1 flex items-center gap-4 group"
              style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: avatarGradients[idx % avatarGradients.length] }}
              >
                {educator.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{educator.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3 flex-shrink-0" style={{ color: '#98A5AB' }} />
                  <p className="text-xs truncate" style={{ color: '#6B7F88' }}>{educator.email}</p>
                </div>
              </div>

              {educator.created_at && (
                <p className="text-xs hidden sm:block flex-shrink-0" style={{ color: '#98A5AB' }}>
                  {formatDistanceToNow(new Date(educator.created_at), { addSuffix: true, locale: ptBR })}
                </p>
              )}

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <button
                      className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ background: 'rgba(217,117,107,0.1)' }}
                    />
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" style={{ color: '#D9756B' }} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover {educator.name}?</AlertDialogTitle>
                    <AlertDialogDescription>O acesso ao painel será revogado imediatamente.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(educator.id)} className="bg-red-500 hover:bg-red-600">Remover</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
