'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educatorsQuery } from '@/lib/queries';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AxiosError } from 'axios';
import { PageHeader } from '@/components/page-header';
import { DataTable, type TableColumn } from '@/components/data-table';
import { ConfirmDialog } from '@/components/confirm-dialog';

const avatarGradients = [
  'linear-gradient(135deg, #305F72, #567B8B)',
  'linear-gradient(135deg, #A988A9, #CBAACB)',
  'linear-gradient(135deg, #D48660, #F5A97C)',
  'linear-gradient(135deg, #4D8AB2, #6DAED9)',
];

interface EducatorFormData { name: string; email: string; password: string; }

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
          <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>{label}</Label>
          <Input
            id={id}
            type={type}
            value={form[field as keyof EducatorFormData]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder={placeholder}
            className="h-10 rounded-xl border-0 text-sm"
            style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}
          />
        </div>
      ))}

      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
        style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
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

  const { data: educators = [], isLoading } = useQuery<User[]>(educatorsQuery());

  const createMutation = useMutation({
    mutationFn: (d: EducatorFormData) => api.post('/admin/educators', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educators'] });
      setCreateOpen(false);
      toast.success('Educador criado com sucesso!');
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao criar educador.';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/educators/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educators'] });
      toast.success('Educador removido.');
    },
    onError: () => toast.error('Erro ao remover educador.'),
  });

  const columns: TableColumn<User>[] = [
    {
      header: 'Educador',
      render: (educator, idx) => (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: avatarGradients[idx % avatarGradients.length] }}
          >
            {educator.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{educator.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 flex-shrink-0" style={{ color: '#C2C8CB' }} />
              <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{educator.email}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Cadastro',
      hideOnMobile: true,
      headerClassName: 'w-44',
      className: 'w-44',
      render: (educator) =>
        educator.created_at ? (
          <span className="text-xs" style={{ color: '#98A5AB' }}>
            {formatDistanceToNow(new Date(educator.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        ) : (
          <span style={{ color: '#C2C8CB' }}>—</span>
        ),
    },
    {
      header: '',
      headerClassName: 'w-14',
      className: 'w-14 text-right',
      render: (educator) => (
        <ConfirmDialog
          trigger={
            <button
              className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
              style={{ background: 'rgba(217,117,107,0.1)' }}
            />
          }
          title={`Remover ${educator.name}?`}
          description="O acesso ao painel será revogado imediatamente."
          onConfirm={() => deleteMutation.mutate(educator.id)}
        >
          <Trash2 className="h-3.5 w-3.5" style={{ color: '#D9756B' }} />
        </ConfirmDialog>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader
        title="Educadores"
        description="Gerencie os acessos ao painel web"
        badge={educators.length}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
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

      <DataTable<User>
        columns={columns}
        data={educators}
        isLoading={isLoading}
        keyExtractor={(e) => e.id}
        emptyIcon={GraduationCap}
        emptyTitle="Nenhum educador cadastrado"
        emptyDescription="Crie o primeiro educador para dar acesso ao painel"
      />
    </div>
  );
}
