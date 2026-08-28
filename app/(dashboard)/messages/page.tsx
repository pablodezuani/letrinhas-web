'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { conversationsQuery } from '@/lib/queries';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { MessageSquare, Paperclip, Video, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ATTACHMENT_PREVIEW: Record<string, { icon: typeof Paperclip; label: string }> = {
  IMAGE: { icon: Paperclip, label: 'Imagem' },
  VIDEO: { icon: Video, label: 'Vídeo' },
  DOCUMENT: { icon: FileText, label: 'Documento' },
};

export default function MessagesPage() {
  const { data: conversations = [], isLoading } = useQuery(conversationsQuery());

  return (
    <div className="space-y-6 animate-page-enter">
      <PageHeader
        title="Mensagens"
        description="Comunicação com os responsáveis pelas crianças"
        badge={conversations.length}
      />

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" style={{ background: '#F6EEE6' }} />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Nenhuma conversa disponível"
          description="Conversas aparecem aqui quando uma criança atribuída a você tiver unidade e educadora responsável definidas."
        />
      ) : (
        <div className="bg-white rounded-2xl ring-1 overflow-hidden" style={{ '--tw-ring-color': 'rgba(48,95,114,0.08)' } as React.CSSProperties}>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {conversations.map((conv) => {
              const attachment = conv.lastMessage?.attachment;
              const AttachmentInfo = attachment ? ATTACHMENT_PREVIEW[attachment.kind] : null;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.child.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-black/[0.015]"
                >
                  {conv.child.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={conv.child.photo} alt="" className="w-11 h-11 rounded-2xl object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                      style={{ background: conv.child.lightColor ?? 'rgba(48,95,114,0.08)', color: conv.child.color ?? '#305F72' }}
                    >
                      {conv.child.emoji ?? conv.child.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1F4352' }}>{conv.child.name}</p>
                      <span className="text-xs truncate" style={{ color: '#98A5AB' }}>· {conv.child.parent.name}</span>
                    </div>
                    <p className="text-xs truncate mt-0.5 flex items-center gap-1" style={{ color: conv.unreadCount > 0 ? '#305F72' : '#98A5AB', fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
                      {AttachmentInfo && <AttachmentInfo.icon className="h-3 w-3 flex-shrink-0" />}
                      {conv.lastMessage
                        ? (conv.lastMessage.body || AttachmentInfo?.label || 'Anexo')
                        : 'Nenhuma mensagem ainda'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {conv.lastMessage && (
                      <span className="text-xs" style={{ color: '#98A5AB' }}>
                        {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span
                        className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                        style={{ background: '#F5A97C', color: '#1F4352' }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
