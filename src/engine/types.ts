export interface Question {
  id: string;
  topic: string;
  subject: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: number; // 1 (easy) .. 5 (hard)
  source: 'builtin' | 'notes';
}

export interface TopicState {
  mastery: number; // BKT P(known) 0..1
  ability: number; // Elo-style rating, 1000 = average
  attempts: number;
  correct: number;
  avgTimeMs: number;
  lastSeen: number;
  streak: number;
}

export interface CardState {
  ef: number;
  interval: number; // days
  reps: number;
  due: number; // epoch ms
  lapses: number;
}

export interface Attempt {
  qid: string;
  topic: string;
  correct: boolean;
  chosen: number;
  timeMs: number;
  at: number;
  hint: boolean;
}

export interface UserCard {
  id: string;
  subject: string;
  question: string;
  answer: string;
}

export interface Note {
  id: string;
  title: string;
  createdAt: number;
  text: string;
  summary: string[];
  keyTerms: string[];
  questions: Question[];
  cards: UserCard[];
}

export interface Profile {
  version: 2;
  xp: number;
  streak: number;
  bestStreak: number;
  lastActiveDay: string;
  studyMs: number;
  answered: number;
  correct: number;
  paceFactor: number; // EMA of actualTime / expectedTime (1 = on pace)
  topics: Record<string, TopicState>;
  cards: Record<string, CardState>;
  seen: Record<string, number>;
  misconceptions: Record<string, number>; // qid -> times wrong
  history: Attempt[];
  notes: Note[];
  cardsReviewed: number;
  sessions: number;
  perfectSessions: number;
}

export interface Settings {
  name: string;
  email?: string;
  avatarUrl?: string;
  dailyReminders?: boolean;
  achievementAlerts?: boolean;
  streakAlerts?: boolean;
  missionAlerts?: boolean;
  dailyGoal: number;
  textScale: number; // 0.9 .. 1.5
  dyslexiaFont: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  liteMode: boolean;
  speak: boolean;
  speechRate: number;
  tutorLevel: 'auto' | 'simple' | 'standard' | 'deep';
  localLlmUrl: string;
  localLlmModel: string;
  aiProvider?: 'auto' | 'gemini' | 'groq' | 'local';
  geminiApiKey?: string;
  geminiModel?: string;
  groqApiKey?: string;
  groqModel?: string;
}

export interface Recommendation {
  kind: 'practice' | 'review' | 'flashcards' | 'notes' | 'challenge' | 'start';
  title: string;
  reason: string;
  topic?: string;
  path: string;
}
