import type { Note, Question, UserCard } from './types';
import { splitSentences, tokenize } from './text';

const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Text extraction (all local; PDFs are parsed in the browser) ---------- */
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist');
    const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = worker;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = Math.min(doc.numPages, 40); // cap for low-memory devices
    let text = '';
    for (let i = 1; i <= pages; i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      text += content.items.map((it) => ('str' in it ? it.str : '')).join(' ') + '\n';
    }
    return text;
  }
  return file.text();
}

/* ---------- Summarisation: frequency-scored extractive summary ---------- */
function termWeights(sentences: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  sentences.forEach((s) => tokenize(s).forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1)));
  return tf;
}

export function keyTerms(text: string, n = 8): string[] {
  const tf = termWeights(splitSentences(text));
  const display = new Map<string, string>();
  text.split(/\s+/).forEach((raw) => {
    const clean = raw.replace(/[^A-Za-z0-9+#-]/g, '');
    const t = tokenize(clean)[0];
    if (t && !display.has(t)) display.set(t, clean);
  });
  return [...tf.entries()].filter(([w]) => w.length > 3).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => display.get(w) ?? w);
}

export function summarize(text: string, count = 6): string[] {
  const sents = splitSentences(text);
  if (sents.length <= count) return sents;
  const tf = termWeights(sents);
  const scored = sents.map((s, i) => {
    const toks = tokenize(s);
    const score = toks.reduce((a, w) => a + (tf.get(w) ?? 0), 0) / Math.sqrt(toks.length + 1) + (i < 3 ? 1 : 0);
    return { s, i, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, count).sort((a, b) => a.i - b.i).map((x) => x.s);
}

/* ---------- Question + flashcard generation (cloze & definition patterns) ---------- */
const DEF = /^([A-Z][\w\s-]{2,40}?)\s+(?:is|are|refers to|means|is defined as|is called)\s+(.{20,})$/;

export function makeCards(text: string, subject: string, limit = 12): UserCard[] {
  const cards: UserCard[] = [];
  for (const s of splitSentences(text)) {
    const m = DEF.exec(s);
    if (m) cards.push({ id: `u-${uid()}`, subject, question: `What ${/\bare\b/.test(s.slice(m[1].length, m[1].length + 6)) ? 'are' : 'is'} ${m[1].trim()}?`, answer: s });
    if (cards.length >= limit) break;
  }
  return cards;
}

export function makeQuestions(text: string, title: string, limit = 8): Question[] {
  const sents = splitSentences(text);
  const tf = termWeights(sents);
  // One surface form per word stem, so distractors are never near-duplicates (e.g. "Plant"/"plants").
  const byStem = new Map<string, string>();
  text.split(/\s+/).map((w) => w.replace(/[^A-Za-z0-9-]/g, '')).filter((w) => w.length > 4 && !/^\d+$/.test(w)).forEach((w) => {
    const k = tokenize(w)[0] ?? w.toLowerCase();
    if (!byStem.has(k)) byStem.set(k, w);
  });
  const terms = [...byStem.values()];
  const weightOf = (w: string) => tf.get(tokenize(w)[0] ?? '') ?? 0;
  const qs: Question[] = [];
  const used = new Set<string>();
  const ranked = sents.map((s) => ({ s, w: tokenize(s).reduce((a, t) => a + (tf.get(t) ?? 0), 0) })).sort((a, b) => b.w - a.w);
  for (const { s } of ranked) {
    if (qs.length >= limit) break;
    const words = s.split(/\s+/).map((w) => w.replace(/[^A-Za-z0-9-]/g, ''));
    const cand = words.filter((w) => w.length > 4 && !used.has(w.toLowerCase()) && weightOf(w) >= 2).sort((a, b) => weightOf(b) - weightOf(a))[0];
    if (!cand) continue;
    const distractors = terms.filter((t) => (tokenize(t)[0] ?? t.toLowerCase()) !== (tokenize(cand)[0] ?? cand.toLowerCase()) && Math.abs(t.length - cand.length) <= 4 && !s.includes(t)).sort(() => Math.random() - 0.5).slice(0, 3);
    if (distractors.length < 3) continue;
    used.add(cand.toLowerCase());
    const answer = Math.floor(Math.random() * 4);
    const options = [...distractors];
    options.splice(answer, 0, cand);
    qs.push({
      id: `n-${uid()}`, topic: `My notes: ${title}`, subject: 'My Notes', text: `Fill in the blank: ${s.replace(new RegExp(`\\b${cand}\\b`), '_____')}`,
      options, answer, explanation: `From your notes: "${s}"`, difficulty: s.length > 200 ? 4 : 3, source: 'notes',
    });
  }
  return qs;
}

export function buildNote(title: string, text: string): Note {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 60_000);
  return {
    id: uid(), title: title || 'Untitled notes', createdAt: Date.now(), text: clean,
    summary: summarize(clean), keyTerms: keyTerms(clean), questions: makeQuestions(clean, title || 'Untitled notes'), cards: makeCards(clean, `Notes: ${title || 'Untitled'}`),
  };
}
