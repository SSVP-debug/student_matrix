/* Sanity checks for the on-device learning engine. Run: npm test */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { defaultProfile } from '../src/engine/store.ts';
import { expectedCorrect, fiftyFifty, pickNext, recordAnswer, sm2, newCard, effectiveMastery, recommend, DAY } from '../src/engine/adaptive.ts';
import { Index } from '../src/engine/text.ts';
import { buildNote } from '../src/engine/notes.ts';
import type { Question } from '../src/engine/types.ts';

const raw = JSON.parse(readFileSync('public/data/quests.json', 'utf8')).missions;
const bank: Question[] = raw.flatMap((m: any) => m.questions.map((q: any, i: number) => ({
  id: `m${m.id}-q${q.id}`, topic: m.title, subject: m.subject, text: q.question, options: q.options, answer: q.correctAnswer,
  explanation: q.explanation, difficulty: Math.min(5, Math.max(1, ({ Easy: 2, Medium: 3, Hard: 4 } as any)[m.difficulty] + (i < 3 ? -1 : i >= 7 ? 1 : 0))), source: 'builtin',
})));
assert.ok(bank.length >= 90, 'bank loaded');

// 1. A strong learner's ability rises and mastery climbs; a struggling learner's falls.
const sim = (acc: number) => {
  let p = defaultProfile();
  const topic = bank[0].topic;
  for (let i = 0; i < 25; i++) {
    const q = pickNext(bank, p, { topic })!; assert.ok(q);
    const right = Math.random() < acc;
    p = recordAnswer(p, q, right ? q.answer : (q.answer + 1) % 4, 15000, false).profile;
  }
  return p.topics[topic];
};
const strong = sim(0.95), weak = sim(0.1);
assert.ok(strong.mastery > weak.mastery, `mastery strong ${strong.mastery} > weak ${weak.mastery}`);
assert.ok(strong.ability > 1000 && weak.ability < 1000, 'ability moves the right way');

// 2. Item selection targets ~70% success: easy item for a weak learner.
const mid = Object.assign(defaultProfile(), {});
const q1 = pickNext(bank, mid, { topic: bank[0].topic })!;
assert.ok(expectedCorrect(1000, q1.difficulty) > 0.4, 'first question not impossible');

// 3. No immediate repeats, and misconceptions are tracked.
let p = defaultProfile(); const seen = new Set<string>();
for (let i = 0; i < 9; i++) { const q = pickNext(bank, p, { exclude: seen })!; seen.add(q.id); p = recordAnswer(p, q, (q.answer + 1) % 4, 9000, false).profile; }
assert.equal(seen.size, 9);
assert.ok(Object.keys(p.misconceptions).length === 9);

// 4. Forgetting: mastery decays over time.
const t = p.topics[bank[0].topic] ?? Object.values(p.topics)[0];
assert.ok(effectiveMastery({ ...t, mastery: 0.9, attempts: 5, lastSeen: Date.now() - 30 * DAY }) < 0.5);

// 5. 50:50 keeps the right answer and exactly two options.
for (const q of bank) { const v = fiftyFifty(q); assert.equal(v.length, 2); assert.ok(v.includes(q.answer)); }

// 6. SM-2 intervals grow; "Again" resets.
let c = newCard(); const t0 = 0;
c = sm2(c, 4, t0); assert.equal(c.interval, 1);
c = sm2(c, 4, t0); assert.equal(c.interval, 3);
c = sm2(c, 4, t0); assert.ok(c.interval >= 7);
c = sm2(c, 1, t0); assert.equal(c.reps, 0);

// 7. Retrieval finds the right card.
const idx = new Index([
  { id: '1', title: "What is Newton's First Law of Motion?", text: 'An object at rest stays at rest unless acted upon by a force.', subject: 'Physics', kind: 'card' },
  { id: '2', title: 'Define kinetic energy', text: 'Energy due to motion, KE = half m v squared.', subject: 'Physics', kind: 'card' },
]);
assert.equal(idx.search('explain kinetic energy')[0].doc.id, '2');

// 8. Notes -> summary/questions/cards, fully local.
const text = `Photosynthesis is the process by which plants convert light energy into chemical energy. Chlorophyll is the green pigment that absorbs sunlight in the chloroplasts of plant cells. During the light reactions, chlorophyll captures photons and splits water molecules, releasing oxygen. The Calvin cycle uses the chemical energy to fix carbon dioxide into glucose in the stroma. Glucose produced by photosynthesis fuels respiration and growth in plants. Stomata are small pores on leaves that let carbon dioxide enter and oxygen leave. Photosynthesis depends on light intensity, carbon dioxide concentration, and temperature. Plants store excess glucose as starch in their roots, stems and leaves. Chloroplasts contain thylakoid membranes where the light reactions take place.`;
const note = buildNote('Photosynthesis', text);
assert.ok(note.summary.length >= 4 && note.keyTerms.length > 0);
assert.ok(note.cards.length >= 2, `cards ${note.cards.length}`);
for (const q of note.questions) { assert.equal(q.options.length, 4); assert.ok(q.options[q.answer]); assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4); }
console.log(`notes: ${note.questions.length} questions, ${note.cards.length} cards`);

// 9. Recommendations exist for a fresh and a practised learner.
assert.ok(recommend(defaultProfile(), bank, 0).length > 0);
assert.ok(recommend(p, bank, 3).some((r) => r.kind === 'flashcards'));
console.log('engine checks passed');
