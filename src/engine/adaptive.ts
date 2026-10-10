import type { Attempt, CardState, Profile, Question, Recommendation, TopicState } from './types';

export const DAY = 86_400_000;
const todayStr = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/* ---------- Knowledge model: Bayesian Knowledge Tracing + Elo ability ---------- */
const BKT = { init: 0.25, learn: 0.14, slip: 0.1, guess: 0.25 };

export const newTopic = (): TopicState => ({
  mastery: BKT.init, ability: 1000, attempts: 0, correct: 0, avgTimeMs: 0, lastSeen: 0, streak: 0,
});

export const bktUpdate = (p: number, correct: boolean): number => {
  const posterior = correct
    ? (p * (1 - BKT.slip)) / (p * (1 - BKT.slip) + (1 - p) * BKT.guess)
    : (p * BKT.slip) / (p * BKT.slip + (1 - p) * (1 - BKT.guess));
  return Math.min(0.99, Math.max(0.01, posterior + (1 - posterior) * BKT.learn));
};

export const questionRating = (d: number) => 700 + d * 150; // d=1 -> 850 .. d=5 -> 1450
export const expectedCorrect = (ability: number, d: number) =>
  1 / (1 + Math.pow(10, (questionRating(d) - ability) / 400));

/** Mastery decays with time since last practice (forgetting curve), slower for well-practised topics. */
export const effectiveMastery = (t: TopicState | undefined, now = Date.now()): number => {
  if (!t || t.attempts === 0) return BKT.init;
  const days = Math.max(0, (now - t.lastSeen) / DAY);
  const stability = 6 + t.attempts * 1.5;
  const confidence = Math.min(1, t.attempts / 6); // a handful of answers is weak evidence, so shrink toward the prior
  return BKT.init + (t.mastery - BKT.init) * confidence * Math.exp(-days / stability);
};

/* ---------- Pace ---------- */
export const expectedTimeMs = (q: Question): number =>
  12_000 + q.difficulty * 6_000 + (q.text.length + q.options.join('').length) * 40;

export type PaceLabel = 'Deliberate' | 'Steady' | 'Quick';
export const paceLabel = (f: number): PaceLabel => (f > 1.35 ? 'Deliberate' : f < 0.7 ? 'Quick' : 'Steady');
export const sessionLength = (f: number) => (f > 1.35 ? 5 : f < 0.7 ? 12 : 8);

/* ---------- Recording an answer ---------- */
export interface AnswerResult { profile: Profile; xpGained: number; masteryBefore: number; masteryAfter: number }

export function recordAnswer(p: Profile, q: Question, chosen: number, timeMs: number, usedHint: boolean): AnswerResult {
  const now = Date.now();
  const correct = chosen === q.answer;
  const t0 = p.topics[q.topic] ?? newTopic();
  const exp = expectedCorrect(t0.ability, q.difficulty);
  // Fast & unaided correct answers count a bit more than slow or hinted ones.
  const fast = timeMs < expectedTimeMs(q) * 0.8;
  const score = correct ? (usedHint ? 0.6 : fast ? 1 : 0.88) : 0;
  const K = Math.max(16, 40 - t0.attempts * 2);
  const t: TopicState = {
    mastery: bktUpdate(t0.mastery, correct),
    ability: t0.ability + K * (score - exp),
    attempts: t0.attempts + 1,
    correct: t0.correct + (correct ? 1 : 0),
    avgTimeMs: t0.attempts === 0 ? timeMs : t0.avgTimeMs * 0.7 + timeMs * 0.3,
    lastSeen: now,
    streak: correct ? t0.streak + 1 : 0,
  };
  const ratio = Math.min(3, Math.max(0.2, timeMs / expectedTimeMs(q)));
  const attempt: Attempt = { qid: q.id, topic: q.topic, correct, chosen, timeMs, at: now, hint: usedHint };
  const day = todayStr();
  let streak = p.streak;
  if (p.lastActiveDay !== day) {
    streak = p.lastActiveDay === todayStr(new Date(now - DAY)) ? p.streak + 1 : 1;
  }
  const xpGained = correct ? Math.round((8 + q.difficulty * 4) * (usedHint ? 0.5 : 1)) : 2;
  const mis = { ...p.misconceptions };
  if (!correct) mis[q.id] = (mis[q.id] ?? 0) + 1;
  else if (mis[q.id]) mis[q.id] = Math.max(0, mis[q.id] - 1);
  const next: Profile = {
    ...p, xp: p.xp + xpGained, streak, bestStreak: Math.max(p.bestStreak, streak), lastActiveDay: day,
    studyMs: p.studyMs + Math.min(timeMs, 180_000), answered: p.answered + 1, correct: p.correct + (correct ? 1 : 0),
    paceFactor: p.paceFactor * 0.85 + ratio * 0.15,
    topics: { ...p.topics, [q.topic]: t }, seen: { ...p.seen, [q.id]: now }, misconceptions: mis,
    history: [...p.history, attempt].slice(-600),
  };
  return { profile: next, xpGained, masteryBefore: t0.mastery, masteryAfter: t.mastery };
}

/* ---------- Choosing the next question ---------- */
const TARGET_SUCCESS = 0.7; // zone of proximal development: challenging but achievable

