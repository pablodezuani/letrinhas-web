'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Word, GAME_LABELS, DIFFICULTY_LABELS } from '@/lib/types';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

const GAME_OPTIONS = Object.entries(GAME_LABELS);
const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS);

const difficultyStyle: Record<string, { bg: string; color: string }> = {
  EASY: { bg: '#E4F1E3', color: '#5C9A5B' },
  MEDIUM: { bg: '#FBEED1', color: '#B98A2D' },
  HARD: { bg: '#FBE5E2', color: '#B85048' },
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
        { id: 'text', label: 'Palavra *', placeholder: 'Ex: cachorro', field: 'text' },
        { id: 'category', label: 'Categoria *', placeholder: 'Ex: animais', field: 'category' },
        { id: 'imageUrl', label: 'URL da imagem', placeholder: 'https://...', field: 'imageUrl' },
      ].map(({ id, label, placeholder, field }) => (
        <div key={id} className="space-y-1.5">
          <Label className="text-sm font-medium" style={{ color: '#305F72' }}>{label}</Label>
          <Input
            id={id}
            value={form[field as keyof WordFormData] as string}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder={placeholder}
            className="h-10 rounded-xl border-0 bg-[#FFF8F4] ring-1 text-sm"
          />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label className="text-sm font-medium" style={{ color: '#305F72' }}>Dificuldade</Label>
        <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v ?? 'EASY' })}>
          <SelectTrigger className="h-10 rounded-xl border-0 bg-[#FFF8F4] ring-1 text-sm w-full">
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
        <Label className="text-sm font-medium" style={{ color: '#305F72' }}>Jogos</Label>
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
                className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                style={active
                  ? { background: '#305F72', color: '#fff', borderColor: '#305F72' }
                  : { background: '#FFF8F4', color: '#6B7F88', borderColor: 'rgba(48,95,114,0.15)' }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
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
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editWord, setEditWord] = useState<Word | null>(null);

  const { data: words = [], isLoading } = useQuery<Word[]>({
    queryKey: ['words', search, gameFilter],
    queryFn: async () => {
      const { data } = await api.get('/admin/words', {
        params: { ...(search && { search }), ...(gameFilter && { gameType: gameFilter }) },
      });
      return data;
    },
  });

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Palavras"
        description="Conteúdo dos jogos do aplicativo"
        badge={words.length}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #305F72, #567B8B)' }}
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

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#98A5AB' }} />
          <Input
            placeholder="Buscar palavra..."
            className="pl-10 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm"
            style={{ '--tw-ring-color': 'rgba(48,95,114,0.12)' } as React.CSSProperties}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={gameFilter} onValueChange={(v) => setGameFilter(v ?? '')}>
          <SelectTrigger className="w-48 h-10 rounded-xl border-0 bg-white shadow-sm ring-1 text-sm">
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" style={{ background: '#F6EEE6' }} />
          ))}
        </div>
      ) : words.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma palavra encontrada"
          description="Adicione palavras para os jogos"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => {
            const diff = difficultyStyle[word.difficulty] ?? difficultyStyle.EASY;
            return (
              <div key={word.id} className="bg-white rounded-2xl p-5 ring-1 group" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg" style={{ color: '#1F4352' }}>{word.text}</p>
                    <p className="text-xs capitalize mt-0.5" style={{ color: '#98A5AB' }}>{word.category}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditWord(word)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(48,95,114,0.06)' }}
                    >
                      <Pencil className="h-3.5 w-3.5" style={{ color: '#305F72' }} />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger render={<button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(217,117,107,0.1)' }} />}>
                        <Trash2 className="h-3.5 w-3.5" style={{ color: '#D9756B' }} />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover "{word.text}"?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(word.id)} className="bg-red-500 hover:bg-red-600">Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={diff}>
                    {DIFFICULTY_LABELS[word.difficulty]}
                  </span>
                  {word.gameTypes.map((g) => (
                    <span key={g} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(48,95,114,0.06)', color: '#567B8B' }}>
                      {GAME_LABELS[g] ?? g}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
