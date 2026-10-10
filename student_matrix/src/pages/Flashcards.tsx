import { useCallback, useEffect, useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Page, Card, btnPrimary, btnGhost } from '../components/Page';
import { profileStore, updateProfile, useProfile, useSettings } from '../engine/store';
import { useStaticData } from '../engine/bank';
import { newCard, sm2 } from '../engine/adaptive';
import { speak } from '../engine/speech';

interface C { id: string; subject: string; question: string; answer: string }
const NEW_PER_SESSION = 10;

export const Flashcards = () => {
  const p = useProfile();
  const s = useSettings();
  const { data, error } = useStaticData();
  const [subject, setSubject] = useState('');
  const [queue, setQueue] = useState<C[] | null>(null);
  const [flip, setFlip] = useState(false);
  const [done, setDone] = useState(0);

  const cards = useMemo<C[]>(() => {
    if (!data) return [];
    return [
      ...data.subjects.flatMap((x) => x.cards.map((c) => ({ id: `s${x.id}-${c.id}`, subject: x.name, question: c.question, answer: c.answer }))),
      ...p.notes.flatMap((n) => n.cards),
    ];
  }, [data, p.notes]);
  const subjects = useMemo(() => [...new Set(cards.map((c) => c.subject))], [cards]);

  const build = useCallback(() => {
    const now = Date.now();
    const pool = cards.filter((c) => !subject || c.subject === subject);
    const st = profileStore.get().cards;
    const review = pool.filter((c) => st[c.id] && st[c.id].due <= now).sort((a, b) => st[a.id].due - st[b.id].due);
    const fresh = pool.filter((c) => !st[c.id]).slice(0, NEW_PER_SESSION);
    setQueue([...review, ...fresh]); setFlip(false); setDone(0);
  }, [cards, subject]);

  useEffect(() => { if (data) build(); }, [data, build]);

  const grade = useCallback((g: 1 | 3 | 4 | 5) => {
    if (!queue?.length) return;
    const c = queue[0];
    updateProfile((pp) => ({ ...pp, cards: { ...pp.cards, [c.id]: sm2(pp.cards[c.id] ?? newCard(), g) }, cardsReviewed: pp.cardsReviewed + 1, xp: pp.xp + 2,
      lastActiveDay: pp.lastActiveDay }));
    setDone((d) => d + 1); setFlip(false);
    // "Again" cards return to the end of this session.
    setQueue((qq) => (qq ? (g === 1 ? [...qq.slice(1), c] : qq.slice(1)) : qq));
  }, [queue]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlip((f) => !f); }
      else if (flip && ['1', '2', '3', '4'].includes(e.key)) grade(([1, 3, 4, 5] as const)[Number(e.key) - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, grade]);

  if (error) return <Page title="Flashcards"><Card>Could not load cards: {error}</Card></Page>;
  const cur = queue?.[0];
  const nextDue = Object.values(p.cards).map((c) => c.due).filter((d) => d > Date.now()).sort((a, b) => a - b)[0];

  return (
    <Page title="Flashcards" subtitle="Spaced repetition: cards you find hard come back sooner, easy ones later.">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label htmlFor="subj" className="text-sm text-white/70">Subject</label>
        <select id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-2">
          <option value="">All subjects</option>{subjects.map((x) => <option key={x}>{x}</option>)}
        </select>
        <span className="text-sm text-white/70">{queue?.length ?? 0} left · {done} reviewed</span>
      </div>
      {!cur ? (
        <Card className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight mb-2">All caught up 🎉</h2>
          <p className="text-white/70">{nextDue ? `Next review ${new Date(nextDue).toLocaleString()}.` : 'No cards scheduled.'}</p>
          <button className={`${btnPrimary} mt-4`} onClick={build}>Check again</button>
        </Card>
      ) : (
        <Card className="max-w-2xl space-y-4">
          <p className="text-xs uppercase tracking-wide text-white/60">{cur.subject}</p>
          <button onClick={() => setFlip(!flip)} aria-label={flip ? 'Show question' : 'Show answer'} className="w-full min-h-[200px] text-left p-6 rounded-2xl bg-white/5 border border-white/15">
            <p className="text-xl font-semibold tracking-tight">{cur.question}</p>
            {flip && <p className="mt-4 text-white/85 border-t border-white/10 pt-4">{cur.answer}</p>}
            {!flip && <p className="mt-6 text-sm text-white/60">Think of the answer, then press Space or tap to reveal.</p>}
          </button>
          <div className="flex gap-2">
            <button className={btnGhost} aria-label="Read aloud" onClick={() => speak(flip ? `${cur.question}. ${cur.answer}` : cur.question, s.speechRate)}><Volume2 className="w-4 h-4" /></button>
            {flip && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="How well did you remember?">
                <button className={btnGhost} onClick={() => grade(1)}>1 Again</button>
                <button className={btnGhost} onClick={() => grade(3)}>2 Hard</button>
                <button className={btnPrimary} onClick={() => grade(4)}>3 Good</button>
                <button className={btnGhost} onClick={() => grade(5)}>4 Easy</button>
              </div>
            )}
          </div>
        </Card>
      )}
    </Page>
  );
};
