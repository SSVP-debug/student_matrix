import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Lightbulb, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { Page, Card, btnPrimary, btnGhost } from '../components/Page';
import { profileStore, updateProfile, useProfile, useSettings } from '../engine/store';
import { allQuestions, useStaticData } from '../engine/bank';
import { fiftyFifty, paceLabel, pickNext, recordAnswer, recommend, sessionLength } from '../engine/adaptive';
import { speak } from '../engine/speech';
import type { Question } from '../engine/types';

interface Result { q: Question; chosen: number; correct: boolean; xp: number }

export const Quests = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const p = useProfile();
  const settings = useSettings();
  const { data, error } = useStaticData();
  const bank = useMemo(() => (data ? allQuestions(data, p) : []), [data, p.notes]); // eslint-disable-line react-hooks/exhaustive-deps
  const topics = useMemo(() => [...new Set(bank.map((q) => q.topic))], [bank]);

  const [topic, setTopic] = useState(params.get('topic') ?? '');
  const [len, setLen] = useState(0);
  const [phase, setPhase] = useState<'setup' | 'run' | 'done'>('setup');
  const [q, setQ] = useState<Question | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [visible, setVisible] = useState<number[] | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [startMastery, setStartMastery] = useState<Record<string, number>>({});
  const started = useRef(0);
  const used = useRef<Set<string>>(new Set());
  const [total, setTotal] = useState(8); // frozen at session start so pace updates cannot change it mid-session
  const choice = len || sessionLength(p.paceFactor);

  const next = useCallback(() => {
    const nq = pickNext(bank, profileStore.get(), { topic: topic || undefined, exclude: used.current });
    if (!nq) { setPhase('done'); return; }
    used.current.add(nq.id);
    setQ(nq); setSel(null); setVisible(null); started.current = Date.now();
    if (settings.speak) speak(`${nq.text}. ${nq.options.map((o, i) => `Option ${i + 1}: ${o}`).join('. ')}`, settings.speechRate);
  }, [bank, topic, settings.speak, settings.speechRate]);

  const start = () => {
    used.current = new Set(); setResults([]);
    const snap: Record<string, number> = {};
    Object.entries(profileStore.get().topics).forEach(([k, v]) => { snap[k] = v.mastery; });
    setTotal(choice); setStartMastery(snap); setPhase('run'); next();
  };

  const submit = useCallback((choice: number) => {
    if (!q || sel !== null) return;
    setSel(choice);
    const r = recordAnswer(profileStore.get(), q, choice, Date.now() - started.current, visible !== null);
    updateProfile(() => r.profile);
    setResults((x) => [...x, { q, chosen: choice, correct: choice === q.answer, xp: r.xpGained }]);
  }, [q, sel, visible]);

  const advance = useCallback(() => {
    if (results.length >= total) {
      const ok = results.every((r) => r.correct);
      updateProfile((pp) => ({ ...pp, sessions: pp.sessions + 1, perfectSessions: pp.perfectSessions + (ok && results.length >= 5 ? 1 : 0) }));
      setPhase('done');
    } else next();
  }, [results, total, next]);

  useEffect(() => {
    if (phase !== 'run' || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const n = Number(e.key);
      if (sel === null && n >= 1 && n <= q.options.length && (!visible || visible.includes(n - 1))) submit(n - 1);
      else if (sel !== null && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, q, sel, visible, submit, advance]);

  if (error) return <Page title="Practice"><Card>Could not load questions: {error}</Card></Page>;
  if (!data) return <Page title="Practice"><Card>Loading…</Card></Page>;

  if (phase === 'setup') {
    const label = paceLabel(p.paceFactor);
    return (
      <Page title="Adaptive Practice" subtitle="Questions are chosen to be challenging but achievable, based on your answers so far.">
        <Card className="max-w-2xl space-y-5">
          <div>
            <label htmlFor="topic" className="block text-sm text-white/70 mb-1">What to practise</label>
            <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full rounded-2xl bg-[#080910] border border-white/15 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10 p-3">
              <option value="">Smart mix — focus on what I need most</option>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Session length <span className="text-white/60">(suggested {sessionLength(p.paceFactor)} for a {label.toLowerCase()} pace)</span></p>
            <div className="flex gap-2" role="group" aria-label="Session length">
              {[5, 8, 12].map((n) => <button key={n} onClick={() => setLen(n)} aria-pressed={choice === n} className={choice === n ? btnPrimary : btnGhost}>{n}</button>)}
            </div>
          </div>
          <button className={btnPrimary} onClick={start} disabled={bank.length === 0}>Start session</button>
          <p className="text-white/60 text-xs">Tip: press 1–4 to answer and Enter for the next question.</p>
        </Card>
      </Page>
    );
  }

  if (phase === 'done') {
    const right = results.filter((r) => r.correct).length;
    const xp = results.reduce((a, r) => a + r.xp, 0);
    const deltas = Object.entries(profileStore.get().topics).filter(([k]) => results.some((r) => r.q.topic === k)).map(([k, v]) => ({ k, d: Math.round((v.mastery - (startMastery[k] ?? 0.25)) * 100) }));
    const recs = recommend(profileStore.get(), bank, 0).slice(0, 2);
    return (
      <Page title="Session complete">
        <Card className="max-w-2xl space-y-4">
          <p className="cosmic-heading text-4xl font-bold">{right}/{results.length}</p>
          <p className="text-white/70">+{xp} XP · {results.length ? Math.round((right / results.length) * 100) : 0}% correct</p>
          {deltas.map(({ k, d }) => <p key={k} className="text-sm">{k}: mastery {d >= 0 ? '+' : ''}{d}%</p>)}
          {results.some((r) => !r.correct) && (
            <div><h2 className="font-semibold mb-2">To review</h2><ul className="space-y-2 text-sm text-white/80">
              {results.filter((r) => !r.correct).map((r) => <li key={r.q.id}><span className="text-white">{r.q.text}</span><br />Answer: {r.q.options[r.q.answer]}. {r.q.explanation}</li>)}
            </ul></div>
          )}
          {recs.length > 0 && <div><h2 className="font-semibold mb-1">Next</h2>{recs.map((r) => <button key={r.title} onClick={() => nav(r.path)} className="block text-left text-sm underline text-cyan-200 mb-1">{r.title}</button>)}</div>}
          <div className="flex gap-3"><button className={btnPrimary} onClick={() => { setPhase('setup'); }}><RotateCcw className="inline w-4 h-4 mr-1" aria-hidden />Another session</button><button className={btnGhost} onClick={() => nav('/dashboard')}>Dashboard</button></div>
        </Card>
      </Page>
    );
  }

  if (!q) return <Page title="Practice"><Card>No questions available for this choice.</Card></Page>;
  const shown = visible ?? q.options.map((_, i) => i);
  return (
    <Page title="Adaptive Practice" subtitle={`${q.topic} · question ${Math.min(results.length + (sel === null ? 1 : 0), total)} of ${total}`}>
      <Card className="max-w-3xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight" id="qtext">{q.text}</h2>
          <button className={btnGhost} aria-label="Read question aloud" onClick={() => speak(`${q.text}. ${q.options.map((o, i) => `Option ${i + 1}: ${o}`).join('. ')}`, settings.speechRate)}><Volume2 className="w-4 h-4" /></button>
        </div>
        <div role="group" aria-labelledby="qtext" className="space-y-2">
          {shown.map((i) => {
            const o = q.options[i];
            const state = sel === null ? '' : i === q.answer ? 'border-emerald-400 bg-emerald-400/15' : i === sel ? 'border-rose-400 bg-rose-400/15' : 'opacity-60';
            return (
              <button key={i} disabled={sel !== null} onClick={() => submit(i)} className={`w-full text-left p-4 rounded-2xl border border-white/20 hover:bg-white/10 disabled:hover:bg-transparent ${state}`}>
                <span className="text-white/60 mr-2">{i + 1}.</span>{o}
                {sel !== null && i === q.answer && <CheckCircle2 className="inline w-4 h-4 ml-2 text-emerald-300" aria-label="correct" />}
                {sel !== null && i === sel && i !== q.answer && <XCircle className="inline w-4 h-4 ml-2 text-rose-300" aria-label="incorrect" />}
              </button>
            );
          })}
        </div>
        {sel === null ? (
          <button className={btnGhost} disabled={visible !== null} onClick={() => setVisible(fiftyFifty(q))}><Lightbulb className="inline w-4 h-4 mr-1" aria-hidden />Hint: remove two wrong answers (half XP)</button>
        ) : (
          <div role="status" className="p-4 rounded-2xl glass border border-white/10">
            <p className="font-semibold mb-1">{sel === q.answer ? 'Correct!' : 'Not quite.'}</p>
            <p className="text-white/80">{q.explanation}</p>
            {sel !== q.answer && <p className="text-white/70 text-sm mt-2">This will come back later in a new session so you can lock it in.</p>}
            <button className={`${btnPrimary} mt-3`} onClick={advance} autoFocus>{results.length >= total ? 'Finish' : 'Next'} <ArrowRight className="inline w-4 h-4" aria-hidden /></button>
          </div>
        )}
      </Card>
    </Page>
  );
};
