interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(48,95,114,0.06)' }}
      >
        <Icon className="h-7 w-7" style={{ color: '#98A5AB' }} />
      </div>
      <p className="font-semibold text-base" style={{ color: '#305F72' }}>{title}</p>
      {description && (
        <p className="text-sm mt-1 max-w-xs" style={{ color: '#98A5AB' }}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
