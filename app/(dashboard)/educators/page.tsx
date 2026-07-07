'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { educatorsQuery } from '@/lib/queries';
import { api } from '@/lib/api';
import { User, UserStatus, STATUS_LABELS } from '@/lib/types';
import { formatCpf, maskCpfDisplay } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/image-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Search, Plus, GraduationCap, MoreHorizontal, Eye, Pencil,
  Lock, Unlock, PowerOff, Power, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AxiosError } from 'axios';
import { PageHeader } from '@/components/page-header';
import { DataTable, type TableColumn } from '@/components/data-table';

const PAGE_SIZE = 8;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: '#E4F1E3', color: '#5C9A5B' },
  BLOCKED: { bg: '#FBE5E2', color: '#B85048' },
  INACTIVE: { bg: '#EEF0F1', color: '#6B7F88' },
};

const avatarGradients = [
  'linear-gradient(135deg, #305F72, #567B8B)',
  'linear-gradient(135deg, #A988A9, #CBAACB)',
  'linear-gradient(135deg, #D48660, #F5A97C)',
  'linear-gradient(135deg, #4D8AB2, #6DAED9)',
];

interface EducatorFormData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  photo: string;
}

const EMPTY_FORM: EducatorFormData = { name: '', email: '', password: '', cpf: '', photo: '' };

function StatusBadge({ status }: { status?: UserStatus }) {
  const s = status ?? 'ACTIVE';
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={STATUS_STYLE[s]}>
      {STATUS_LABELS[s]}
    </span>
  );
}

function EducatorAvatar({ educator, idx }: { educator: User; idx: number }) {
  if (educator.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={educator.photo} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />;
  }
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: avatarGradients[idx % avatarGradients.length] }}
    >
      {educator.name.charAt(0).toUpperCase()}
    </div>
  );
}
//dados

function EducatorForm({
  initial, mode, onSave, loading,
}: {
  initial: EducatorFormData;
  mode: 'create' | 'edit';
  onSave: (d: EducatorFormData) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<EducatorFormData>(initial);
  const cpfValid = form.cpf.length === 0 || form.cpf.length === 11;
  const canSave = mode === 'create'
    ? !!form.name && !!form.email && form.password.length >= 6 && cpfValid
    : !!form.name && !!form.email && cpfValid;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <ImageUpload shape="circle" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>Nome completo</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome do educador"
          className="h-10 rounded-xl border-0 text-sm"
          style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>E-mail</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="educador@escola.com"
          className="h-10 rounded-xl border-0 text-sm"
          style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>CPF</Label>
        <Input
          value={formatCpf(form.cpf)}
          onChange={(e) => setForm({ ...form, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
          placeholder="000.000.000-00"
          inputMode="numeric"
          className="h-10 rounded-xl border-0 text-sm"
          style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}
        />
        {!cpfValid && <p className="text-xs" style={{ color: '#D9756B' }}>CPF deve ter 11 dígitos.</p>}
      </div>

      {mode === 'create' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>Senha provisória</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Mínimo 6 caracteres"
            className="h-10 rounded-xl border-0 text-sm"
            style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}
          />
        </div>
      )}

      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
        style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
        disabled={loading || !canSave}
        onClick={() => onSave(form)}
      >
        {mode === 'create'
          ? (loading ? 'Criando...' : 'Criar educador')
          : (loading ? 'Salvando...' : 'Salvar alterações')}
      </button>
    </div>
  );
}

