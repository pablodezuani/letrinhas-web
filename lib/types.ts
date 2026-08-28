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
  educatorSchools?: Array<{ school: { id: string; name: string; status: SchoolStatus } }>;
  _count?: { children?: number; assignedChildren?: number };
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

export type SchoolStatus = 'ACTIVE' | 'INACTIVE';

export const SCHOOL_STATUS_LABELS: Record<SchoolStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
};

export interface School {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  status: SchoolStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { children: number; educators: number };
}

export interface EducatorSchoolLink {
  school: Pick<School, 'id' | 'name' | 'status'>;
}

export interface SchoolDetail extends School {
  children: Array<Child & { educator?: ChildEducatorSummary | null }>;
  educators: Array<{ educator: User }>;
}

export interface ChildEducatorSummary {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
}

export interface ChildSchoolSummary {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  status: SchoolStatus;
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
  schoolId?: string | null;
  school?: ChildSchoolSummary | null;
  educatorId?: string | null;
  educator?: ChildEducatorSummary | null;
  createdAt: string;
  updatedAt: string;
  _count?: { gameSessions: number };
}

export interface AdminChildrenResult {
  total: number;
  page: number;
  limit: number;
  children: Child[];
}

export type AttachmentKind = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; role: UserRole; photo?: string | null };
  body?: string | null;
  attachment?: Attachment | null;
  readAt?: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  childId: string;
  updatedAt: string;
  child: {
    id: string;
    name: string;
    photo?: string | null;
    emoji?: string | null;
    color?: string | null;
    lightColor?: string | null;
    parent: { id: string; name: string };
    educator?: { id: string; name: string; photo?: string | null } | null;
    school?: { id: string; name: string } | null;
  };
  lastMessage: Message | null;
  unreadCount: number;
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
