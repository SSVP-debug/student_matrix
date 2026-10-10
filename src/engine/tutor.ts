import type { Profile, Question, Settings } from './types';
import type { StaticData } from './bank';
import { Index, splitSentences, type Doc } from './text';
import { effectiveMastery } from './adaptive';

export type Level = 'simple' | 'standard' | 'deep';

export function buildIndex(data: StaticData, p: Profile): Index {
  const docs: Doc[] = [];
  data.subjects.forEach((s) =>
    s.cards.forEach((c) =>
      docs.push({ id: `card-${s.id}-${c.id}`, title: c.question, text: c.answer, subject: s.name, kind: 'card' })
    )
  );
  data.questions.forEach((q) =>
    docs.push({
      id: q.id,
      title: q.text,
      text: `${q.options[q.answer]}. ${q.explanation}`,
      subject: q.subject,
      kind: 'question',
      ref: q.topic,
    })
  );
  p.notes.forEach((n) => {
    splitSentences(n.text).forEach((s, i) =>
      docs.push({ id: `${n.id}-${i}`, title: n.title, text: s, subject: 'My Notes', kind: 'note', ref: n.title })
    );
    n.cards.forEach((c) =>
      docs.push({ id: c.id, title: c.question, text: c.answer, subject: 'My Notes', kind: 'card' })
    );
  });
  return new Index(docs);
}

export interface TutorReply {
  markdown: string;
  usedLlm: boolean;
  provider?: 'local' | 'gemini' | 'groq' | 'ollama';
  subject?: string;
  topic?: string;
  practice?: Question;
  needsApiKey?: boolean;
}

export function chooseLevel(settings: Settings, p: Profile, topic?: string): Level {
  if (settings.tutorLevel !== 'auto') return settings.tutorLevel;
  const m = topic ? effectiveMastery(p.topics[topic]) : 0.3;
  return m < 0.4 ? 'simple' : m < 0.75 ? 'standard' : 'deep';
}

const firstSentence = (t: string) => splitSentences(t)[0] ?? t;

/** Retrieval-grounded answer: everything comes from local content (cards, explanations, notes). */
export function localAnswer(
  query: string,
  index: Index,
  data: StaticData,
  p: Profile,
  settings: Settings
): TutorReply {
  const hits = index.search(query, 6);
  if (hits.length === 0 || hits[0].score < 1.2) {
    return {
      usedLlm: false,
      needsApiKey: true,
      markdown: `### Topic Not in Local Course Material\n\nI could not find "${query}" in the built-in course materials or uploaded notes on this device.\n\n- **Connect an AI Key**: Add a free **Google Gemini** or **Groq** API key in **Settings** or click the key icon above to get answers to any question.\n- **LearnHub**: Upload a PDF or paste notes about this in **LearnHub** to generate on-device questions and summaries.\n- **Try course keywords**: e.g. "Newton's first law", "kinetic energy", "quadratic equation", "polymorphism".`,
    };
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

  const practice = data.questions
    .filter((q) => (top.ref ? q.topic === top.ref : q.subject === top.subject))
    .sort(() => Math.random() - 0.5)[0];

  lines.push(
    `\n_Explanation level: ${level}. Grounded in ${
      top.kind === 'note' ? 'your uploaded notes' : 'built-in course materials'
    } on this device._`
  );

  return { markdown: lines.join('\n'), usedLlm: false, provider: 'local', subject: top.subject, topic: top.ref, practice };
}

/* ---------- Local Ollama Integration ---------- */
export const isLocalUrl = (u: string): boolean => {
  try {
    const h = new URL(u).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h);
  } catch {
    return false;
  }
};

