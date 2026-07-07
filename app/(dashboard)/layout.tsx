'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { CommandPaletteProvider } from '@/contexts/command-palette-context';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { CommandPalette } from '@/components/command-palette';
import { Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8F4' }}>
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1F4352, #305F72, #CBAACB)',
              boxShadow: '0 8px 24px rgba(48,95,114,0.3)',
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-medium" style={{ color: '#6B7F88' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <CommandPaletteProvider>
        <div className="flex min-h-screen" style={{ background: '#FFF8F4' }}>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Topbar />
            <main className="flex-1 p-6 lg:p-8 overflow-auto">
              <div key={pathname} className="animate-fade-in">
                {children}
              </div>
            </main>
          </div>
        </div>
        <CommandPalette />
      </CommandPaletteProvider>
    </SidebarProvider>
  );
}
