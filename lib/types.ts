export type UserRole = 'PARENT' | 'EDUCATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string | null;
  photo?: string | null;
  status?: UserStatus;
  created_at?: string;
}

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  BLOCKED: 'Bloqueado',
  INACTIVE: 'Inativo',
};

export interface Parent extends User {
  _count?: { children: number };
}

export interface ParentDetail {
  parent: Parent;
  children: Child[];
}

export interface Child {
  id: string;
  name: string;
  nickname?: string;
  age?: number;
  gender?: string;
  photo?: string;
  hasAutism?: string;
  autismLevel?: string;
  aboutMe?: string;
  specialInterests?: string[];
  routine?: string;
  communication?: string;
  likes?: string[];
  dislikes?: string[];
  skills?: string[];
  sensoryNeeds?: string;
  howToHelp?: string;
  whenFrustrated?: string;
  whenNeedsAttention?: string;
  difficulties?: string[];
  medicalInfo?: string;
  autismInfo?: string;
  medications?: string[];
  allergies?: string[];
  parentId: string;
  parent?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  _count?: { gameSessions: number };
}

export interface Word {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  imageUrl?: string;
  audioUrl?: string;
  gameTypes: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameSessionItem {
  id: string;
  content: string;
  correct: boolean;
  attempts: number;
  timeSpent: number;
}

export interface GameSession {
  id: string;
  childId: string;
  gameType: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  completed: boolean;
  playedAt: string;
  items: GameSessionItem[];
  child?: Pick<Child, 'id' | 'name'>;
}

export interface GameStat {
  gameType: string;
  sessions: number;
  avgScorePct: number;
}

export interface ChildDetail {
  child: Child;
  sessions: GameSession[];
  gameStats: GameStat[];
}

export interface DashboardMetrics {
  totalChildren: number;
  totalParents: number;
  totalSessions: number;
  sessionsLast30Days: number;
  sessionsByGame: Array<{
    gameType: string;
    _count: { id: number };
    _avg: { score: number; timeSpent: number };
  }>;
  recentSessions: GameSession[];
}

export const GAME_LABELS: Record<string, string> = {
  READING: 'Leitura',
  VOWELS: 'Vogais',
  WORD_FORMATION: 'Formação de Palavras',
  PHRASE_BUILDER: 'Construção de Frases',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Médio',
  HARD: 'Difícil',
};
