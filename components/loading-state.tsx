export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid rgba(48,95,114,0.08)',
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{
            borderBottom: i < rows - 1 ? '1px solid rgba(48,95,114,0.05)' : 'none',
          }}
        >
          <div className="w-9 h-9 rounded-xl animate-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-36 rounded-lg animate-shimmer" />
            <div className="h-3 w-52 rounded-lg animate-shimmer" />
          </div>
          <div className="h-3 w-16 rounded-lg animate-shimmer hidden sm:block" />
        </div>
      ))}
    </div>
  );
}
