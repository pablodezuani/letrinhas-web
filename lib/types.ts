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
  data?: { role?: string } | null;
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
  ReadingGame: 'Leitura',
  VowelsGame: 'Vogais',
  WordFormationGame: 'Formação de Palavras',
  PhraseBuilder: 'Construção de Frases',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

// Categoria temática (campo `category` do Word) — como o conteúdo é organizado
// nas telas/filtros. Cobre as categorias de todos os jogos: Vogais/Formação de
// Palavras/Leitura usam uma categoria fixa cada, Formação de Frases usa a
// estrutura de comunicação (pessoas, sentimentos, necessidades, etc.).
export const CATEGORY_LABELS: Record<string, string> = {
  vowel: 'Vogal',
  word_formation: 'Formação de palavras',
  animal: 'Animal',
  pessoas_familia: 'Pessoas / Família',
  sentimentos: 'Sentimentos',
  comida_bebida: 'Comida e bebida',
  acoes: 'Ações',
  objetos: 'Objetos',
  lugares: 'Lugares',
  necessidades: 'Necessidades',
  comunicacao: 'Comunicação',
  brincadeiras: 'Brincadeiras',
  corpo_higiene: 'Corpo e higiene',
  palavras_ligacao: 'Palavras de ligação',
};

// Papel GRAMATICAL da palavra (campo `data.role`) — só existe pra palavras do
// jogo Formação de Frases, usado pelo motor de validação de frase (não é a
// mesma coisa que a categoria temática acima, que é o que a criança vê nas abas).
export const ROLE_LABELS: Record<string, string> = {
  pronome: 'Pronome',
  verbo: 'Verbo',
  acao: 'Ação',
  objeto: 'Objeto',
  alimento: 'Alimento',
  lugar: 'Lugar',
  sentimento: 'Sentimento',
  social: 'Social',
  preposicao: 'Preposição',
  artigo: 'Artigo',
  conectivo: 'Conectivo',
};
