import { api } from './api';
import type {
  Child, ChildDetail, DashboardMetrics, GameSession,
  Parent, ParentDetail, User, Word,
} from './types';

export const dashboardQuery = () => ({
  queryKey: ['dashboard-metrics'] as const,
  queryFn: (): Promise<DashboardMetrics> => api.get('/educator/dashboard').then((r) => r.data),
  retry: 1,
});

export const childrenQuery = (search = '') => ({
  queryKey: ['children', search] as const,
  queryFn: (): Promise<Child[]> =>
    api.get('/educator/children', { params: search ? { search } : undefined }).then((r) => r.data),
});

export const childDetailQuery = (id: string) => ({
  queryKey: ['child', id] as const,
  queryFn: (): Promise<ChildDetail> => api.get(`/children/${id}`).then((r) => r.data),
  enabled: !!id,
});

export const childSessionsQuery = (childId: string) => ({
  queryKey: ['child-sessions', childId] as const,
  queryFn: (): Promise<GameSession[]> =>
    api.get(`/children/${childId}/sessions`).then((r) => r.data),
  enabled: !!childId,
});

export const parentsQuery = (search = '') => ({
  queryKey: ['parents', search] as const,
  queryFn: (): Promise<Parent[]> =>
    api.get('/educator/parents', { params: search ? { search } : undefined }).then((r) => r.data),
});

export const parentDetailQuery = (id: string) => ({
  queryKey: ['parent', id] as const,
  queryFn: (): Promise<ParentDetail> =>
    api.get(`/educator/parents/${id}`).then((r) => r.data),
  enabled: !!id,
});

export const wordsQuery = (search = '', gameType = '') => ({
  queryKey: ['words', search, gameType] as const,
  queryFn: (): Promise<Word[]> =>
    api.get('/admin/words', {
      params: { ...(search && { search }), ...(gameType && { gameType }) },
    }).then((r) => r.data),
});

export const educatorsQuery = () => ({
  queryKey: ['educators'] as const,
  queryFn: (): Promise<User[]> => api.get('/admin/educators').then((r) => r.data),
});
