import type { Profile, Question, Settings } from './types';
import type { StaticData } from './bank';
import { Index, splitSentences, type Doc } from './text';
import { effectiveMastery } from './adaptive';

export type Level = 'simple' | 'standard' | 'deep';

export function buildIndex(data: StaticData, p: Profile): Index {
  const docs: Doc[] = [];
  data.subjects.forEach((s) => s.cards.forEach((c) => docs.push({ id: `card-${s.id}-${c.id}`, title: c.question, text: c.answer, subject: s.name, kind: 'card' })));
  data.questions.forEach((q) => docs.push({ id: q.id, title: q.text, text: `${q.options[q.answer]}. ${q.explanation}`, subject: q.subject, kind: 'question', ref: q.topic }));
  p.notes.forEach((n) => {
    splitSentences(n.text).forEach((s, i) => docs.push({ id: `${n.id}-${i}`, title: n.title, text: s, subject: 'My Notes', kind: 'note', ref: n.title }));
    n.cards.forEach((c) => docs.push({ id: c.id, title: c.question, text: c.answer, subject: 'My Notes', kind: 'card' }));
  });
  return new Index(docs);
}

export interface TutorReply { markdown: string; usedLlm: boolean; subject?: string; topic?: string; practice?: Question }

export function chooseLevel(settings: Settings, p: Profile, topic?: string): Level {
  if (settings.tutorLevel !== 'auto') return settings.tutorLevel;
  const m = topic ? effectiveMastery(p.topics[topic]) : 0.3;
  return m < 0.4 ? 'simple' : m < 0.75 ? 'standard' : 'deep';
}

const firstSentence = (t: string) => splitSentences(t)[0] ?? t;

/** Retrieval-grounded answer: everything comes from the local content (cards, explanations, your notes). */
export function localAnswer(query: string, index: Index, data: StaticData, p: Profile, settings: Settings): TutorReply {
  const hits = index.search(query, 6);
  if (hits.length === 0 || hits[0].score < 1.2) {
    return { usedLlm: false, markdown: `I could not find this in the material stored on your device.\n\n- Add your own notes or a PDF in **LearnHub** and ask again.\n- Try different keywords (for example a term from your textbook).\n- Optional: connect a local model in **Settings** for open-ended answers.` };
  }
  const top = hits[0].doc;
  const level = chooseLevel(settings, p, top.kind === 'question' ? top.ref : undefined);
  const facts = hits.filter((h) => h.score > hits[0].score * 0.45);
  const core = top.kind === 'question' ? top.text : top.text;
  const lines: string[] = [];
  if (level === 'simple') {
    lines.push(`## In simple words`, `**${firstSentence(core)}**`);
    const q = hits.find((h) => h.doc.kind === 'card');
    if (q && q.doc.id !== top.id) lines.push(`\nThink of it like this: ${firstSentence(q.doc.text)}`);
  } else {
    lines.push(`## Explanation`, core);
    if (level === 'deep') {
      const extra = facts.slice(1, 4).map((h) => `- **${h.doc.title}** — ${h.doc.text}`);
      if (extra.length) lines.push(`\n## Going deeper`, ...extra);
    }
  }
  const related = facts.slice(1, 4).filter((h) => h.doc.kind === 'card' && h.doc.title !== top.title);
  if (level !== 'deep' && related.length) lines.push(`\n## Related`, ...related.map((h) => `- ${h.doc.title}`));
  const practice = data.questions.filter((q) => (top.ref ? q.topic === top.ref : q.subject === top.subject)).sort(() => Math.random() - 0.5)[0];
  lines.push(`\n_Level: ${level}. Answer built from ${top.kind === 'note' ? 'your notes' : 'the built-in course material'} stored on this device._`);
  return { markdown: lines.join('\n'), usedLlm: false, subject: top.subject, topic: top.ref, practice };
}

/* ---------- Optional: a model running on the same machine (e.g. Ollama) ---------- */
export const isLocalUrl = (u: string): boolean => {
  try {
    const h = new URL(u).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h);
  } catch { return false; }
};

export async function llmAnswer(query: string, grounding: string, level: Level, s: Settings): Promise<string> {
  if (!isLocalUrl(s.localLlmUrl)) throw new Error('Local model URL must be localhost or a private network address.');
  const sys = `You are a patient tutor. Explain at a ${level} level for the student. Use only the context when it is relevant, and say so if unsure. Be concise.`;
  const res = await fetch(`${s.localLlmUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({ model: s.localLlmModel, stream: false, messages: [{ role: 'system', content: sys }, { role: 'user', content: `Context:\n${grounding}\n\nQuestion: ${query}` }] }),
  });
  if (!res.ok) throw new Error(`Local model responded ${res.status}`);
  const j = (await res.json()) as { message?: { content?: string } };
  if (!j.message?.content) throw new Error('Empty reply from local model');
  return j.message.content;
}

async function onlineAnswer(query: string, index: Index, p: Profile, s: Settings, base: TutorReply): Promise<TutorReply> {
  const hits = index.search(query, 4);
  const context = hits.map((h) => h.doc.title + ': ' + h.doc.text).join('\n').slice(0, 8000);
  const level = chooseLevel(s, p, base.topic);
  const weakTopics = Object.entries(p.topics)
    .filter(([, state]) => state.mastery < 0.55)
    .sort((a, b) => a[1].mastery - b[1].mastery)
    .slice(0, 5)
    .map(([topic]) => topic);
  const response = await fetch('/api/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(50_000),
    body: JSON.stringify({ provider: s.onlineProvider, question: query, context, level, learner: { weakTopics } }),
  });
  const payload = await response.json().catch(() => ({})) as { text?: string; model?: string; provider?: string; error?: string };
  if (!response.ok) throw new Error(payload.error || ('Online AI request failed (' + response.status + ').'));
  if (!payload.text) throw new Error('The online AI returned an empty response.');
  const providerName = payload.provider === 'openai' ? 'OpenAI' : 'Gemini';
  return {
    ...base,
    markdown: payload.text + '\n\n_Generated by ' + providerName + ' (' + (payload.model || 'cloud model') + '). Your question and relevant course excerpts were sent to the selected provider; your progress remains on this device._',
    usedLlm: true,
  };
}

export async function answer(query: string, index: Index, data: StaticData, p: Profile, s: Settings): Promise<TutorReply> {
  const base = localAnswer(query, index, data, p, s);
  if (s.aiMode === 'online') {
    try {
      return await onlineAnswer(query, index, p, s, base);
    } catch (e) {
      return { ...base, markdown: base.markdown + '\n\n_Online AI unavailable: ' + (e as Error).message + ' Showing the offline answer instead._' };
    }
  }
  if (!s.localLlmUrl) return base;
  try {
    const hits = index.search(query, 4);
    const ctx = hits.map((h) => h.doc.title + ': ' + h.doc.text).join('\n');
    const level = chooseLevel(s, p, base.topic);
    const text = await llmAnswer(query, ctx, level, s);
    return { ...base, markdown: text + '\n\n_Generated by your local model (' + s.localLlmModel + '); nothing left this device._', usedLlm: true };
  } catch (e) {
    return { ...base, markdown: base.markdown + '\n\n_Local model unavailable (' + (e as Error).message + '); showing built-in answer._' };
  }
}
