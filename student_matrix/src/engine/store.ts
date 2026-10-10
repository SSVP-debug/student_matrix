import { useSyncExternalStore } from 'react';
import type { Profile, Settings } from './types';

const PROFILE_KEY = 'student_matrix.profile.v2';
const LEGACY_PROFILE_KEY = 'stellarlearn.profile.v2';
const SETTINGS_KEY = 'student_matrix.settings.v2';
const LEGACY_SETTINGS_KEY = 'stellarlearn.settings.v2';

const lowEnd = (): boolean => {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    return (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
      (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) ||
      nav.connection?.saveData === true;
  } catch {
    return false;
  }
};

export const defaultProfile = (): Profile => ({
  version: 2, xp: 0, streak: 0, bestStreak: 0, lastActiveDay: '', studyMs: 0,
  answered: 0, correct: 0, paceFactor: 1, topics: {}, cards: {}, seen: {},
  misconceptions: {}, history: [], notes: [], cardsReviewed: 0, sessions: 0, perfectSessions: 0,
});

export const defaultSettings = (): Settings => ({
  name: 'Learner', dailyGoal: 10, textScale: 1, dyslexiaFont: false, highContrast: false,
  reduceMotion: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  liteMode: lowEnd(), speak: false, speechRate: 1, tutorLevel: 'auto', localLlmUrl: '', localLlmModel: 'llama3.2:1b',
});

function read<T>(key: string, fallback: () => T): T {
  try {
    const legacyKey = key === PROFILE_KEY ? LEGACY_PROFILE_KEY : key === SETTINGS_KEY ? LEGACY_SETTINGS_KEY : null;
    const raw = localStorage.getItem(key) ?? (legacyKey ? localStorage.getItem(legacyKey) : null);
    if (!raw) return fallback();
    return { ...fallback(), ...JSON.parse(raw) } as T;
  } catch {
    return fallback();
  }
}

function makeStore<T>(key: string, fallback: () => T) {
  let state = read<T>(key, fallback);
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next: T) {
      state = next;
      try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* quota: keep in memory */ }
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
    reload() { state = read<T>(key, fallback); listeners.forEach((l) => l()); },
  };
}

export const profileStore = makeStore<Profile>(PROFILE_KEY, defaultProfile);
export const settingsStore = makeStore<Settings>(SETTINGS_KEY, defaultSettings);

export const useProfile = () => useSyncExternalStore(profileStore.subscribe, profileStore.get);
export const useSettings = () => useSyncExternalStore(settingsStore.subscribe, settingsStore.get);

export const updateProfile = (fn: (p: Profile) => Profile) => profileStore.set(fn(profileStore.get()));
export const updateSettings = (patch: Partial<Settings>) => settingsStore.set({ ...settingsStore.get(), ...patch });

export const exportAll = (): string =>
  JSON.stringify({ app: 'student_matrix', version: 2, exportedAt: new Date().toISOString(), profile: profileStore.get(), settings: settingsStore.get() }, null, 2);

export const importAll = (json: string): void => {
  const data = JSON.parse(json);
  if (!['student_matrix', 'stellarlearn'].includes(data?.app) || !data.profile) throw new Error('Not a student_matrix backup file');
  profileStore.set({ ...defaultProfile(), ...data.profile });
  if (data.settings) settingsStore.set({ ...defaultSettings(), ...data.settings });
};

export const resetAll = (): void => {
  profileStore.set(defaultProfile());
  settingsStore.set(defaultSettings());
};

export const storageBytes = (): number => {
  try {
    return (localStorage.getItem(PROFILE_KEY)?.length ?? 0) * 2 + (localStorage.getItem(SETTINGS_KEY)?.length ?? 0) * 2;
  } catch { return 0; }
};
