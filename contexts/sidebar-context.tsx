'use client';

<<<<<<< HEAD
import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
=======
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
>>>>>>> 396d3c9f9fc91ab9b83cf012b25767f0aea0fd09

interface SidebarContextData {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextData>({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('letrinhas:sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('letrinhas:sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);
<<<<<<< HEAD

  const value = useMemo(
    () => ({ collapsed, toggle, mobileOpen, openMobile, closeMobile, toggleMobile }),
    [collapsed, toggle, mobileOpen, openMobile, closeMobile, toggleMobile],
  );

  return (
    <SidebarContext.Provider value={value}>
=======

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggle, mobileOpen, openMobile, closeMobile, toggleMobile }}
    >
>>>>>>> 396d3c9f9fc91ab9b83cf012b25767f0aea0fd09
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
