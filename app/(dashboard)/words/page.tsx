'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wordsQuery } from '@/lib/queries';
import { api } from '@/lib/api';
import type { Word } from '@/lib/types';
import { GAME_LABELS, DIFFICULTY_LABELS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { DataTable, type TableColumn } from '@/components/data-table';
import { ConfirmDialog } from '@/components/confirm-dialog';

const GAME_OPTIONS = Object.entries(GAME_LABELS);
const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS);

const difficultyStyle: Record<string, { bg: string; color: string }> = {
  EASY:   { bg: '#E4F1E3', color: '#5C9A5B' },
  MEDIUM: { bg: '#FBEED1', color: '#B98A2D' },
  HARD:   { bg: '#FBE5E2', color: '#B85048' },
};

interface WordFormData {
  text: string; category: string; difficulty: string; imageUrl: string; gameTypes: string[];
}
const EMPTY_FORM: WordFormData = { text: '', category: '', difficulty: 'EASY', imageUrl: '', gameTypes: [] };

function WordForm({ initial, onSave, loading }: { initial: WordFormData; onSave: (d: WordFormData) => void; loading: boolean }) {
  const [form, setForm] = useState<WordFormData>(initial);

  return (
    <div className="space-y-4">
      {[
        { id: 'text',     label: 'Palavra *',    placeholder: 'Ex: cachorro', field: 'text' },
        { id: 'category', label: 'Categoria *',  placeholder: 'Ex: animais',  field: 'category' },
        { id: 'imageUrl', label: 'URL da imagem', placeholder: 'https://...', field: 'imageUrl' },
      ].map(({ id, label, placeholder, field }) => (
        <div key={id} className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>{label}</Label>
          <Input
            id={id}
            value={form[field as keyof WordFormData] as string}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder={placeholder}
            className="h-10 rounded-xl border-0 text-sm"
            style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}
          />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>Dificuldade</Label>
        <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v ?? 'EASY' })}>
          <SelectTrigger className="h-10 rounded-xl border-0 text-sm w-full" style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#305F72' }}>Jogos</Label>
        <div className="flex flex-wrap gap-2">
          {GAME_OPTIONS.map(([value, label]) => {
            const active = form.gameTypes.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({
                  ...f,
                  gameTypes: active ? f.gameTypes.filter((g) => g !== value) : [...f.gameTypes, value],
                }))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={
                  active
                    ? { background: '#305F72', color: '#fff', borderColor: '#305F72' }
                    : { background: 'rgba(48,95,114,0.04)', color: '#6B7F88', borderColor: 'rgba(48,95,114,0.15)' }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50 mt-2"
        style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
        disabled={loading || !form.text || !form.category}
        onClick={() => onSave(form)}
      >
        {loading ? 'Salvando...' : 'Salvar palavra'}
      </button>
    </div>
  );
}

export default function WordsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch]       = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editWord, setEditWord]   = useState<Word | null>(null);

  const { data: words = [], isLoading } = useQuery<Word[]>(wordsQuery(search, gameFilter));

  const createMutation = useMutation({
    mutationFn: (d: WordFormData) => api.post('/admin/words', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['words'] }); setCreateOpen(false); toast.success('Palavra criada!'); },
    onError: () => toast.error('Erro ao criar.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WordFormData }) => api.put(`/admin/words/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['words'] }); setEditWord(null); toast.success('Atualizada!'); },
    onError: () => toast.error('Erro ao atualizar.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/words/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['words'] }); toast.success('Removida.'); },
    onError: () => toast.error('Erro ao remover.'),
  });

  const columns: TableColumn<Word>[] = [
    {
      header: 'Palavra',
      render: (word) => (
        <div>
          <p className="font-bold" style={{ color: '#1F4352' }}>{word.text}</p>
          <p className="text-xs capitalize mt-0.5" style={{ color: '#98A5AB' }}>{word.category}</p>
        </div>
      ),
    },
    {
      header: 'Dificuldade',
      hideOnMobile: true,
      headerClassName: 'w-32',
      className: 'w-32',
      render: (word) => {
        const diff = difficultyStyle[word.difficulty] ?? difficultyStyle.EASY;
        return (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: diff.bg, color: diff.color }}
          >
            {DIFFICULTY_LABELS[word.difficulty]}
          </span>
        );
      },
    },
    {
      header: 'Jogos',
      hideOnMobile: true,
      render: (word) => (
        <div className="flex flex-wrap gap-1">
          {word.gameTypes.map((g) => (
            <span
              key={g}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{ background: 'rgba(48,95,114,0.07)', color: '#567B8B' }}
            >
              {GAME_LABELS[g] ?? g}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: '',
      headerClassName: 'w-20',
      className: 'w-20',
      render: (word) => (
        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setEditWord(word); }}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(48,95,114,0.07)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(48,95,114,0.14)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(48,95,114,0.07)')}
          >
            <Pencil className="h-3.5 w-3.5" style={{ color: '#305F72' }} />
          </button>
          <ConfirmDialog
            trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(217,117,107,0.1)' }}
              />
            }
            title={`Remover "${word.text}"?`}
            onConfirm={() => deleteMutation.mutate(word.id)}
          >
            <Trash2 className="h-3.5 w-3.5" style={{ color: '#D9756B' }} />
          </ConfirmDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader
        title="Palavras"
        description="Conteúdo dos jogos do aplicativo"
        badge={words.length}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
          >
            <Plus className="h-4 w-4" />
            Nova palavra
          </button>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova palavra</DialogTitle></DialogHeader>
          <WordForm initial={EMPTY_FORM} onSave={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editWord} onOpenChange={(o) => !o && setEditWord(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar palavra</DialogTitle></DialogHeader>
          {editWord && (
            <WordForm
              initial={{ text: editWord.text, category: editWord.category, difficulty: editWord.difficulty, imageUrl: editWord.imageUrl ?? '', gameTypes: editWord.gameTypes }}
              onSave={(d) => updateMutation.mutate({ id: editWord.id, data: d })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
          <Input
            placeholder="Buscar palavra..."
            className="pl-10 h-10 rounded-xl border-0 bg-white text-sm"
            style={{ boxShadow: 'var(--shadow-xs)', border: '1px solid rgba(48,95,114,0.1)' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={gameFilter} onValueChange={(v) => setGameFilter(v ?? '')}>
          <SelectTrigger
            className="w-52 h-10 rounded-xl border-0 bg-white text-sm"
            style={{ boxShadow: 'var(--shadow-xs)', border: '1px solid rgba(48,95,114,0.1)' }}
          >
            <SelectValue placeholder="Filtrar por jogo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os jogos</SelectItem>
            {GAME_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable<Word>
        columns={columns}
        data={words}
        isLoading={isLoading}
        keyExtractor={(w) => w.id}
        emptyIcon={BookOpen}
        emptyTitle="Nenhuma palavra encontrada"
        emptyDescription="Adicione palavras para os jogos usando o botão acima"
      />
    </div>
  );
}
