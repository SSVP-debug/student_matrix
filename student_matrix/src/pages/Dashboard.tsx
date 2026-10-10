import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock, Target, Zap, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Page, Card, Bar, btnPrimary } from '../components/Page';
import { useProfile, useSettings } from '../engine/store';
import { allQuestions, useStaticData } from '../engine/bank';
import { dueCount, levelFromXp, paceLabel, recommend, sessionLength, summarize, xpForLevel } from '../engine/adaptive';

const short = (t: string) => (t.includes(':') ? t.split(':')[0].replace(/^My notes$/, 'Notes') : t.replace(/^(Master|Explore) /, '')).slice(0, 20);
const tier = (m: number) => (m >= 0.8 ? '#00E5FF' : m >= 0.55 ? '#7C6CFF' : m >= 0.35 ? '#B58CFF' : '#6b7280');

export const Dashboard = () => {
  const nav = useNavigate();
  const p = useProfile();
  const s = useSettings();
  const { data, error } = useStaticData();

  const view = useMemo(() => {
    if (!data) return null;
    const bank = allQuestions(data, p);
    const sum = summarize(p, bank);
    const cardIds = [...data.subjects.flatMap((x) => x.cards.map((c) => `s${x.id}-${c.id}`)), ...p.notes.flatMap((n) => n.cards.map((c) => c.id))];
    const due = dueCount(p, cardIds);
    const attempted = sum.filter((x) => x.attempts >= 2).sort((a, b) => b.mastery - a.mastery);
    return { sum, due, recs: recommend(p, bank, due), strong: attempted.filter((x) => x.mastery >= 0.5).slice(0, 3), weak: [...attempted].reverse().filter((x) => x.mastery < 0.5).slice(0, 3) };
  }, [data, p]);

  const lvl = levelFromXp(p.xp);
  const into = (p.xp - xpForLevel(lvl)) / Math.max(1, xpForLevel(lvl + 1) - xpForLevel(lvl));
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const today = p.history.filter((a) => a.at >= startOfDay).length;
  const acc = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;
  const pace = paceLabel(p.paceFactor);
  const hours = p.studyMs / 3_600_000;

  if (error) return <Page title="Dashboard"><Card>Could not load course data: {error}. Reload once while online so it can be saved for offline use.</Card></Page>;

  return (
    <Page title={`Welcome back, ${s.name}`} subtitle="Everything here is computed on your device — your progress never leaves it.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><Zap className="w-5 h-5 mb-2" aria-hidden /><p className="text-2xl font-bold">Level {lvl}</p><p className="text-white/70 text-sm mb-2">{p.xp} XP</p><Bar value={into} label="Progress to next level" /></Card>
        <Card><Flame className="w-5 h-5 mb-2" aria-hidden /><p className="text-2xl font-bold">{p.streak} day{p.streak === 1 ? '' : 's'}</p><p className="text-white/70 text-sm">Streak (best {p.bestStreak})</p></Card>
        <Card><Target className="w-5 h-5 mb-2" aria-hidden /><p className="text-2xl font-bold">{today}/{s.dailyGoal}</p><p className="text-white/70 text-sm mb-2">Questions today</p><Bar value={Math.min(1, today / s.dailyGoal)} label="Daily goal" /></Card>
        <Card><Clock className="w-5 h-5 mb-2" aria-hidden /><p className="text-2xl font-bold">{acc}%</p><p className="text-white/70 text-sm">Accuracy · {hours < 1 ? `${Math.round(hours * 60)} min` : `${hours.toFixed(1)} h`} studied</p></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Recommended for you</h2>
          {!view ? <p className="text-white/70">Loading…</p> : (
            <ul className="space-y-3">
              {view.recs.map((r) => (
                <li key={r.title} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="min-w-0"><p className="font-medium">{r.title}</p><p className="text-white/70 text-sm">{r.reason}</p></div>
                  <button className={btnPrimary} onClick={() => nav(r.path)} aria-label={`Go: ${r.title}`}><ArrowRight className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-1">Your pace</h2>
          <p className="text-3xl font-bold mb-2">{pace}</p>
          <p className="text-white/70 text-sm">
            {pace === 'Deliberate' ? 'You take your time, which is great for depth. Sessions are kept short (5 questions) and hints are one tap away.'
              : pace === 'Quick' ? 'You answer fast. Sessions are longer (12 questions) and the difficulty rises sooner.'
              : 'A balanced rhythm. Sessions default to 8 questions.'}
          </p>
          <p className="text-white/70 text-sm mt-2">Suggested session: {sessionLength(p.paceFactor)} questions.</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Knowledge map</h2>
          {!view ? null : (
            <>
              <svg viewBox="0 0 400 220" className="w-full h-auto" aria-hidden>
                {view.sum.map((t, i) => {
                  const n = view.sum.length;
                  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                  const x = 200 + Math.cos(a) * 150, y = 110 + Math.sin(a) * 78;
                  return (
                    <g key={t.topic} transform={`translate(${x},${y})`} className="cursor-pointer" onClick={() => nav(`/quests?topic=${encodeURIComponent(t.topic)}`)}>
                      <line x1={-x + 200} y1={-y + 110} x2={0} y2={0} stroke="#fff" strokeOpacity="0.08" />
                      <circle r={8 + t.mastery * 12} fill={tier(t.mastery)} fillOpacity={0.25 + t.mastery * 0.6} stroke={tier(t.mastery)} />
                      <text y={26 + t.mastery * 6} textAnchor="middle" fontSize="8" fill="#fff" fillOpacity="0.8">{short(t.topic)}</text>
                    </g>
                  );
                })}
                <circle cx="200" cy="110" r="14" fill="#00E5FF" fillOpacity="0.2" /><text x="200" y="113" textAnchor="middle" fontSize="8" fill="#fff">You</text>
              </svg>
              <p className="text-white/70 text-xs">Bigger, brighter stars = stronger mastery. Knowledge fades if you do not practise, so stars dim over time.</p>
            </>
          )}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-3">Strengths & focus</h2>
          {!view || (view.strong.length === 0 && view.weak.length === 0) ? <p className="text-white/70 text-sm">Answer a few questions in two or more topics and your strengths and weak spots will show up here.</p> : (
            <div className="space-y-4">
              {view.strong.length > 0 && <div><p className="flex items-center gap-2 text-sm text-white/70 mb-1"><TrendingUp className="w-4 h-4" aria-hidden />Strongest</p>{view.strong.map((t) => <p key={t.topic} className="text-sm">{t.topic} <span className="text-white/70">· {Math.round(t.mastery * 100)}%</span></p>)}</div>}
              {view.weak.length > 0 && <div><p className="flex items-center gap-2 text-sm text-white/70 mb-1"><TrendingDown className="w-4 h-4" aria-hidden />Needs work</p>{view.weak.map((t) => <p key={t.topic} className="text-sm">{t.topic} <span className="text-white/70">· {Math.round(t.mastery * 100)}%</span></p>)}</div>}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-3">Mastery by topic</h2>
        {!view ? null : (
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {[...view.sum].sort((a, b) => a.subject.localeCompare(b.subject)).map((t) => (
              <li key={t.topic}>
                <div className="flex justify-between text-sm mb-1"><span>{t.topic}</span><span className="text-white/70">{t.attempts ? `${Math.round(t.mastery * 100)}% · ${t.attempts} answered` : 'not started'}</span></div>
                <Bar value={t.attempts ? t.mastery : 0} label={`${t.topic} mastery`} />
              </li>
            ))}
          </ul>
        )}
        {view && view.due > 0 && <p className="text-sm text-white/70 mt-4">{view.due} flashcards ready to review.</p>}
      </Card>
    </Page>
  );
};
