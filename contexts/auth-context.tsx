'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('letrinhas:user');
    const token = localStorage.getItem('letrinhas:token');

    if (stored && token) {
      setUser(JSON.parse(stored));
    }

    setIsLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/session', { email, password });

    if (data.role === 'PARENT') {
      throw new Error('Acesso restrito a educadores e administradores.');
    }

    localStorage.setItem('letrinhas:token', data.token);
    localStorage.setItem('letrinhas:user', JSON.stringify({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    }));


    document.cookie = `letrinhas:token=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}`;

    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
  }

  function signOut() {
    localStorage.removeItem('letrinhas:token');
    localStorage.removeItem('letrinhas:user');
    document.cookie = 'letrinhas:token=; path=/; max-age=0';
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
