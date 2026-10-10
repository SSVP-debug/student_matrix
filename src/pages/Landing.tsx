import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Sparkles,
  Target,
  ShieldCheck,
  BookOpen,
  Bot,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  Atom,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { btnPrimary } from '../components/Page';
import { useSettings, updateSettings } from '../engine/store';

export const Landing = () => {
  const navigate = useNavigate();
  const currentSettings = useSettings();

  // Authentication State
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState(currentSettings.name !== 'Learner' ? currentSettings.name : '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(currentSettings.dailyGoal || 10);
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const learnerName = name.trim() || 'Cosmic Learner';
      updateSettings({
        name: learnerName,
        dailyGoal,
      });
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleGuestLaunch = () => {
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stellar-bg text-stellar-text selection:bg-stellar-violet/30 selection:text-white">
      {/* Background Ambient Cosmic Starfield */}
      <div className="absolute inset-0 stellar-stars opacity-45 pointer-events-none" />

      {/* Atmospheric Radial Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-stellar-violet/15 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-stellar-cyan/10 blur-[130px] pointer-events-none" />

      {/* Header Navigation */}
      <header className="relative z-30 flex items-center justify-between px-5 sm:px-8 py-5 max-w-7xl mx-auto border-b border-stellar-border/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Logo size={42} showWordmark />
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stellar-secondary">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#privacy" className="hover:text-white transition-colors">
            Privacy
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGuestLaunch}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-stellar-secondary hover:text-white border border-stellar-border hover:bg-stellar-card transition-all"
          >
            <span>Instant Explorer</span>
          </button>
          <button
            onClick={() => document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth' })}
            className="cosmic-button text-sm px-5 py-2 rounded-xl flex items-center gap-2"
          >
            <span>Launch LearnAI</span>
            <Rocket className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero & Two-Column Authentication Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Vision & Planetary AI Orbit Visual */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stellar-violet/15 border border-stellar-violet/30 text-xs font-semibold text-stellar-purple shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-stellar-cyan" />
              <span>Cosmic Personalized Learning Assistant</span>
            </div>

            <div className="space-y-4">
              <h1 className="cosmic-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                Master Any Subject Across{' '}
                <span className="cosmic-gradient-text">The Cosmos</span>
              </h1>
              <p className="text-base sm:text-lg text-stellar-secondary max-w-xl leading-relaxed">
                LearnAI transforms your study journey into an intelligent cosmic expedition.
                Experience on-device Bayesian adaptive quizzes, SM-2 spaced repetition, and a focused AI tutor that runs 100% privately on your machine.
              </p>
            </div>

            {/* Original CSS Orbital Visual (no static images or copyrighted art) */}
            <div className="relative py-4 hidden sm:block">
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  {/* Outer orbit */}
                  <div className="absolute inset-0 rounded-full border border-stellar-cyan/30 animate-spin-slow" />
                  {/* Middle orbit */}
                  <div className="absolute inset-2.5 rounded-full border border-stellar-violet/40 animate-spin-medium" />
                  {/* Central radiant node */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-stellar-violet to-stellar-cyan flex items-center justify-center shadow-cyan-glow text-white">
                    <Atom className="w-6 h-6 animate-pulse" />
                  </div>
                  {/* Satellite planet nodes */}
                  <div className="absolute -top-1 left-1/2 w-3.5 h-3.5 rounded-full bg-stellar-cyan shadow-[0_0_8px_#38BDF8]" />
                  <div className="absolute bottom-2 -right-1 w-2.5 h-2.5 rounded-full bg-stellar-purple shadow-[0_0_6px_#A78BFA]" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4 text-stellar-success" />
                    <span>Zero Cloud Profiling · Offline First</span>
                  </div>
                  <p className="text-xs text-stellar-secondary leading-relaxed max-w-md">
                    Everything—from PDF summarization to flashcard scheduling—is calculated locally in your browser. No servers track your mistakes.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg border-t border-stellar-border/60">
              <div className="space-y-0.5">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-stellar-muted">On-Device Privacy</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold text-stellar-cyan">BKT + Elo</div>
                <div className="text-xs text-stellar-muted">Adaptive Algorithm</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold text-stellar-purple">SM-2</div>
                <div className="text-xs text-stellar-muted">Spaced Repetition</div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Authentication Experience (Phase 11) */}
          <div className="lg:col-span-5" id="auth-card">
            <div className="glass-card p-6 sm:p-8 border border-stellar-border/80 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-stellar-violet/10 rounded-full blur-2xl pointer-events-none" />

              {/* Mode Toggle Header */}
              <div className="flex rounded-xl bg-stellar-surface p-1 mb-6 border border-stellar-border">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'signin'
                      ? 'bg-stellar-violet text-white shadow-md'
                      : 'text-stellar-secondary hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-stellar-violet text-white shadow-md'
                      : 'text-stellar-secondary hover:text-white'
                  }`}
                >
                  New Explorer
                </button>
              </div>

              <div className="mb-5 space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {authMode === 'signin' ? 'Welcome to LearnAI' : 'Create Learner Profile'}
                </h2>
                <p className="text-xs text-stellar-secondary">
                  {authMode === 'signin'
                    ? 'Enter your explorer handle or email to continue your streak.'
                    : 'Configure your personalized study identity on this machine.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-semibold text-stellar-secondary mb-1.5">
                    Learner Name or Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stellar-muted">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex or alex@cosmos.edu"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stellar-surface border border-stellar-border focus:border-stellar-cyan/50 focus:ring-1 focus:ring-stellar-cyan/30 text-sm text-white placeholder-stellar-muted transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="auth-pass" className="text-xs font-semibold text-stellar-secondary">
                      Access Passcode / Password
                    </label>
                    <span className="text-[11px] text-stellar-muted">(Stored on device)</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stellar-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-pass"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-stellar-surface border border-stellar-border focus:border-stellar-cyan/50 focus:ring-1 focus:ring-stellar-cyan/30 text-sm text-white placeholder-stellar-muted transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stellar-muted hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="auth-goal" className="text-xs font-semibold text-stellar-secondary">
                        Daily Question Target
                      </label>
                      <span className="font-bold text-xs text-stellar-cyan">{dailyGoal} questions / day</span>
                    </div>
                    <input
                      id="auth-goal"
                      type="range"
                      min={5}
                      max={30}
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(Number(e.target.value))}
                      className="w-full accent-stellar-cyan"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="cosmic-button w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <span>Launching Spaceport…</span>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Enter Learning Realm' : 'Start Cosmic Adventure'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Guest Mode */}
              <div className="mt-4 pt-4 border-t border-stellar-border/60 text-center space-y-2">
                <button
                  type="button"
                  onClick={handleGuestLaunch}
                  className="text-xs font-semibold text-stellar-cyan hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span>Or enter immediately as Instant Explorer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] text-stellar-muted">
                  No account setup required. You can export or reset your progress anytime in Settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars Features Section */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-stellar-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-stellar-cyan">
            Advanced Architecture
          </span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl font-extrabold text-white">
            Powered by Cognitive Science & On-Device AI
          </h2>
          <p className="text-sm sm:text-base text-stellar-secondary leading-relaxed">
            Every feature in LearnAI is tuned to maximize long-term retention while eliminating digital distractions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: 'Bayesian Knowledge Tracing',
              desc: 'Estimates your exact probability of knowing each concept in real time, adapting question difficulty so you stay right in the zone of proximal development.',
              badge: 'Adaptive Engine',
            },
            {
              icon: Bot,
              title: 'Private AI Learning Tutor',
              desc: 'Grounded retrieval assistant that answers questions using your lecture notes and textbook content. Works without an internet connection or sends prompts to local Ollama.',
              badge: 'Offline Tutor',
            },
            {
              icon: Layers,
              title: 'Supermemo SM-2 Spaced Cards',
              desc: 'Scientifically calculated review schedules. Tough concepts return quickly, while mastered knowledge fades into optimal review cycles.',
              badge: 'Memory Retention',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="glass-card p-6 sm:p-7 space-y-4 border border-stellar-border hover:border-stellar-cyan/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-stellar-surface border border-stellar-border flex items-center justify-center text-stellar-cyan group-hover:scale-110 group-hover:border-stellar-cyan/50 transition-all shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stellar-purple">
                    {f.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-stellar-secondary leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Galaxy Grid */}
      <section id="architecture" className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 py-20 border-t border-stellar-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-stellar-purple">
            Cosmic Tools Suite
          </span>
          <h2 className="cosmic-heading text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Excel
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Adaptive Quests',
              desc: 'Dynamic practice quizzes targeting weak spots with 50:50 hints and immediate feedback.',
              path: '/quests',
              icon: Target,
            },
            {
              name: 'LearnHub',
              desc: 'Upload PDFs or paste passages to generate study summaries, key concepts, and questions.',
              path: '/learnhub',
              icon: BookOpen,
            },
            {
              name: 'AI Companion',
              desc: 'Multi-level explanations from simple analogies to deep academic analyses.',
              path: '/mentor',
              icon: Bot,
            },
            {
              name: 'Spaced Flashcards',
              desc: 'Interactive 3D flashcards with 4-point rating and due-date tracking.',
              path: '/flashcards',
              icon: Layers,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glass-card p-6 flex flex-col justify-between border border-stellar-border hover:border-stellar-cyan/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-stellar-surface border border-stellar-border flex items-center justify-center text-stellar-cyan">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">{item.name}</h3>
                  <p className="text-xs text-stellar-secondary leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-5 mt-4 border-t border-stellar-border/50">
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-xs font-semibold text-stellar-cyan hover:underline flex items-center gap-1 group/btn"
                  >
                    <span>Launch Feature</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy Guarantee Banner */}
      <section id="privacy" className="relative z-20 max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="glass-card p-8 sm:p-12 border border-stellar-cyan/30 text-center space-y-5 relative overflow-hidden shadow-cyan-glow/20">
          <div className="w-14 h-14 rounded-2xl bg-stellar-cyan/15 border border-stellar-cyan/30 flex items-center justify-center mx-auto text-stellar-cyan">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Privacy First. Always.
            </h2>
            <p className="text-xs sm:text-sm text-stellar-secondary leading-relaxed">
              We believe your learning struggles and study notes belong to you. LearnAI does not require an account, has zero trackers, and never transmits your homework to the cloud.
            </p>
          </div>
          <div className="pt-2">
            <button onClick={handleGuestLaunch} className={`${btnPrimary} px-8 py-3.5 text-base`}>
              <span>Enter Cosmic Academy</span>
              <Rocket className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-stellar-border/60 bg-stellar-surface/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={34} showWordmark />
          </div>

          <p className="text-xs text-stellar-muted text-center md:text-left">
            © {new Date().getFullYear()} LearnAI. Stellar-inspired personalized learning assistant. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs text-stellar-secondary">
            <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate('/quests')} className="hover:text-white transition-colors">
              Practice
            </button>
            <button onClick={() => navigate('/learnhub')} className="hover:text-white transition-colors">
              Notes
            </button>
            <button onClick={() => navigate('/settings')} className="hover:text-white transition-colors">
              Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};