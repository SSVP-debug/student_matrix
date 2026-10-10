import { useEffect, useState } from 'react';
import type { Question, Profile } from './types';

interface RawQ { id: number; question: string; options: string[]; correctAnswer: number; explanation: string }
interface RawMission { id: number; title: string; subject: string; difficulty: string; questions: RawQ[] }
export interface RawCard { id: number; question: string; answer: string }
export interface RawSubject { id: number; name: string; icon: string; cards: RawCard[] }

export interface StaticData {
  questions: Question[];
  subjects: RawSubject[];
}

const BASE: Record<string, number> = { Easy: 2, Medium: 3, Hard: 4 };
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

let cache: Promise<StaticData> | null = null;

export const loadStatic = (): Promise<StaticData> => {
  if (!cache) {
    cache = (async () => {
      const [qr, fr] = await Promise.all([fetch('/data/quests.json'), fetch('/data/flashcards.json')]);
      if (!qr.ok || !fr.ok) throw new Error('Learning data unavailable');
      const missions = ((await qr.json()) as { missions: RawMission[] }).missions;
      const subjects = ((await fr.json()) as { subjects: RawSubject[] }).subjects;
      const questions: Question[] = [];
      for (const m of missions) {
        const n = m.questions.length;
        m.questions.forEach((q, i) => {
          // Difficulty: mission level, shifted by position (mission questions ramp up).
          const shift = i < n * 0.3 ? -1 : i >= n * 0.7 ? 1 : 0;
          questions.push({
            id: `m${m.id}-q${q.id}`, topic: m.title, subject: m.subject, text: q.question,
            options: q.options, answer: q.correctAnswer, explanation: q.explanation,
            difficulty: clamp((BASE[m.difficulty] ?? 3) + shift, 1, 5), source: 'builtin',
          });
        });
      }
      return { questions, subjects };
    })().catch((e) => { cache = null; throw e; });
  }
  return cache;
};

export const allQuestions = (data: StaticData, profile: Profile): Question[] =>
  [...data.questions, ...profile.notes.flatMap((n) => n.questions)];

export const useStaticData = () => {
  const [data, setData] = useState<StaticData | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    loadStatic().then((d) => live && setData(d)).catch((e: Error) => live && setError(e.message));
    return () => { live = false; };
  }, []);
  return { data, error };
};
