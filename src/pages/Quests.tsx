import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Volume2,
  ArrowRight,
  RotateCcw,
  Target,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { Page, Card, Bar, btnPrimary, btnGhost } from '../components/Page';
import { profileStore, updateProfile, useProfile, useSettings } from '../engine/store';
import { allQuestions, useStaticData } from '../engine/bank';
import { fiftyFifty, paceLabel, pickNext, recordAnswer, recommend, sessionLength } from '../engine/adaptive';
import { speak } from '../engine/speech';
import type { Question } from '../engine/types';

interface Result {
  q: Question;
  chosen: number;
  correct: boolean;
  xp: number;
}

export const Quests = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const p = useProfile();
  const settings = useSettings();
  const { data, error } = useStaticData();
  const bank = useMemo(
    () => (data ? allQuestions(data, p) : []),
    // eslint-disable-line react-hooks/exhaustive-deps
    [data, p.notes]
  );
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
  const [total, setTotal] = useState(8);
  const choice = len || sessionLength(p.paceFactor);

  const next = useCallback(() => {
    const nq = pickNext(bank, profileStore.get(), { topic: topic || undefined, exclude: used.current });
    if (!nq) {
      setPhase('done');
      return;
    }
    used.current.add(nq.id);
    setQ(nq);
    setSel(null);
    setVisible(null);
    started.current = Date.now();
    if (settings.speak) {
      speak(`${nq.text}. ${nq.options.map((o, i) => `Option ${i + 1}: ${o}`).join('. ')}`, settings.speechRate);
    }
  }, [bank, topic, settings.speak, settings.speechRate]);

  const start = () => {
    used.current = new Set();
    setResults([]);
    const snap: Record<string, number> = {};
    Object.entries(profileStore.get().topics).forEach(([k, v]) => {
      snap[k] = v.mastery;
    });
    setTotal(choice);
    setStartMastery(snap);
    setPhase('run');
    next();
  };

  const submit = useCallback(
    (choiceIndex: number) => {
      if (!q || sel !== null) return;
      setSel(choiceIndex);
      const r = recordAnswer(profileStore.get(), q, choiceIndex, Date.now() - started.current, visible !== null);
      updateProfile(() => r.profile);
      setResults((x) => [...x, { q, chosen: choiceIndex, correct: choiceIndex === q.answer, xp: r.xpGained }]);
    },
    [q, sel, visible]
  );

  const advance = useCallback(() => {
    if (results.length >= total) {
      const ok = results.every((r) => r.correct);
      updateProfile((pp) => ({
        ...pp,
        sessions: pp.sessions + 1,
        perfectSessions: pp.perfectSessions + (ok && results.length >= 5 ? 1 : 0),
      }));
      setPhase('done');
    } else {
      next();
    }
  }, [results, total, next]);

  useEffect(() => {
    if (phase !== 'run' || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const n = Number(e.key);
      if (sel === null && n >= 1 && n <= q.options.length && (!visible || visible.includes(n - 1))) {
        submit(n - 1);
      } else if (sel !== null && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, q, sel, visible, submit, advance]);

  if (error) {
    return (
      <Page title="Practice & Quizzes">
        <Card className="border-stellar-error/30 text-stellar-error">Could not load question bank: {error}</Card>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page title="Practice & Quizzes">
        <Card className="text-center p-8 text-stellar-secondary">Loading question bank…</Card>
      </Page>
    );
  }

  // Phase 1: Setup
  if (phase === 'setup') {
    const label = paceLabel(p.paceFactor);
    return (
      <Page
        title="Adaptive Practice & Quizzes"
        subtitle="Questions are dynamically selected to maintain a challenging yet achievable success rate, adapting to your mastery."
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stellar-border">
              <div className="p-2.5 rounded-xl bg-stellar-violet/20 text-stellar-purple">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Configure Your Session</h2>
                <p className="text-xs text-stellar-secondary">Select your focus area and desired session length</p>
              </div>
            </div>

            <div>
              <label htmlFor="topic" className="block text-xs font-semibold text-stellar-secondary mb-1.5">
                Topic Selection
              </label>
              <select
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl bg-stellar-surface border border-stellar-border focus:border-stellar-cyan/50 focus:ring-1 focus:ring-stellar-cyan/30 p-3 text-sm text-white"
              >
                <option value="">Smart Mix — Focus on where I need the most work</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stellar-secondary">Session Length</span>
                <span className="text-xs text-stellar-muted">
                  Suggested for your <strong className="text-stellar-cyan">{label.toLowerCase()}</strong> rhythm
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3" role="group" aria-label="Session length">
                {[5, 8, 12].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setLen(n)}
                    aria-pressed={choice === n}
                    className={`py-3 px-4 rounded-xl text-center border transition-all ${
                      choice === n
                        ? 'border-stellar-cyan bg-stellar-cyan/15 text-white font-bold shadow-cyan-glow/20'
                        : 'border-stellar-border bg-stellar-surface/60 text-stellar-secondary hover:text-white hover:bg-stellar-card'
                    }`}
                  >
                    <div className="text-lg font-bold leading-tight">{n}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">Questions</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                className={`${btnPrimary} w-full py-3.5 text-base justify-center`}
                onClick={start}
                disabled={bank.length === 0}
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Practice Session</span>
              </button>
            </div>

            <p className="text-center text-xs text-stellar-muted">
              Tip: You can use number keys <kbd className="px-1.5 py-0.5 rounded bg-stellar-surface border border-stellar-border text-white">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-stellar-surface border border-stellar-border text-white">4</kbd> to submit and <kbd className="px-1.5 py-0.5 rounded bg-stellar-surface border border-stellar-border text-white">Enter</kbd> to proceed.
            </p>
          </Card>
        </div>
      </Page>
    );
  }

  // Phase 3: Done / Results
  if (phase === 'done') {
    const right = results.filter((r) => r.correct).length;
    const xp = results.reduce((a, r) => a + r.xp, 0);
    const pct = results.length ? Math.round((right / results.length) * 100) : 0;
    const deltas = Object.entries(profileStore.get().topics)
      .filter(([k]) => results.some((r) => r.q.topic === k))
      .map(([k, v]) => ({
        k,
        d: Math.round((v.mastery - (startMastery[k] ?? 0.25)) * 100),
      }));
    const recs = recommend(profileStore.get(), bank, 0).slice(0, 2);

    return (
      <Page title="Session Complete">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center p-8 space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-stellar-violet to-stellar-cyan p-[2px] mx-auto">
              <div className="w-full h-full rounded-2xl bg-stellar-surface flex items-center justify-center text-stellar-cyan shadow-cyan-glow">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="cosmic-heading text-4xl sm:text-5xl font-black text-white">
                {right} / {results.length}
              </h2>
              <p className="text-base font-semibold text-stellar-cyan">
                +{xp} XP Earned · {pct}% Accuracy
              </p>
              <p className="text-xs text-stellar-secondary">
                Session recorded to your adaptive memory graph on this device.
              </p>
            </div>

            {/* Mastery Deltas */}
            {deltas.length > 0 && (
              <div className="p-3.5 rounded-xl bg-stellar-surface/80 border border-stellar-border space-y-2">
                <p className="text-xs font-semibold text-stellar-secondary uppercase tracking-wider">
                  Mastery Progress
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {deltas.map(({ k, d }) => (
                    <span
                      key={k}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        d >= 0
                          ? 'bg-stellar-success/15 border-stellar-success/30 text-stellar-success'
                          : 'bg-stellar-error/15 border-stellar-error/30 text-stellar-error'
                      }`}
                    >
                      {k}: {d >= 0 ? `+${d}%` : `${d}%`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missed questions revision */}
            {results.some((r) => !r.correct) && (
              <div className="text-left space-y-3 pt-2">
                <p className="text-xs font-semibold text-stellar-warning uppercase tracking-wider">
                  Concepts to Review
                </p>
                <div className="space-y-2.5">
                  {results
                    .filter((r) => !r.correct)
                    .map((r, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-stellar-surface border border-stellar-border text-xs space-y-1">
                        <p className="font-semibold text-white">{r.q.text}</p>
                        <p className="text-stellar-success font-medium">
                          Correct Answer: {r.q.options[r.q.answer]}
                        </p>
                        <p className="text-stellar-secondary">{r.q.explanation}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            {recs.length > 0 && (
              <div className="text-left space-y-2 pt-2 border-t border-stellar-border/60">
                <p className="text-xs font-semibold text-stellar-secondary uppercase tracking-wider">
                  Recommended Next Mission
                </p>
                <div className="space-y-1.5">
                  {recs.map((r) => (
                    <button
                      key={r.title}
                      onClick={() => nav(r.path)}
                      className="w-full text-left p-2.5 rounded-lg bg-stellar-surface/50 border border-stellar-border hover:border-stellar-cyan/40 hover:bg-stellar-card text-xs flex items-center justify-between group"
                    >
                      <span className="font-medium text-white group-hover:text-stellar-cyan transition-colors">{r.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stellar-secondary group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center pt-2">
              <button className={btnPrimary} onClick={() => setPhase('setup')}>
                <RotateCcw className="w-4 h-4 mr-1" aria-hidden />
                <span>Another Session</span>
              </button>
              <button className={btnGhost} onClick={() => nav('/dashboard')}>
                Return to Dashboard
              </button>
            </div>
          </Card>
        </div>
      </Page>
    );
  }

  // Phase 2: Active Run
  if (!q) {
    return (
      <Page title="Practice">
        <Card>No questions available for this choice.</Card>
      </Page>
    );
  }

  const currentIdx = results.length + (sel === null ? 1 : 0);
  const shownOptions = visible ?? q.options.map((_, i) => i);
  const progressValue = results.length / total;

  return (
    <Page
      title="Adaptive Practice"
      subtitle={`${q.topic} · Question ${currentIdx} of ${total}`}
      badge={`Difficulty Tier ${q.difficulty}/5`}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Progress Bar & Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-stellar-secondary">
            <span>
              Progress: <strong className="text-white">{results.length}</strong> / {total} answered
            </span>
            <span className="font-mono">{Math.round(progressValue * 100)}%</span>
          </div>
          <Bar value={progressValue} label="Quiz session progress" height="h-2" />
        </div>

        {/* Question Card */}
        <Card className="space-y-5 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-relaxed" id="qtext">
              {q.text}
            </h2>
            <button
              className={`${btnGhost} shrink-0 p-2 text-stellar-secondary hover:text-white`}
              aria-label="Read question aloud"
              title="Read aloud"
              onClick={() =>
                speak(
                  `${q.text}. ${q.options.map((o, i) => `Option ${i + 1}: ${o}`).join('. ')}`,
                  settings.speechRate
                )
              }
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Options List */}
          <div role="group" aria-labelledby="qtext" className="space-y-3">
            {shownOptions.map((optIdx) => {
              const optText = q.options[optIdx];
              const isChosen = sel === optIdx;
              const isCorrect = optIdx === q.answer;

              let style =
                'border-stellar-border bg-stellar-surface/70 hover:bg-stellar-card hover:border-stellar-cyan/40 text-stellar-text';

              if (sel !== null) {
                if (isCorrect) {
                  style = 'border-stellar-success bg-stellar-success/15 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)] font-semibold';
                } else if (isChosen) {
                  style = 'border-stellar-error bg-stellar-error/15 text-white shadow-[0_0_15px_rgba(251,113,133,0.2)] font-semibold';
                } else {
                  style = 'opacity-40 border-stellar-border/40 bg-stellar-surface/30';
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={sel !== null}
                  onClick={() => submit(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm sm:text-base leading-relaxed ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-stellar-card border border-stellar-border text-xs font-bold text-stellar-secondary flex items-center justify-center shrink-0">
                      {optIdx + 1}
                    </span>
                    <span>{optText}</span>
                  </div>

                  {sel !== null && (
                    <div className="shrink-0 ml-2">
                      {isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-stellar-success" aria-label="Correct" />
                      )}
                      {isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-stellar-error" aria-label="Incorrect" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 50:50 Hint or Immediate Explanation Card */}
          {sel === null ? (
            <div className="pt-2">
              <button
                className={`${btnGhost} text-xs py-2`}
                disabled={visible !== null}
                onClick={() => setVisible(fiftyFifty(q))}
              >
                <Lightbulb className="w-4 h-4 text-stellar-warning mr-1" aria-hidden />
                <span>50:50 Hint: eliminate two wrong choices (half XP)</span>
              </button>
            </div>
          ) : (
            <div
              role="status"
              className={`p-4 sm:p-5 rounded-xl border space-y-2 animate-fade-in ${
                sel === q.answer
                  ? 'bg-stellar-success/10 border-stellar-success/30'
                  : 'bg-stellar-surface border-stellar-border'
              }`}
            >
              <div className="flex items-center gap-2">
                {sel === q.answer ? (
                  <span className="font-bold text-stellar-success text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="font-bold text-stellar-error text-sm flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Not quite right
                  </span>
                )}
              </div>
              <p className="text-sm text-stellar-text/90 leading-relaxed">{q.explanation}</p>
              {sel !== q.answer && (
                <p className="text-xs text-stellar-muted">
                  This concept will be reintroduced in subsequent practice cycles to reinforce memory retention.
                </p>
              )}
              <div className="pt-2">
                <button
                  className={`${btnPrimary} px-6`}
                  onClick={advance}
                  autoFocus
                >
                  <span>{results.length >= total ? 'Complete Session' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
};
