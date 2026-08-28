'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { schoolsQuery } from '@/lib/queries';
import { api } from '@/lib/api';
import { School, SchoolStatus, SCHOOL_STATUS_LABELS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Search, Plus, School as SchoolIcon, MoreHorizontal, Pencil,
  PowerOff, Power, Trash2, Users, GraduationCap, MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import { PageHeader } from '@/components/page-header';
import { DataTable, type TableColumn } from '@/components/data-table';

const STATUS_STYLE: Record<SchoolStatus, { bg: string; color: string }> = {
  ACTIVE: { bg: '#E4F1E3', color: '#5C9A5B' },
  INACTIVE: { bg: '#EEF0F1', color: '#6B7F88' },
};

interface SchoolFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

const EMPTY_FORM: SchoolFormData = { name: '', address: '', city: '', state: '', phone: '' };

function StatusBadge({ status }: { status: SchoolStatus }) {
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={STATUS_STYLE[status]}>
      {SCHOOL_STATUS_LABELS[status]}
    </span>
  );
}

function SchoolForm({
  initial, onSave, loading,
}: {
  initial: SchoolFormData;
  onSave: (d: SchoolFormData) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<SchoolFormData>(initial);
  const canSave = !!form.name.trim();

  const fieldStyle = { background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' };
  const labelClass = 'text-xs font-semibold uppercase tracking-wide';

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className={labelClass} style={{ color: '#305F72' }}>Nome da unidade</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: Unidade Centro"
          className="h-10 rounded-xl border-0 text-sm"
          style={fieldStyle}
        />
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass} style={{ color: '#305F72' }}>Endereço</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Rua, número"
          className="h-10 rounded-xl border-0 text-sm"
          style={fieldStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelClass} style={{ color: '#305F72' }}>Cidade</Label>
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="h-10 rounded-xl border-0 text-sm"
            style={fieldStyle}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass} style={{ color: '#305F72' }}>UF</Label>
          <Input
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })}
            className="h-10 rounded-xl border-0 text-sm"
            style={fieldStyle}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={labelClass} style={{ color: '#305F72' }}>Telefone</Label>
        <Input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="(00) 00000-0000"
          className="h-10 rounded-xl border-0 text-sm"
          style={fieldStyle}
        />
      </div>

      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
        style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
        disabled={loading || !canSave}
        onClick={() => onSave(form)}
      >
        {loading ? 'Salvando...' : 'Salvar unidade'}
      </button>
    </div>
  );
}

export default function SchoolPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [deleteSchool, setDeleteSchool] = useState<School | null>(null);

  const { data: schools = [], isLoading } = useQuery(schoolsQuery(search, statusFilter));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['schools'] });

  const createMutation = useMutation({
    mutationFn: (d: SchoolFormData) => api.post('/admin/schools', d),
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      toast.success('Unidade criada com sucesso!');
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao criar unidade.';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SchoolFormData }) => api.put(`/admin/schools/${id}`, data),
    onSuccess: () => {
      invalidate();
      setEditSchool(null);
      toast.success('Unidade atualizada!');
    },
    onError: () => toast.error('Erro ao atualizar unidade.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: SchoolStatus }) => api.patch(`/admin/schools/${id}/status`, { status }),
    onSuccess: () => {
      invalidate();
      toast.success('Status atualizado.');
    },
    onError: () => toast.error('Erro ao atualizar status.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/schools/${id}`),
    onSuccess: (res) => {
      invalidate();
      setDeleteSchool(null);
      const affected = res.data?.affectedChildren ?? 0;
      toast.success(affected > 0 ? `Unidade removida. ${affected} criança(s) ficaram sem unidade.` : 'Unidade removida.');
    },
    onError: () => toast.error('Erro ao remover unidade.'),
  });

  const columns: TableColumn<School>[] = useMemo(() => [
    {
      header: 'Unidade',
      render: (school) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(48,95,114,0.08)' }}>
            <SchoolIcon className="h-4 w-4" style={{ color: '#305F72' }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: '#1F4352' }}>{school.name}</p>
            {(school.address || school.city) && (
              <p className="text-xs truncate flex items-center gap-1" style={{ color: '#98A5AB' }}>
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {[school.address, school.city, school.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Crianças',
      headerClassName: 'w-28',
      className: 'w-28',
      hideOnMobile: true,
      render: (school) => (
        <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: '#6B7F88' }}>
          <Users className="h-3.5 w-3.5" /> {school._count?.children ?? 0}
        </span>
      ),
    },
    {
      header: 'Educadoras',
      headerClassName: 'w-32',
      className: 'w-32',
      hideOnMobile: true,
      render: (school) => (
        <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: '#6B7F88' }}>
          <GraduationCap className="h-3.5 w-3.5" /> {school._count?.educators ?? 0}
        </span>
      ),
    },
    {
      header: 'Status',
      headerClassName: 'w-28',
      className: 'w-28',
      render: (school) => <StatusBadge status={school.status} />,
    },
    {
      header: '',
      headerClassName: 'w-14',
      className: 'w-14 text-right',
      render: (school) => (
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
            <DropdownMenuItem onClick={() => setEditSchool(school)}>
              <Pencil className="h-3.5 w-3.5" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {school.status === 'INACTIVE' ? (
              <DropdownMenuItem onClick={() => statusMutation.mutate({ id: school.id, status: 'ACTIVE' })}>
                <Power className="h-3.5 w-3.5" /> Ativar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => statusMutation.mutate({ id: school.id, status: 'INACTIVE' })}>
                <PowerOff className="h-3.5 w-3.5" /> Desativar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteSchool(school)}>
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [statusMutation]);

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader
        title="Escola"
        description="Gerencie unidades, vínculos com educadoras e crianças"
        badge={schools.length}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
          >
            <Plus className="h-4 w-4" />
            Nova unidade
          </button>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova unidade</DialogTitle></DialogHeader>
          <SchoolForm initial={EMPTY_FORM} onSave={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSchool} onOpenChange={(o) => !o && setEditSchool(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar unidade</DialogTitle></DialogHeader>
          {editSchool && (
            <SchoolForm
              initial={{
                name: editSchool.name,
                address: editSchool.address ?? '',
                city: editSchool.city ?? '',
                state: editSchool.state ?? '',
                phone: editSchool.phone ?? '',
              }}
              onSave={(d) => updateMutation.mutate({ id: editSchool.id, data: d })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteSchool} onOpenChange={(o) => !o && setDeleteSchool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {deleteSchool?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              As crianças vinculadas a esta unidade ficarão sem unidade. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSchool && deleteMutation.mutate(deleteSchool.id)}
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
            placeholder="Buscar por nome..."
            className="pl-10 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm"
            style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
          <SelectTrigger className="w-48 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {Object.entries(SCHOOL_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<School>
        columns={columns}
        data={schools}
        isLoading={isLoading}
        keyExtractor={(s) => s.id}
        onRowClick={(s) => router.push(`/school/${s.id}`)}
        emptyIcon={schools.length === 0 ? SchoolIcon : Search}
        emptyTitle={schools.length === 0 ? 'Nenhuma unidade cadastrada' : 'Nenhum resultado encontrado'}
        emptyDescription={
          schools.length === 0
            ? 'Crie a primeira unidade para começar a vincular crianças e educadoras'
            : 'Tente outro nome ou status'
        }
      />
    </div>
  );
}
