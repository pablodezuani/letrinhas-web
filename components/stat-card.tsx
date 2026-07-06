'use client';

import { useEffect, useRef, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  accentColor?: string;
  trend?: { value: number; label: string };
  loading?: boolean;
  size?: 'default' | 'hero';
  extra?: React.ReactNode;
  className?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 700;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    }

    requestAnimationFrame(tick);
  }, [value]);

  return <>{displayed.toLocaleString('pt-BR')}</>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  loading,
  accentColor,
  size = 'default',
  extra,
  className,
}: StatCardProps) {
  const accent = accentColor ?? color;
  const hero = size === 'hero';

  if (loading) {
    return (
      <div
        className={`relative bg-white rounded-2xl overflow-hidden animate-pulse ${hero ? 'p-6 h-full' : 'p-5'} ${className ?? ''}`}
        style={{ boxShadow: '0 1px 4px rgba(48,95,114,0.07), 0 1px 2px rgba(48,95,114,0.04)' }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{ background: '#F0E8E0' }}
        />
        <div className="h-9 w-9 rounded-xl mb-4" style={{ background: '#F6EEE6' }} />
        <div className="h-7 w-14 rounded-lg mb-2" style={{ background: '#F6EEE6' }} />
        <div className="h-3 w-24 rounded" style={{ background: '#F6EEE6' }} />
      </div>
    );
  }

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden group flex flex-col ${hero ? 'p-6 h-full' : 'p-5'} ${className ?? ''}`}
      style={{
        boxShadow: '0 1px 4px rgba(48,95,114,0.07), 0 1px 2px rgba(48,95,114,0.04)',
        transition: 'box-shadow 200ms, transform 200ms',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 24px rgba(48,95,114,0.12), 0 2px 6px rgba(48,95,114,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 1px 4px rgba(48,95,114,0.07), 0 1px 2px rgba(48,95,114,0.04)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }}
      />

      {/* Subtle background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 15% 15%, ${bg} 0%, transparent 65%)`,
          transition: 'opacity 300ms',
        }}
      />

      <div className="relative flex-1 flex flex-col">
        <div
          className={`rounded-xl flex items-center justify-center mb-4 ${hero ? 'w-11 h-11' : 'w-9 h-9'}`}
          style={{ background: bg }}
        >
          <Icon className={hero ? 'h-5 w-5' : 'h-4 w-4'} style={{ color }} />
        </div>

        <p
          className={`font-bold leading-none mb-1 animate-count-up ${hero ? 'text-[2rem] sm:text-[2.5rem]' : 'text-[1.75rem] sm:text-[2rem]'}`}
          style={{ color: '#1F4352' }}
        >
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        </p>

        <p className="text-xs leading-relaxed" style={{ color: '#6B7F88' }}>
          {label}
        </p>

        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                color: trend.value >= 0 ? '#4A8B49' : '#A84040',
                background:
                  trend.value >= 0 ? 'rgba(127,183,126,0.12)' : 'rgba(217,117,107,0.12)',
              }}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs" style={{ color: '#98A5AB' }}>
              {trend.label}
            </span>
          </div>
        )}

        {extra && <div className="flex-1 flex items-end mt-3">{extra}</div>}
      </div>
    </div>
  );
}
