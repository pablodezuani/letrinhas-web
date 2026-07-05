import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Contact,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['EDUCATOR', 'ADMIN'] },
      { href: '/reports', label: 'Relatórios', icon: BarChart3, roles: ['EDUCATOR', 'ADMIN'] },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/children', label: 'Crianças', icon: Users, roles: ['EDUCATOR', 'ADMIN'] },
      { href: '/responsaveis', label: 'Responsáveis', icon: Contact, roles: ['EDUCATOR', 'ADMIN'] },
      { href: '/words', label: 'Palavras', icon: BookOpen, roles: ['ADMIN'] },
      { href: '/educators', label: 'Educadores', icon: GraduationCap, roles: ['ADMIN'] },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
