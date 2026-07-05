'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from '@/lib/nav-items';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const groups = NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => user && item.roles.includes(user.role)),
    }))
    .filter((group) => group.items.length > 0);

  const effectiveCollapsed = isMobile ? false : collapsed;
  const width = isMobile ? 240 : collapsed ? 72 : 240;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width,
          minHeight: isMobile ? undefined : '100vh',
          height: isMobile ? '100vh' : undefined,
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          zIndex: isMobile ? 50 : 'auto',
          transform: isMobile ? `translateX(${mobileOpen ? '0' : '-100%'})` : 'none',
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'linear-gradient(175deg, #0D2535 0%, #173345 40%, #1D4255 80%, #224E63 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Top ambient glow */}
        <div
          className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 60% -10%, rgba(245,169,124,0.14) 0%, rgba(203,170,203,0.06) 50%, transparent 70%)',
          }}
        />

        {/* Logo area */}
        <div className="relative px-4 pt-6 pb-4 flex-shrink-0">
          <div className={cn('flex items-center', effectiveCollapsed ? 'justify-center' : 'gap-3')}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(245,169,124,0.18)',
                border: '1px solid rgba(245,169,124,0.28)',
                boxShadow: '0 0 12px rgba(245,169,124,0.15)',
              }}
            >
              <Sparkles className="w-4 h-4 animate-sparkle" style={{ color: '#F5A97C' }} />
            </div>
            {!effectiveCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p
                  className="text-white font-bold text-sm leading-tight tracking-wide whitespace-nowrap"
                  style={{ letterSpacing: '0.02em' }}
                >
                  Letrinhas
                </p>
                <p className="text-xs leading-tight whitespace-nowrap" style={{ color: '#CBAACB' }}>
                  Encantadas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="mx-4 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* Nav groups */}
        <nav className="relative flex-1 px-2.5 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label}>
              {!effectiveCollapsed && (
                <p
                  className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                >
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={effectiveCollapsed ? item.label : undefined}
                      className={cn(
                        'relative flex items-center rounded-xl text-sm font-medium transition-all duration-150 group',
                        effectiveCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5',
                        !active && 'hover:bg-white/[0.05]',
                      )}
                      style={
                        active
                          ? {
                              background: 'rgba(245,169,124,0.14)',
                              color: '#F5A97C',
                              boxShadow: 'inset 0 0 0 1px rgba(245,169,124,0.18)',
                            }
                          : { color: 'rgba(255,255,255,0.42)' }
                      }
                    >
                      {/* Left accent pill on active */}
                      {active && !effectiveCollapsed && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{ background: '#F5A97C', boxShadow: '0 0 6px rgba(245,169,124,0.6)' }}
                        />
                      )}

                      <Icon className="h-4 w-4 flex-shrink-0" />

                      {!effectiveCollapsed && <span className="truncate">{item.label}</span>}

                      {/* Collapsed tooltip */}
                      {effectiveCollapsed && (
                        <span
                          className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 z-50"
                          style={{
                            background: 'rgba(12,28,40,0.96)',
                            color: 'rgba(255,255,255,0.88)',
                            transition: 'opacity 120ms',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: user profile + collapse toggle */}
        <div className="flex-shrink-0 px-2.5 pb-5 space-y-2">
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

          {/* User profile chip */}
          <div
            className={cn(
              'flex items-center rounded-xl py-2.5',
              effectiveCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
            )}
            style={{ background: 'rgba(255,255,255,0.04)' }}
            title={effectiveCollapsed ? (user?.name ?? '') : undefined}
          >
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback
                className="text-[11px] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #305F72 0%, #CBAACB 100%)',
                  color: 'white',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            {!effectiveCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {user?.name?.split(' ')[0]}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(203,170,203,0.65)' }}>
                  {user?.role === 'ADMIN' ? 'Administrador' : 'Educador'}
                </p>
              </div>
            )}
          </div>

          {/* Collapse toggle — desktop only, mobile uses drawer instead */}
          <button
            onClick={toggle}
            className={cn(
              'hidden lg:flex items-center w-full rounded-xl py-2 transition-colors hover:bg-white/[0.06]',
              collapsed ? 'justify-center px-2' : 'gap-2 px-3',
            )}
            style={{ color: 'rgba(255,255,255,0.28)' }}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="text-xs">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
