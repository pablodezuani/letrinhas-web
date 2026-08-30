import { api } from './api';
import type {
  AdminChildrenResult, Child, ChildDetail, Conversation, DashboardMetrics, GameSession,
  Message, Parent, ParentDetail, School, SchoolDetail, User, Word,
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

export const wordsQuery = (search = '', gameType = '', difficulty = '', category = '') => ({
  queryKey: ['words', search, gameType, difficulty, category] as const,
  queryFn: (): Promise<Word[]> =>
    api.get('/admin/words', {
      params: {
        ...(search && { search }),
        ...(gameType && { gameType }),
        ...(difficulty && { difficulty }),
        ...(category && { category }),
      },
    }).then((r) => r.data),
});

export const educatorsQuery = () => ({
  queryKey: ['educators'] as const,
  queryFn: (): Promise<User[]> => api.get('/admin/educators').then((r) => r.data),
});

export const educatorDetailQuery = (id: string) => ({
  queryKey: ['educator', id] as const,
  queryFn: (): Promise<User> => api.get(`/admin/educators/${id}`).then((r) => r.data),
  enabled: !!id,
});

export const schoolsQuery = (search = '', status = '') => ({
  queryKey: ['schools', search, status] as const,
  queryFn: (): Promise<School[]> =>
    api.get('/admin/schools', { params: { ...(search && { search }), ...(status && { status }) } }).then((r) => r.data),
});

export const schoolDetailQuery = (id: string) => ({
  queryKey: ['school', id] as const,
  queryFn: (): Promise<SchoolDetail> => api.get(`/admin/schools/${id}`).then((r) => r.data),
  enabled: !!id,
});

export const activeSchoolsQuery = (search = '') => ({
  queryKey: ['schools-active', search] as const,
  queryFn: (): Promise<School[]> => api.get('/schools', { params: search ? { search } : undefined }).then((r) => r.data),
});

export const adminChildrenQuery = (params: { search?: string; unlinked?: boolean; schoolId?: string }) => ({
  queryKey: ['admin-children', params] as const,
  queryFn: (): Promise<AdminChildrenResult> =>
    api.get('/admin/children', { params: { ...params, limit: 100 } }).then((r) => r.data),
});

export const conversationsQuery = () => ({
  queryKey: ['conversations'] as const,
  queryFn: (): Promise<Conversation[]> => api.get('/conversations').then((r) => r.data),
  refetchInterval: 15000,
});

export const conversationMessagesQuery = (childId: string) => ({
  queryKey: ['conversation-messages', childId] as const,
  queryFn: (): Promise<Message[]> => api.get(`/conversations/${childId}/messages`).then((r) => r.data),
  enabled: !!childId,
  refetchInterval: 8000,
});

export const unreadCountQuery = () => ({
  queryKey: ['unread-count'] as const,
  queryFn: (): Promise<{ count: number }> => api.get('/notifications/unread-count').then((r) => r.data),
  refetchInterval: 20000,
});
