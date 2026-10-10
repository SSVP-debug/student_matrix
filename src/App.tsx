import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { useSettings } from './engine/store';

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

function App() {
  useApplySettings();
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0F2D] to-black">
        <Suspense fallback={<p className="p-8 text-white/70" role="status">Loading…</p>}>
          <Routes>
            <Route path="/" element={<Landing />} />
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