export function pickNext(bank: Question[], p: Profile, opts: { topic?: string; exclude?: Set<string> } = {}): Question | null {
  const now = Date.now();
  let best: Question | null = null;
  let bestScore = -Infinity;
  for (const q of bank) {
    if (opts.topic && q.topic !== opts.topic) continue;
    if (opts.exclude?.has(q.id)) continue;
    const t = p.topics[q.topic];
    const ability = t?.ability ?? 1000;
    const fit = -Math.abs(expectedCorrect(ability, q.difficulty) - TARGET_SUCCESS) * 3;
    const weakness = (1 - effectiveMastery(t, now)) * 1.2;
    const last = p.seen[q.id];
    const novelty = last === undefined ? 0.6 : -Math.max(0, 1 - (now - last) / (30 * 60_000)) * 2; // avoid repeats within 30 min
    const retry = (p.misconceptions[q.id] ?? 0) > 0 && last !== undefined && now - last > 10 * 60_000 ? 0.5 : 0; // revisit past errors
    const score = fit + (opts.topic ? 0 : weakness) + novelty + retry + Math.random() * 0.2;
    if (score > bestScore) { bestScore = score; best = q; }
  }
  return best;
}

/** 50:50 hint: remove two wrong options, keeping original order. Returns indexes still visible. */
export function fiftyFifty(q: Question): number[] {
  const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
  const keepWrong = wrong[(q.text.length + q.answer) % wrong.length];
  return q.options.map((_, i) => i).filter((i) => i === q.answer || i === keepWrong);
}

/* ---------- Spaced repetition (SM-2) ---------- */
export const newCard = (): CardState => ({ ef: 2.5, interval: 0, reps: 0, due: 0, lapses: 0 });

/** grade: 1 = Again, 3 = Hard, 4 = Good, 5 = Easy */
export function sm2(c: CardState, grade: 1 | 3 | 4 | 5, now = Date.now()): CardState {
  let { ef, interval, reps, lapses } = c;
  if (grade < 3) { reps = 0; interval = 0; lapses += 1; }
  else {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ef * (grade === 3 ? 0.8 : grade === 5 ? 1.3 : 1));
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  const due = grade < 3 ? now + 10 * 60_000 : now + interval * DAY;
  return { ef, interval, reps, due, lapses };
}

export const dueCount = (p: Profile, ids: string[], now = Date.now()) =>
  ids.filter((id) => p.cards[id] !== undefined && p.cards[id].due <= now).length; // only cards already started

/* ---------- Analytics ---------- */
export interface TopicSummary { topic: string; subject: string; mastery: number; attempts: number; accuracy: number; ability: number; avgSec: number }

export function summarize(p: Profile, bank: Question[]): TopicSummary[] {
  const subj = new Map<string, string>();
  bank.forEach((q) => subj.set(q.topic, q.subject));
  const topics = new Set<string>([...subj.keys(), ...Object.keys(p.topics)]);
  return [...topics].map((topic) => {
    const t = p.topics[topic];
    return {
      topic, subject: subj.get(topic) ?? 'Other', mastery: effectiveMastery(t), attempts: t?.attempts ?? 0,
      accuracy: t && t.attempts ? t.correct / t.attempts : 0, ability: Math.round(t?.ability ?? 1000), avgSec: Math.round((t?.avgTimeMs ?? 0) / 1000),
    };
  });
}

export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 60)) + 1;
export const xpForLevel = (lvl: number) => Math.round(60 * (lvl - 1) ** 2);

export function recommend(p: Profile, bank: Question[], dueCards: number): Recommendation[] {
  const out: Recommendation[] = [];
  const sum = summarize(p, bank);
  const tried = sum.filter((s) => s.attempts >= 3).sort((a, b) => a.mastery - b.mastery);
  const untouched = sum.filter((s) => s.attempts === 0);
  const weak = tried.find((s) => s.mastery < 0.6);

  if (dueCards === 0 && p.cardsReviewed === 0) out.push({ kind: 'flashcards', title: 'Learn your first 10 flashcards', reason: 'Short, spaced-repetition sessions build lasting memory.', path: '/flashcards' });
  if (dueCards > 0) out.push({ kind: 'flashcards', title: `Review ${dueCards} due card${dueCards > 1 ? 's' : ''}`, reason: 'Spaced repetition: reviewing now locks in memory with the least effort.', path: '/flashcards' });
  if (weak) out.push({ kind: 'practice', title: `Strengthen ${weak.topic}`, topic: weak.topic, reason: `Mastery ~${Math.round(weak.mastery * 100)}% (${Math.round(weak.accuracy * 100)}% correct). Questions will start at a comfortable level.`, path: `/quests?topic=${encodeURIComponent(weak.topic)}` });
  const repeated = Object.entries(p.misconceptions).filter(([, n]) => n >= 2).length;
  if (repeated > 0) out.push({ kind: 'review', title: `Revisit ${repeated} question${repeated > 1 ? 's' : ''} you keep missing`, reason: 'Mixed practice re-serves your repeat mistakes with explanations.', path: '/quests' });
  const strong = [...tried].reverse().find((s) => s.mastery >= 0.8 && s.accuracy >= 0.8);
  if (strong) out.push({ kind: 'challenge', title: `Level up in ${strong.topic}`, topic: strong.topic, reason: 'You are doing well here, so harder questions will be served.', path: `/quests?topic=${encodeURIComponent(strong.topic)}` });
  if (untouched.length && out.length < 3) { const u = untouched[0]; out.push({ kind: 'start', title: `Try ${u.topic}`, topic: u.topic, reason: 'A new topic: a short diagnostic session will find your level.', path: `/quests?topic=${encodeURIComponent(u.topic)}` }); }
  if (p.notes.length === 0 && out.length < 3) out.push({ kind: 'notes', title: 'Add your own study notes', reason: 'Turn a PDF or text into summaries, flashcards and questions — fully offline.', path: '/learnhub' });
  if (out.length === 0) out.push({ kind: 'practice', title: 'Start a smart practice session', reason: 'Mixed questions adapt to your level as you answer.', path: '/quests' });
  return out.slice(0, 4);
}
