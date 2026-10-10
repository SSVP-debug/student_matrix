import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { useSettings } from './engine/store';
import { Loader2 } from 'lucide-react';
import { Logo } from './components/Logo';

const lazyPage = <K extends string>(loader: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  lazy(async () => ({ default: (await loader())[name] }));

const Dashboard = lazyPage(() => import('./pages/Dashboard'), 'Dashboard');
const Quests = lazyPage(() => import('./pages/Quests'), 'Quests');
const LearnHub = lazyPage(() => import('./pages/LearnHub'), 'LearnHub');
const Mentor = lazyPage(() => import('./pages/Mentor'), 'Mentor');
const Flashcards = lazyPage(() => import('./pages/Flashcards'), 'Flashcards');
const Achievements = lazyPage(() => import('./pages/Achievements'), 'Achievements');
const Settings = lazyPage(() => import('./pages/Settings'), 'Settings');

function useApplySettings() {
  const s = useSettings();
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--scale', String(s.textScale));
    r.toggleAttribute('data-dyslexia', s.dyslexiaFont);
    r.toggleAttribute('data-contrast', s.highContrast);
    r.toggleAttribute('data-lite', s.liteMode);
    r.toggleAttribute('data-reduce-motion', s.reduceMotion || s.liteMode);
  }, [s]);
}

const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-stellar-bg space-y-4" role="status">
    <div className="relative">
      <Logo size={56} />
      <div className="absolute -inset-2 rounded-full border border-stellar-cyan/30 animate-spin-slow pointer-events-none" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-white tracking-wide flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-stellar-cyan" />
        <span>Initializing LearnAI…</span>
      </p>
      <p className="text-xs text-stellar-secondary">Loading on-device learning matrix</p>
    </div>
  </div>
);

function App() {
  useApplySettings();
  return (
    <Router>
      <div className="min-h-screen bg-stellar-bg text-stellar-text selection:bg-stellar-violet/30 selection:text-white">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/learnhub" element={<LearnHub />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