function EducatorDetail({ educator }: { educator: User }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <EducatorAvatar educator={educator} idx={0} />
        <div>
          <p className="font-semibold text-base" style={{ color: '#1F4352' }}>{educator.name}</p>
          <StatusBadge status={educator.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs" style={{ color: '#98A5AB' }}>E-mail</p>
          <p style={{ color: '#1F4352' }}>{educator.email}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: '#98A5AB' }}>CPF</p>
          <p style={{ color: '#1F4352' }}>{educator.cpf ? formatCpf(educator.cpf) : '—'}</p>
        </div>
        {educator.created_at && (
          <div>
            <p className="text-xs" style={{ color: '#98A5AB' }}>Cadastrado</p>
            <p style={{ color: '#1F4352' }}>
              {formatDistanceToNow(new Date(educator.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EducatorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEducator, setEditEducator] = useState<User | null>(null);
  const [viewEducator, setViewEducator] = useState<User | null>(null);
  const [deleteEducator, setDeleteEducator] = useState<User | null>(null);

  const { data: educators = [], isLoading } = useQuery<User[]>(educatorsQuery());

  const filtered = useMemo(() => {
    const searchDigits = search.replace(/\D/g, '');
    const searchLower = search.trim().toLowerCase();

    return educators.filter((e) => {
      if (statusFilter && (e.status ?? 'ACTIVE') !== statusFilter) return false;
      if (!searchLower) return true;
      const matchesName = e.name.toLowerCase().includes(searchLower);
      const matchesCpf = searchDigits.length > 0 && (e.cpf ?? '').includes(searchDigits);
      return matchesName || matchesCpf;
    });
  }, [educators, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setFilter(fn: () => void) {
    fn();
    setPage(1);
  }

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EducatorFormData }) => api.put(`/admin/educators/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educators'] });
      setEditEducator(null);
      toast.success('Educador atualizado!');
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao atualizar.';
      toast.error(msg);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      api.patch(`/admin/educators/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educators'] });
      toast.success('Status atualizado.');
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/educators/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educators'] });
      setDeleteEducator(null);
      toast.success('Educador removido.');
    },
    onError: () => toast.error('Erro ao remover educador.'),
  });

  const columns: TableColumn<User>[] = [
    {
      header: 'Educador',
      render: (educator, idx) => (
        <div className="flex items-center gap-3">
          <EducatorAvatar educator={educator} idx={idx} />
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{educator.name}</p>
            <p className="text-xs truncate" style={{ color: '#98A5AB' }}>{educator.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'CPF',
      headerClassName: 'w-40',
      className: 'w-40',
      hideOnMobile: true,
      render: (educator) => (
        <span style={{ color: '#6B7F88' }}>{maskCpfDisplay(educator.cpf)}</span>
      ),
    },
    {
      header: 'Status',
      headerClassName: 'w-32',
      className: 'w-32',
      render: (educator) => <StatusBadge status={educator.status} />,
    },
    {
      header: 'Cadastro',
      hideOnMobile: true,
      headerClassName: 'w-40',
      className: 'w-40',
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
      render: (educator) => {
        const status = educator.status ?? 'ACTIVE';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="w-8 h-8 rounded-xl flex items-center justify-center ml-auto transition-colors"
                  style={{ background: 'rgba(48,95,114,0.06)' }}
                  onClick={(e) => e.stopPropagation()}
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" style={{ color: '#567B8B' }} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setViewEducator(educator)}>
                <Eye className="h-3.5 w-3.5" /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditEducator(educator)}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {status === 'BLOCKED' ? (
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: educator.id, status: 'ACTIVE' })}>
                  <Unlock className="h-3.5 w-3.5" /> Desbloquear
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: educator.id, status: 'BLOCKED' })}>
                  <Lock className="h-3.5 w-3.5" /> Bloquear
                </DropdownMenuItem>
              )}
              {status === 'INACTIVE' ? (
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: educator.id, status: 'ACTIVE' })}>
                  <Power className="h-3.5 w-3.5" /> Ativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => statusMutation.mutate({ id: educator.id, status: 'INACTIVE' })}>
                  <PowerOff className="h-3.5 w-3.5" /> Desativar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteEducator(educator)}>
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader
        title="Educadores"
        description="Gerencie os acessos ao painel web"
        badge={filtered.length}
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
          <EducatorForm mode="create" initial={EMPTY_FORM} onSave={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editEducator} onOpenChange={(o) => !o && setEditEducator(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar educador</DialogTitle></DialogHeader>
          {editEducator && (
            <EducatorForm
              mode="edit"
              initial={{
                name: editEducator.name,
                email: editEducator.email,
                password: '',
                cpf: editEducator.cpf ?? '',
                photo: editEducator.photo ?? '',
              }}
              onSave={(d) => updateMutation.mutate({ id: editEducator.id, data: d })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewEducator} onOpenChange={(o) => !o && setViewEducator(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do educador</DialogTitle></DialogHeader>
          {viewEducator && <EducatorDetail educator={viewEducator} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteEducator} onOpenChange={(o) => !o && setDeleteEducator(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {deleteEducator?.name}?</AlertDialogTitle>
            <AlertDialogDescription>O acesso ao painel será revogado imediatamente. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEducator && deleteMutation.mutate(deleteEducator.id)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
          <Input
            placeholder="Buscar por nome ou CPF..."
            className="pl-10 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm"
            style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
            value={search}
            onChange={(e) => setFilter(() => setSearch(e.target.value))}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setFilter(() => setStatusFilter(v ?? ''))}>
          <SelectTrigger className="w-48 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<User>
        columns={columns}
        data={paged}
        isLoading={isLoading}
        keyExtractor={(e) => e.id}
        emptyIcon={educators.length === 0 ? GraduationCap : Search}
        emptyTitle={educators.length === 0 ? 'Nenhum educador cadastrado' : 'Nenhum resultado encontrado'}
        emptyDescription={
          educators.length === 0
            ? 'Crie o primeiro educador para dar acesso ao painel'
            : 'Tente outro nome, CPF ou status'
        }
      />

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: '#98A5AB' }}>Página {page} de {totalPages}</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
              style={{ background: 'rgba(48,95,114,0.06)' }}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: '#305F72' }} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40"
              style={{ background: 'rgba(48,95,114,0.06)' }}
            >
              <ChevronRight className="h-4 w-4" style={{ color: '#305F72' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
