import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Erro ao carregar',
  message = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: 'rgba(217,117,107,0.06)',
        border: '1px solid rgba(217,117,107,0.18)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(217,117,107,0.12)' }}
      >
        <AlertCircle className="h-5 w-5" style={{ color: '#C05050' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#C05050' }}>{title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9B4B44' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'rgba(217,117,107,0.12)', color: '#C05050' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(217,117,107,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(217,117,107,0.12)')}
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
