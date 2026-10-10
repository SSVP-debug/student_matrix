import {
  LayoutDashboard,
  Target,
  FileText,
  Bot,
  CreditCard,
  Award,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile, useSettings } from '../engine/store';
import { levelFromXp } from '../engine/adaptive';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'quests', label: 'Missions', icon: Target, path: '/quests' },
  { id: 'learnhub', label: 'LearnHub', icon: FileText, path: '/learnhub' },
  { id: 'mentor', label: 'AI Mentor', icon: Bot, path: '/mentor' },
  { id: 'flashcards', label: 'Flashcards', icon: CreditCard, path: '/flashcards' },
  { id: 'achievements', label: 'Achievements', icon: Award, path: '/achievements' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const p = useProfile();
  const s = useSettings();

  const currentPath = location.pathname;
  const lvl = levelFromXp(p.xp);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group focus:outline-none text-left"
        >
          {/* Glowing blue celestial orb icon */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-400 blur-sm opacity-70 animate-pulse" />
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#93c5fd] shadow-[0_0_15px_#38bdf8]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            StellarLearn
          </span>
        </button>

        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="md:hidden p-2 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav aria-label="Main navigation" className="flex-1 space-y-2">
        {navItems.map(({ id, label, icon: Icon, path }) => {
          const active = currentPath === path || (path === '/dashboard' && currentPath === '/');
          return (
            <button
              key={id}
              onClick={() => go(path)}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-[#9ca3af] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${active ? 'text-black' : 'text-[#9ca3af]'}`}
                aria-hidden
              />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Sign Out Box */}
      <div className="mt-auto pt-4 border-t border-[#171a24] space-y-2.5">
        <div className="bg-[#0c0d12] border border-[#171a24] rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1c202d] text-white/90 flex items-center justify-center font-bold text-xs shrink-0">
            P
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-bold truncate leading-tight">
              {s.name === 'Zero' || !s.name ? 'Cosmic Learner' : s.name}
            </p>
            <p className="text-[#6b7280] text-[11px] leading-tight mt-0.5">
              Level {lvl || 15} Explorer
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#9ca3af] hover:text-white bg-[#0c0d12] border border-[#171a24] hover:border-white/20 transition-all text-center"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-xl focus:outline-none"
      >
        Skip to content
      </a>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#08090d]/95 backdrop-blur-xl border-b border-[#1e2230] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#93c5fd] shadow-[0_0_10px_#38bdf8]" />
          <span className="text-lg font-bold text-white tracking-tight">StellarLearn</span>
        </div>
        <button
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl text-[#9ca3af] hover:text-white bg-[#0e1017] border border-[#1e2230]"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 shrink-0 bg-[#000000] border-r border-[#151822] p-5 flex-col z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {open && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-[#000000] border-r border-[#151822] p-5 flex flex-col z-50 overflow-y-auto">
            {content}
          </aside>
        </>
      )}
    </>
  );
};
