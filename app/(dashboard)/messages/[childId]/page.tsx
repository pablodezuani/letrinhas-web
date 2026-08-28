'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { conversationMessagesQuery } from '@/lib/queries';
import { uploadAttachment, kindFromMime } from '@/lib/upload';
import { useAuth } from '@/contexts/auth-context';
import type { Conversation, Child } from '@/lib/types';
import {
  ArrowLeft, Send, Paperclip, X, FileText, Video, Loader2, School as SchoolIcon,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

function formatDay(date: Date) {
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "dd 'de' MMMM", { locale: ptBR });
}

function AttachmentBubble({ attachment }: { attachment: NonNullable<Conversation['lastMessage']>['attachment'] }) {
  if (!attachment) return null;

  if (attachment.kind === 'IMAGE') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={attachment.url} alt={attachment.fileName} className="rounded-xl max-w-full max-h-64 object-cover mb-1.5" />
    );
  }
  if (attachment.kind === 'VIDEO') {
    return <video src={attachment.url} controls className="rounded-xl max-w-full max-h-64 mb-1.5" />;
  }
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5"
      style={{ background: 'rgba(48,95,114,0.06)' }}
    >
      <FileText className="h-5 w-5 flex-shrink-0" style={{ color: '#305F72' }} />
      <span className="text-xs font-medium truncate" style={{ color: '#305F72' }}>{attachment.fileName}</span>
    </a>
  );
}

export default function MessageThreadPage() {
  const { childId } = useParams<{ childId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: messages = [], isLoading } = useQuery(conversationMessagesQuery(childId));

  const { data: context } = useQuery<{ child: Child }>({
    queryKey: ['conversation-context', childId],
    queryFn: () => api.get(`/conversations/${childId}`).then((r) => r.data),
    enabled: !!childId,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!childId) return;
    api.patch(`/conversations/${childId}/read`).then(() => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    }).catch(() => {});
  }, [childId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      let attachment;
      if (file) {
        abortRef.current = new AbortController();
        attachment = await uploadAttachment(childId, file, setUploadPct, abortRef.current.signal);
      }
      return api.post('/messages', { childId, body: body.trim() || undefined, attachment });
    },
    onSuccess: () => {
      setBody('');
      setFile(null);
      setUploadPct(null);
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', childId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err: unknown) => {
      const msg = (err as AxiosError<{ error: string }>).response?.data?.error ?? 'Erro ao enviar mensagem.';
      toast.error(msg);
      setUploadPct(null);
    },
  });

  const canSend = (body.trim().length > 0 || !!file) && !sendMutation.isPending;

  let lastDay = '';

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="flex items-center gap-3 px-1 pb-4 flex-shrink-0">
        <Link href="/messages" className="flex-shrink-0" style={{ color: '#6B7F88' }}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {context?.child.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={context.child.photo} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'rgba(48,95,114,0.08)', color: '#305F72' }}>
            {context?.child.name.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: '#1F4352' }}>{context?.child.name ?? '...'}</p>
          {context?.child.school && (
            <p className="text-xs truncate flex items-center gap-1" style={{ color: '#98A5AB' }}>
              <SchoolIcon className="h-3 w-3" /> {context.child.school.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 space-y-1 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#98A5AB' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm font-semibold" style={{ color: '#305F72' }}>Nenhuma mensagem ainda</p>
            <p className="text-xs mt-1 max-w-xs" style={{ color: '#98A5AB' }}>Envie uma mensagem, foto, vídeo ou documento para o responsável.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === user?.id;
            const day = formatDay(new Date(msg.createdAt));
            const showDaySeparator = day !== lastDay;
            lastDay = day;

            return (
              <div key={msg.id}>
                {showDaySeparator && (
                  <div className="flex justify-center my-3">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(48,95,114,0.06)', color: '#98A5AB' }}>
                      {day}
                    </span>
                  </div>
                )}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'} px-1 mb-1.5`}>
                  <div className="max-w-[75%]">
                    {!mine && <p className="text-[11px] font-medium mb-1 px-1" style={{ color: '#98A5AB' }}>{msg.sender.name}</p>}
                    <div
                      className="rounded-2xl px-3.5 py-2.5"
                      style={
                        mine
                          ? { background: 'linear-gradient(135deg, #1F4352 0%, #305F72 100%)', color: '#fff', borderBottomRightRadius: 4 }
                          : { background: '#fff', color: '#1F4352', boxShadow: 'inset 0 0 0 1px rgba(48,95,114,0.08)', borderBottomLeftRadius: 4 }
                      }
                    >
                      <AttachmentBubble attachment={msg.attachment} />
                      {msg.body && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>}
                    </div>
                    <p className={`text-[10px] mt-1 px-1 ${mine ? 'text-right' : ''}`} style={{ color: '#98A5AB' }}>
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 pt-2">
        {file && (
          <div className="flex items-center gap-2.5 px-3.5 py-2 mb-2 rounded-xl" style={{ background: 'rgba(48,95,114,0.06)' }}>
            {kindFromMime(file.type) === 'VIDEO' ? <Video className="h-4 w-4" style={{ color: '#305F72' }} /> : <FileText className="h-4 w-4" style={{ color: '#305F72' }} />}
            <span className="text-xs font-medium truncate flex-1" style={{ color: '#305F72' }}>{file.name}</span>
            {uploadPct !== null ? (
              <span className="text-xs flex-shrink-0" style={{ color: '#98A5AB' }}>{Math.round(uploadPct)}%</span>
            ) : (
              <button onClick={() => setFile(null)} className="flex-shrink-0">
                <X className="h-3.5 w-3.5" style={{ color: '#98A5AB' }} />
              </button>
            )}
          </div>
        )}

        {uploadPct !== null && (
          <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(48,95,114,0.08)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${uploadPct}%`, background: '#305F72' }} />
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sendMutation.isPending}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50"
            style={{ background: 'rgba(48,95,114,0.06)' }}
          >
            <Paperclip className="h-4 w-4" style={{ color: '#567B8B' }} />
          </button>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) sendMutation.mutate();
              }
            }}
            placeholder="Escreva uma mensagem..."
            rows={1}
            className="flex-1 resize-none rounded-xl border-0 px-3.5 py-2.5 text-sm outline-none"
            style={{ background: 'rgba(48,95,114,0.04)', boxShadow: 'inset 0 0 0 1.5px rgba(48,95,114,0.15)', maxHeight: 100 }}
          />
          <button
            onClick={() => sendMutation.mutate()}
            disabled={!canSend}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1F4352 0%, #305F72 50%, #567B8B 100%)' }}
          >
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
