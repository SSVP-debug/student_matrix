import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Clock,
  Target,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Rocket,
  Compass,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Page, Card, Bar, btnPrimary, btnGhost, btnCyan, Badge } from '../components/Page';
import { useProfile, useSettings } from '../engine/store';
import { allQuestions, useStaticData } from '../engine/bank';
import {
  dueCount,
  levelFromXp,
  paceLabel,
  recommend,
  sessionLength,
  summarize,
  xpForLevel,
} from '../engine/adaptive';

const short = (t: string) =>
  (t.includes(':') ? t.split(':')[0].replace(/^My notes$/, 'Notes') : t.replace(/^(Master|Explore) /, '')).slice(0, 18);

const tierColor = (m: number) =>
  m >= 0.8 ? '#38BDF8' : m >= 0.55 ? '#8B5CF6' : m >= 0.35 ? '#A78BFA' : '#64748B';

const rankTitle = (lvl: number) => {
  if (lvl >= 10) return 'Galactic Master';
  if (lvl >= 7) return 'Cosmic Scholar';
  if (lvl >= 4) return 'Nebula Explorer';
  if (lvl >= 2) return 'Star Pioneer';
  return 'Cosmic Cadet';
};

export const Dashboard = () => {
  const nav = useNavigate();
  const p = useProfile();
  const s = useSettings();
  const { data, error } = useStaticData();

  const view = useMemo(() => {
    if (!data) return null;
    const bank = allQuestions(data, p);
    const sum = summarize(p, bank);
    const cardIds = [
      ...data.subjects.flatMap((x) => x.cards.map((c) => `s${x.id}-${c.id}`)),
      ...p.notes.flatMap((n) => n.cards.map((c) => c.id)),
    ];
    const due = dueCount(p, cardIds);
    const attempted = sum.filter((x) => x.attempts >= 2).sort((a, b) => b.mastery - a.mastery);
    return {
      sum,
      due,
      recs: recommend(p, bank, due),
      strong: attempted.filter((x) => x.mastery >= 0.5).slice(0, 3),
      weak: [...attempted].reverse().filter((x) => x.mastery < 0.5).slice(0, 3),
    };
  }, [data, p]);

  const lvl = levelFromXp(p.xp);
  const into = (p.xp - xpForLevel(lvl)) / Math.max(1, xpForLevel(lvl + 1) - xpForLevel(lvl));
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const today = p.history.filter((a) => a.at >= startOfDay).length;
  const acc = p.answered ? Math.round((p.correct / p.answered) * 100) : 0;
  const pace = paceLabel(p.paceFactor);
  const hours = p.studyMs / 3_600_000;

  if (error) {
    return (
      <Page title="Dashboard">
        <Card className="border-stellar-error/30 text-stellar-error">
          <p className="font-semibold mb-1">Could not load course data: {error}</p>
          <p className="text-sm text-stellar-secondary">
            Connect to the internet once so offline course files can be stored locally on your device.
          </p>
        </Card>
      </Page>
    );
  }

  const topRec = view?.recs[0];

  return (
    <Page
      title={`Welcome back, ${s.name}`}
      subtitle="Your next breakthrough starts with one focused session. Everything runs privately on your device."
      badge={rankTitle(lvl)}
      actions={
        topRec && (
          <button
            onClick={() => nav(topRec.path)}
            className={btnPrimary}
            aria-label="Continue learning top recommendation"
          >
            <Rocket className="w-4 h-4" aria-hidden />
            <span>Launch Mission</span>
          </button>
        )
      }
    >
      {/* 5.2 Continue Learning Hero Highlight Card */}
      {topRec && (
        <div className="relative overflow-hidden rounded-2xl border border-stellar-cyan/30 bg-gradient-to-r from-stellar-card via-stellar-surface to-stellar-card p-5 sm:p-6 shadow-cyan-glow/20">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-stellar-cyan/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="cyan">Current Primary Mission</Badge>
                {view?.due ? <Badge variant="warning">{view.due} Flashcards Due</Badge> : null}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {topRec.title}
              </h2>
              <p className="text-sm text-stellar-secondary leading-relaxed">
                {topRec.reason}
              </p>
            </div>

            <button
              onClick={() => nav(topRec.path)}
              className={`${btnCyan} shrink-0 px-6 py-3 text-base shadow-lg`}
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* 5.3 Daily Learning Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Level & XP */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-stellar-secondary">Level Rank</span>
              <div className="p-1.5 rounded-lg bg-stellar-violet/20 text-stellar-purple">
                <Zap className="w-4 h-4" aria-hidden />
              </div>
            </div>
            <p className="cosmic-heading text-2xl sm:text-3xl font-extrabold text-white">
              Level {lvl}
            </p>
            <p className="text-xs text-stellar-secondary mt-0.5 mb-3">
              {p.xp} total XP · {rankTitle(lvl)}
            </p>
          </div>
          <Bar value={into} label="Progress to next level" />
        </Card>

        {/* Metric 2: Streak */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-stellar-secondary">Learning Streak</span>
              <div className="p-1.5 rounded-lg bg-stellar-warning/20 text-stellar-warning">
                <Flame className="w-4 h-4 fill-stellar-warning" aria-hidden />
              </div>
            </div>
            <p className="cosmic-heading text-2xl sm:text-3xl font-extrabold text-white">
              {p.streak} <span className="text-base font-medium text-stellar-secondary">day{p.streak === 1 ? '' : 's'}</span>
            </p>
            <p className="text-xs text-stellar-secondary mt-0.5 mb-2">
              Best record: <strong className="text-white">{p.bestStreak} days</strong>
            </p>
          </div>
          <p className="text-[11px] text-stellar-muted">
            {p.streak > 0 ? 'Keep the fire burning today!' : 'Complete 1 question to start your streak!'}
          </p>
        </Card>

        {/* Metric 3: Today's Goal */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-stellar-secondary">Daily Goal</span>
              <div className="p-1.5 rounded-lg bg-stellar-cyan/20 text-stellar-cyan">
                <Target className="w-4 h-4" aria-hidden />
              </div>
            </div>
            <p className="cosmic-heading text-2xl sm:text-3xl font-extrabold text-white">
              {today} <span className="text-base font-normal text-stellar-secondary">/ {s.dailyGoal}</span>
            </p>
            <p className="text-xs text-stellar-secondary mt-0.5 mb-3">
              {today >= s.dailyGoal ? 'Goal achieved today! 🎉' : `${s.dailyGoal - today} questions remaining`}
            </p>
          </div>
          <Bar value={Math.min(1, today / Math.max(1, s.dailyGoal))} label="Daily goal progress" />
        </Card>

        {/* Metric 4: Accuracy & Study Time */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-stellar-secondary">Accuracy & Focus</span>
              <div className="p-1.5 rounded-lg bg-stellar-success/20 text-stellar-success">
                <Clock className="w-4 h-4" aria-hidden />
              </div>
            </div>
            <p className="cosmic-heading text-2xl sm:text-3xl font-extrabold text-white">
              {acc}%
            </p>
            <p className="text-xs text-stellar-secondary mt-0.5">
              {p.answered} total answered ({p.correct} correct)
            </p>
          </div>
          <p className="text-xs text-stellar-muted mt-3">
            {hours < 1 ? `${Math.round(hours * 60)} minutes` : `${hours.toFixed(1)} hours`} studied
          </p>
        </Card>
      </div>

      {/* 5.4 & 5.5 Today's Learning Plan & Recommendations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-stellar-cyan" aria-hidden />
                Recommended Next Steps
              </h2>
              <p className="text-xs text-stellar-secondary mt-0.5">
                Personalized study missions based on your memory intervals and mastery
              </p>
            </div>
          </div>

          {!view ? (
            <div className="p-8 text-center text-stellar-secondary">
              <Sparkles className="w-6 h-6 animate-spin-medium mx-auto mb-2 text-stellar-cyan" />
              Calculating optimal study path…
            </div>
          ) : view.recs.length === 0 ? (
            <div className="p-6 rounded-xl bg-stellar-surface/60 border border-stellar-border text-center space-y-2">
              <p className="text-sm text-stellar-secondary">
                No immediate recommendations scheduled. You're fully caught up!
              </p>
              <button onClick={() => nav('/quests')} className={btnPrimary}>
                Explore All Practice Topics
              </button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {view.recs.map((r, i) => (
                <li
                  key={r.title + i}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-stellar-surface/60 border border-stellar-border hover:border-stellar-cyan/40 hover:bg-stellar-card transition-all group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white group-hover:text-stellar-cyan transition-colors truncate">
                        {r.title}
                      </span>
                      <Badge variant={r.kind === 'review' ? 'warning' : r.kind === 'flashcards' ? 'cyan' : 'violet'}>
                        {r.kind}
                      </Badge>
                    </div>
                    <p className="text-xs text-stellar-secondary truncate max-w-xl">
                      {r.reason}
                    </p>
                  </div>
                  <button
                    className={`${btnGhost} shrink-0 p-2 sm:px-3 text-xs`}
                    onClick={() => nav(r.path)}
                    aria-label={`Start: ${r.title}`}
                  >
                    <span className="hidden sm:inline">Start</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Learning Pace & Rhythm Card */}
        <Card className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-stellar-purple" aria-hidden />
              Cognitive Pace
            </h2>
            <div className="p-4 rounded-xl bg-stellar-surface/80 border border-stellar-border">
              <span className="text-xs uppercase font-semibold tracking-wider text-stellar-secondary">Rhythm Profile</span>
              <p className="cosmic-heading text-2xl font-bold text-stellar-cyan mt-1">
                {pace}
              </p>
              <p className="text-xs text-stellar-secondary mt-2 leading-relaxed">
                {pace === 'Deliberate'
                  ? 'You reflect carefully before answering. Sessions are kept compact with hints available anytime.'
                  : pace === 'Quick'
                  ? 'You move rapidly through questions. Sessions are lengthened to challenge your recall.'
                  : 'A balanced cognitive pace. Standard question pacing applied.'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-stellar-border/60">
            <div className="flex items-center justify-between text-xs text-stellar-secondary mb-1">
              <span>Adaptive session size:</span>
              <span className="font-semibold text-white">{sessionLength(p.paceFactor)} questions</span>
            </div>
            <button
              onClick={() => nav('/quests')}
              className={`${btnGhost} w-full text-xs justify-center`}
            >
              Start Adaptive Session
            </button>
          </div>
        </Card>
      </div>

      {/* 5.6 Knowledge Map & Topic Analysis */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Knowledge Constellation */}
        <Card className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-stellar-cyan" aria-hidden />
                Knowledge Constellation
              </h2>
              <p className="text-xs text-stellar-secondary">
                Interactive galaxy map: brighter stars indicate higher mastery; click any star to practise
              </p>
            </div>
          </div>

          {!view ? null : (
            <div className="relative rounded-2xl bg-gradient-to-b from-[#060812] to-[#0A0F22] p-4 border border-stellar-border/80 overflow-hidden">
              {/* Background ambient starfield */}
              <div className="absolute inset-0 stellar-stars opacity-40 pointer-events-none" />

              <svg viewBox="0 0 420 220" className="w-full h-auto select-none" aria-label="Knowledge Constellation Map">
                <defs>
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#080B16" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Central orbital guide rings */}
                <circle cx="210" cy="110" r="145" fill="none" stroke="#8B5CF6" strokeOpacity="0.1" strokeDasharray="4 4" />
                <circle cx="210" cy="110" r="85" fill="none" stroke="#38BDF8" strokeOpacity="0.1" strokeDasharray="3 3" />
                <circle cx="210" cy="110" r="30" fill="url(#centerGlow)" />

                {/* Topic constellation nodes */}
                {view.sum.map((t, i) => {
                  const n = view.sum.length;
                  const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                  const radiusX = 145;
                  const radiusY = 75;
                  const x = 210 + Math.cos(angle) * radiusX;
                  const y = 110 + Math.sin(angle) * radiusY;
                  const color = tierColor(t.mastery);

                  return (
                    <g
                      key={t.topic}
                      transform={`translate(${x},${y})`}
                      className="cursor-pointer group"
                      onClick={() => nav(`/quests?topic=${encodeURIComponent(t.topic)}`)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Topic: ${t.topic}, Mastery: ${Math.round(t.mastery * 100)}%`}
                    >
                      {/* Connecting filament to center */}
                      <line
                        x1={-x + 210}
                        y1={-y + 110}
                        x2={0}
                        y2={0}
                        stroke={color}
                        strokeOpacity="0.18"
                        strokeWidth="1"
                      />

                      {/* Halo pulse */}
                      <circle
                        r={12 + t.mastery * 10}
                        fill={color}
                        fillOpacity="0.12"
                        className="group-hover:scale-125 transition-transform"
                      />

                      {/* Star core */}
                      <circle
                        r={5 + t.mastery * 6}
                        fill={color}
                        fillOpacity={0.4 + t.mastery * 0.6}
                        stroke={color}
                        strokeWidth="1.5"
                        className="group-hover:stroke-white transition-all shadow-[0_0_10px_#38BDF8]"
                      />

                      {/* Star label */}
                      <text
                        y={18 + t.mastery * 4}
                        textAnchor="middle"
                        fontSize="8.5"
                        fill="#F8FAFC"
                        fillOpacity="0.85"
                        fontWeight="600"
                        className="group-hover:fill-white group-hover:text-[10px]"
                      >
                        {short(t.topic)}
                      </text>
                    </g>
                  );
                })}

                {/* Central Learner Node */}
                <circle cx="210" cy="110" r="16" fill="#131A30" stroke="#38BDF8" strokeWidth="2" />
                <circle cx="210" cy="110" r="6" fill="#38BDF8" />
                <text x="210" y="138" textAnchor="middle" fontSize="9" fill="#38BDF8" fontWeight="700">
                  You
                </text>
              </svg>

              <div className="flex items-center justify-between text-[11px] text-stellar-muted pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stellar-cyan" /> Mastered (&gt;80%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-stellar-violet" /> Developing (55-80%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" /> Untested (&lt;35%)
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Strengths & Growth Areas */}
        <Card className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Strengths & Growth
          </h2>

          {!view || (view.strong.length === 0 && view.weak.length === 0) ? (
            <div className="p-4 rounded-xl bg-stellar-surface/60 border border-stellar-border text-center">
              <p className="text-xs text-stellar-secondary leading-relaxed">
                Complete a few practice quizzes in two or more topics and your strongest areas and target growth spots will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {view.strong.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-stellar-success uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" aria-hidden />
                    Top Mastery Areas
                  </p>
                  <div className="space-y-2">
                    {view.strong.map((t) => (
                      <div
                        key={t.topic}
                        className="p-2.5 rounded-lg bg-stellar-surface/70 border border-stellar-border/80 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-white truncate max-w-[150px]">{t.topic}</span>
                        <span className="font-bold text-stellar-success">{Math.round(t.mastery * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view.weak.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-stellar-warning uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4" aria-hidden />
                    Recommended for Practice
                  </p>
                  <div className="space-y-2">
                    {view.weak.map((t) => (
                      <div
                        key={t.topic}
                        className="p-2.5 rounded-lg bg-stellar-surface/70 border border-stellar-border/80 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-white truncate max-w-[150px]">{t.topic}</span>
                        <button
                          onClick={() => nav(`/quests?topic=${encodeURIComponent(t.topic)}`)}
                          className="text-stellar-cyan hover:underline font-semibold"
                        >
                          Practise ({Math.round(t.mastery * 100)}%)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Hub Jump */}
          <div className="pt-2 border-t border-stellar-border/60">
            <button
              onClick={() => nav('/flashcards')}
              className={`${btnGhost} w-full text-xs justify-center`}
            >
              <Layers className="w-3.5 h-3.5 text-stellar-cyan" />
              <span>Review Flashcards {view && view.due > 0 ? `(${view.due} due)` : ''}</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Mastery by Topic Matrix */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-stellar-purple" aria-hidden />
              Topic Mastery Matrix
            </h2>
            <p className="text-xs text-stellar-secondary">
              Real-time Bayesian knowledge levels across all subjects and uploaded materials
            </p>
          </div>
        </div>

        {!view ? null : (
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
            {[...view.sum]
              .sort((a, b) => a.subject.localeCompare(b.subject))
              .map((t) => (
                <div key={t.topic} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-white truncate max-w-[200px]">{t.topic}</span>
                    <span className="text-stellar-secondary font-mono">
                      {t.attempts
                        ? `${Math.round(t.mastery * 100)}% (${t.attempts} Qs)`
                        : 'Unexplored'}
                    </span>
                  </div>
                  <Bar value={t.attempts ? t.mastery : 0} label={`${t.topic} mastery`} height="h-1.5" />
                </div>
              ))}
          </div>
        )}
      </Card>
    </Page>
  );
};