export async function llmAnswer(query: string, grounding: string, level: Level, s: Settings): Promise<string> {
  if (!isLocalUrl(s.localLlmUrl)) throw new Error('Local model URL must be localhost or a private network address.');
  const sys = `You are LearnAI, an inspiring, patient cosmic learning tutor. Explain at a ${level} level. Use concise markdown with bullet points and bolding. Prioritize the student's context when relevant.`;
  const res = await fetch(`${s.localLlmUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      model: s.localLlmModel || 'llama3.2:1b',
      stream: false,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `${grounding ? `Context:\n${grounding}\n\n` : ''}Question: ${query}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Local model responded ${res.status}`);
  const j = (await res.json()) as { message?: { content?: string } };
  if (!j.message?.content) throw new Error('Empty reply from local model');
  return j.message.content;
}

/* ---------- Google Gemini API Integration ---------- */
export async function geminiAnswer(
  query: string,
  grounding: string,
  level: Level,
  apiKey: string,
  model = 'gemini-2.5-flash'
): Promise<string> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error('Missing Gemini API key');

  const sysInstruction = `You are LearnAI, an inspiring, cosmic-themed, pedagogical AI learning assistant.
Explain clearly at a ${level} level:
- If 'simple': use everyday analogies, short sentences, and intuitive examples.
- If 'standard': clear conceptual breakdown with bullet points and key takeaways.
- If 'deep': include rigorous definitions, practical applications, and edge cases.
Always format with clean Markdown (headings, bold, bullet points, and code blocks where relevant).`;

  const promptText = grounding
    ? `Student Question: ${query}\n\nRelevant Course / Notes Context (use if helpful):\n${grounding}`
    : `Student Question: ${query}`;

  const callModel = async (targetModel: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(
      cleanKey
    )}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: sysInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      let errMessage = `Gemini API error (${res.status})`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error?.message) errMessage = parsed.error.message;
      } catch {
        /* ignore */
      }
      throw new Error(errMessage);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  };

  try {
    return await callModel(model);
  } catch (err) {
    if (model !== 'gemini-flash-latest') {
      try {
        return await callModel('gemini-flash-latest');
      } catch {
        /* throw original error below */
      }
    }
    throw err;
  }
}

/* ---------- Groq Cloud API Integration ---------- */
export async function groqAnswer(
  query: string,
  grounding: string,
  level: Level,
  apiKey: string,
  model = 'llama-3.3-70b-versatile'
): Promise<string> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error('Missing Groq API key');

  const sys = `You are LearnAI, a cosmic pedagogical AI learning assistant. Explain at a ${level} level. Format with clean Markdown (headings, bold, bullet points).`;
  const userContent = grounding
    ? `Student Question: ${query}\n\nRelevant Course / Notes Context:\n${grounding}`
    : `Student Question: ${query}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let errMessage = `Groq API error (${res.status})`;
    try {
      const parsed = JSON.parse(errBody);
      if (parsed.error?.message) errMessage = parsed.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(errMessage);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

/* ---------- Master Answer Dispatcher ---------- */
export async function answer(
  query: string,
  index: Index,
  data: StaticData,
  p: Profile,
  s: Settings
): Promise<TutorReply> {
  const base = localAnswer(query, index, data, p, s);

  // Collect potential grounding context
  const hits = index.search(query, 4);
  const topHit = hits[0];
  const hasStrongLocalMatch = topHit && topHit.score >= 1.2;
  const ctx = hits.map((h) => `${h.doc.title}: ${h.doc.text}`).join('\n');
  const level = chooseLevel(s, p, base.topic);

  // Check for API keys
  const geminiKey = s.geminiApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  const groqKey = s.groqApiKey || (import.meta as any).env?.VITE_GROQ_API_KEY || '';

  // 1. If Gemini is available
  if (s.aiProvider === 'gemini' || (!s.aiProvider && geminiKey) || (s.aiProvider === 'auto' && geminiKey)) {
    try {
      const model = s.geminiModel || 'gemini-2.5-flash';
      const text = await geminiAnswer(query, ctx, level, geminiKey, model);
      return {
        ...base,
        markdown: `${text}\n\n_Answer generated by Gemini (${model}) · ${level} mode._`,
        usedLlm: true,
        provider: 'gemini',
        needsApiKey: false,
      };
    } catch (e) {
      if (hasStrongLocalMatch) {
        return {
          ...base,
          markdown: `${base.markdown}\n\n_Note: Gemini API request failed (${(e as Error).message}); fell back to local answer._`,
        };
      }
      return {
        usedLlm: false,
        needsApiKey: true,
        markdown: `### Gemini AI Connection Error\n\nCould not reach Gemini: ${(e as Error).message}\n\nPlease check your Gemini API key in **Settings** or try again.`,
      };
    }
  }

  // 2. If Groq is available
  if (s.aiProvider === 'groq' || (s.aiProvider === 'auto' && groqKey)) {
    try {
      const text = await groqAnswer(query, ctx, level, groqKey, s.groqModel || 'llama-3.3-70b-versatile');
      return {
        ...base,
        markdown: `${text}\n\n_Answer generated by Groq (${s.groqModel || 'llama-3.3-70b-versatile'}) · ${level} mode._`,
        usedLlm: true,
        provider: 'groq',
        needsApiKey: false,
      };
    } catch (e) {
      if (hasStrongLocalMatch) {
        return {
          ...base,
          markdown: `${base.markdown}\n\n_Note: Groq API request failed (${(e as Error).message}); fell back to local answer._`,
        };
      }
      return {
        usedLlm: false,
        needsApiKey: true,
        markdown: `### Groq AI Connection Error\n\nCould not reach Groq: ${(e as Error).message}\n\nPlease check your Groq API key in **Settings** or try again.`,
      };
    }
  }

  // 3. If Local Ollama server is configured
  if (s.localLlmUrl) {
    try {
      const text = await llmAnswer(query, ctx, level, s);
      return {
        ...base,
        markdown: `${text}\n\n_Generated by your local model (${s.localLlmModel}); private on-device._`,
        usedLlm: true,
        provider: 'ollama',
        needsApiKey: false,
      };
    } catch (e) {
      return {
        ...base,
        markdown: `${base.markdown}\n\n_Local model unavailable (${(e as Error).message}); showing built-in answer._`,
      };
    }
  }

  // 4. Default: Local retrieval answer
  return base;
}
