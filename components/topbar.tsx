'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { useCommandPalette } from '@/contexts/command-palette-context';
import { NAV_ITEMS } from '@/lib/nav-items';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronRight,
  LogOut,
  Bell,
  Users,
  Menu,
  Search,
} from 'lucide-react';

export function Topbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toggleMobile } = useSidebar();
  const { open: openCommandPalette } = useCommandPalette();

  const isChildDetail = /^\/children\/[^/]+/.test(pathname);
  const route = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const section = route?.label ?? '';
  const SectionIcon = route?.icon;

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 lg:px-7 border-b"
      style={{
        height: 60,
        background: 'rgba(255,248,244,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(48,95,114,0.07)',
      }}
    >
      {/* Left: mobile toggle + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-black/[0.05] lg:hidden"
          style={{ color: '#305F72' }}
          title="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-2 text-sm min-w-0">
          {isChildDetail ? (
            <>
              <div className="flex items-center gap-1.5" style={{ color: '#98A5AB' }}>
                <Users className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Crianças</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#C2C8CB' }} />
              <span className="font-semibold truncate" style={{ color: '#1F4352' }}>
                Perfil
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {SectionIcon && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(48,95,114,0.07)' }}
                >
                  <SectionIcon className="h-3.5 w-3.5" style={{ color: '#305F72' }} />
                </div>
              )}
              <span className="font-semibold" style={{ color: '#1F4352' }}>
                {section}
              </span>
            </div>
          )}
        </nav>
      </div>

      {/* Right: search + bell + user + logout */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Command palette trigger */}
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 h-8 pl-3 pr-2 rounded-lg text-xs font-medium transition-colors hover:bg-black/[0.04]"
          style={{ color: '#98A5AB', background: 'rgba(48,95,114,0.05)' }}
          title="Buscar e navegar"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd
            className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
            style={{ background: 'rgba(48,95,114,0.08)', color: '#567B8B' }}
          >
            ⌘K
          </kbd>
        </button>
        <button
          onClick={openCommandPalette}
          className="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-black/[0.05]"
          style={{ color: '#6B7F88' }}
          title="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(48,95,114,0.08)' }} />

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-black/[0.05]"
          style={{ color: '#6B7F88' }}
          title="Notificações"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(48,95,114,0.08)' }} />

        {/* User chip */}
        <div
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(48,95,114,0.05)' }}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback
              className="text-[11px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #305F72, #567B8B)',
                color: 'white',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="leading-none">
            <p className="text-xs font-semibold" style={{ color: '#1F4352' }}>
              {user?.name?.split(' ')[0]}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#98A5AB' }}>
              {user?.role === 'ADMIN' ? 'Admin' : 'Educador'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          title="Sair"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-red-50"
          style={{ color: '#98A5AB' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C05050')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#98A5AB')}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
