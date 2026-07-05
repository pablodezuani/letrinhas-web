interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: string | number;
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: '#1F4352' }}>{title}</h1>
          {badge !== undefined && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(48,95,114,0.08)', color: '#567B8B' }}
            >
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm mt-0.5" style={{ color: '#6B7F88' }}>{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
